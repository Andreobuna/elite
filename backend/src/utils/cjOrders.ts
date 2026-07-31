import axios from 'axios';
import { CjFulfillmentStatus, FulfillmentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from './logger';

const MANUAL_PRODUCT_PREFIX = 'MANUAL-';
const PROCESSING_STALE_WINDOW_MS = 10 * 60 * 1000;

type CjOrderItem = {
  id: string;
  quantity: number;
  fulfillmentStatus: FulfillmentStatus;
  product: {
    aliexpressId: string | null;
    variants: Array<{ id: string }>;
  };
  variant: { sku: string } | null;
};

type CjOrderAddress = {
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string;
};

type CjOrderRecord = {
  id: string;
  orderNumber: string;
  cjOrderId: string | null;
  cjFulfillmentStatus: CjFulfillmentStatus;
  updatedAt: Date;
  items: CjOrderItem[];
  address: CjOrderAddress;
};

type CjEligibleItem = {
  itemId: string;
  productId: string;
  quantity: number;
  sku?: string;
};

type CjReviewItem = {
  itemId: string;
  reason: string;
};

export type CjFulfillmentResult = {
  orderId: string;
  orderNumber: string;
  cjOrderId: string | null;
  eligibleItems: number;
  manualReviewItems: number;
  skipped: boolean;
  status: CjFulfillmentStatus;
};

export function isCJLinkedProduct(product: { aliexpressId: string | null | undefined }) {
  const identifier = product.aliexpressId?.trim();
  return Boolean(identifier && !identifier.startsWith(MANUAL_PRODUCT_PREFIX));
}

async function loadOrder(orderId: string): Promise<CjOrderRecord | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      cjOrderId: true,
      cjFulfillmentStatus: true,
      updatedAt: true,
      address: true,
      items: {
        select: {
          id: true,
          quantity: true,
          fulfillmentStatus: true,
          product: {
            select: {
              aliexpressId: true,
              variants: {
                select: { id: true },
              },
            },
          },
          variant: {
            select: { sku: true },
          },
        },
      },
    },
  });
}

function extractCjOrderId(response: any): string | null {
  const candidate = response?.data?.data?.orderId ?? response?.data?.data?.cjOrderId ?? response?.data?.data?.orderNo ?? response?.data?.orderId ?? response?.data?.orderNo;
  const value = String(candidate ?? '').trim();
  return value || null;
}

function buildShippingAddress(address: CjOrderAddress) {
  return {
    name: address.fullName,
    address1: address.line1,
    address2: address.line2 ?? '',
    city: address.city,
    state: address.state ?? '',
    zip: address.postalCode,
    country: address.country,
    phone: address.phone,
  };
}

function evaluateItem(item: CjOrderItem): { eligible?: CjEligibleItem; review?: CjReviewItem } {
  if (!isCJLinkedProduct(item.product)) {
    return {};
  }

  const productId = item.product.aliexpressId?.trim();
  if (!productId) {
    return {
      review: {
        itemId: item.id,
        reason: 'CJ product is missing its CJ product identifier.',
      },
    };
  }

  const needsVariantSku = item.product.variants.length > 0;
  const sku = item.variant?.sku?.trim();
  if (needsVariantSku && !sku) {
    return {
      review: {
        itemId: item.id,
        reason: 'CJ product variant is missing its CJ SKU.',
      },
    };
  }

  return {
    eligible: {
      itemId: item.id,
      productId,
      quantity: item.quantity,
      sku: sku || undefined,
    },
  };
}

async function updateItemStatuses(itemIds: string[], data: { fulfillmentStatus: FulfillmentStatus; fulfillmentNotes?: string | null }) {
  if (!itemIds.length) {
    return;
  }

  await prisma.orderItem.updateMany({
    where: { id: { in: itemIds } },
    data,
  });
}

export async function createCJOrder(orderId: string): Promise<CjFulfillmentResult> {
  const order = await loadOrder(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (order.cjOrderId && order.cjFulfillmentStatus === 'COMPLETED') {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      cjOrderId: order.cjOrderId,
      eligibleItems: 0,
      manualReviewItems: 0,
      skipped: true,
      status: 'COMPLETED',
    };
  }

  if (order.cjFulfillmentStatus === 'PROCESSING') {
    const processingAgeMs = Date.now() - new Date(order.updatedAt).getTime();
    if (processingAgeMs < PROCESSING_STALE_WINDOW_MS) {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        cjOrderId: order.cjOrderId,
        eligibleItems: 0,
        manualReviewItems: 0,
        skipped: true,
        status: 'PROCESSING',
      };
    }
  }

  const eligibleItems: CjEligibleItem[] = [];
  const reviewItems: CjReviewItem[] = [];

  for (const item of order.items) {
    const result = evaluateItem(item);
    if (result.eligible) {
      eligibleItems.push(result.eligible);
      continue;
    }
    if (result.review) {
      reviewItems.push(result.review);
    }
  }

  if (!eligibleItems.length) {
    if (reviewItems.length) {
      const reviewReason = reviewItems.map((item) => item.reason).join(' ');
      await updateItemStatuses(
        reviewItems.map((item) => item.itemId),
        { fulfillmentStatus: 'MANUAL_REVIEW', fulfillmentNotes: reviewReason }
      );
      await prisma.order.update({
        where: { id: order.id },
        data: {
          cjFulfillmentStatus: 'MANUAL_REVIEW',
          cjFulfillmentError: reviewReason,
        },
      });

      logger.warn('[cj] Order requires manual review before CJ fulfillment', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reviewItems,
      });

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        cjOrderId: null,
        eligibleItems: 0,
        manualReviewItems: reviewItems.length,
        skipped: false,
        status: 'MANUAL_REVIEW',
      };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        cjFulfillmentStatus: 'NOT_REQUIRED',
        cjFulfillmentError: null,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      cjOrderId: null,
      eligibleItems: 0,
      manualReviewItems: 0,
      skipped: true,
      status: 'NOT_REQUIRED',
    };
  }

  const reviewReason = reviewItems.map((item) => item.reason).join(' ');

  await updateItemStatuses(
    eligibleItems.map((item) => item.itemId),
    { fulfillmentStatus: 'PENDING' }
  );
  await updateItemStatuses(
    reviewItems.map((item) => item.itemId),
    { fulfillmentStatus: 'MANUAL_REVIEW', fulfillmentNotes: reviewReason }
  );

  await prisma.order.update({
    where: { id: order.id },
    data: {
      cjFulfillmentStatus: 'PROCESSING',
      cjFulfillmentError: null,
    },
  });

  const payload = {
    orderNumber: order.orderNumber,
    shippingAddress: buildShippingAddress(order.address),
    products: eligibleItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      ...(item.sku ? { sku: item.sku } : {}),
    })),
  };

  logger.info('[cj] Submitting CJ order', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    eligibleItems: eligibleItems.length,
    manualReviewItems: reviewItems.length,
  });

  try {
    const response = await axios.post(
      env.cj.baseUrl + '/shopping/order/createOrder',
      payload,
      {
        headers: {
          'CJ-Access-Token': env.cj.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const cjOrderId = extractCjOrderId(response.data);
    if (!cjOrderId) {
      throw new Error('CJ API did not return an order ID.');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        cjOrderId,
        cjFulfillmentStatus: reviewItems.length ? 'PARTIAL' : 'COMPLETED',
        cjFulfillmentError: reviewItems.length ? reviewReason : null,
      },
    });

    await updateItemStatuses(
      eligibleItems.map((item) => item.itemId),
      { fulfillmentStatus: 'SENT' }
    );

    if (reviewItems.length) {
      await updateItemStatuses(
        reviewItems.map((item) => item.itemId),
        { fulfillmentStatus: 'MANUAL_REVIEW', fulfillmentNotes: reviewReason }
      );
      logger.warn('[cj] Some order items require manual review', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reviewItems,
      });
    }

    logger.info('[cj] CJ order created successfully', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      cjOrderId,
      eligibleItems: eligibleItems.length,
      manualReviewItems: reviewItems.length,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      cjOrderId,
      eligibleItems: eligibleItems.length,
      manualReviewItems: reviewItems.length,
      skipped: false,
      status: reviewItems.length ? 'PARTIAL' : 'COMPLETED',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create CJ order.';

    await prisma.order.update({
      where: { id: order.id },
      data: {
        cjFulfillmentStatus: 'FAILED',
        cjFulfillmentError: message,
      },
    });

    await updateItemStatuses(
      eligibleItems.map((item) => item.itemId),
      { fulfillmentStatus: 'FAILED', fulfillmentNotes: message }
    );

    logger.error('[cj] Failed to create CJ order', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      eligibleItems: eligibleItems.length,
      manualReviewItems: reviewItems.length,
      error: message,
    });

    throw error;
  }
}
