import axios from "axios";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

export async function createCJOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      address: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const payload = {
    orderNumber: order.orderNumber,
    shippingAddress: {
      name: order.address.fullName,
      address1: order.address.line1,
      address2: order.address.line2,
      city: order.address.city,
      state: order.address.state,
      zip: order.address.postalCode,
      country: order.address.country,
      phone: order.address.phone,
    },
    products: order.items.map((item) => ({
      productId: item.product.aliexpressId,
      quantity: item.quantity,
      sku: item.variant?.sku,
    })),
  };

  const response = await axios.post(
    `${env.cj.baseUrl}/shopping/order/createOrder`,
    payload,
    {
      headers: {
        "CJ-Access-Token": env.cj.accessToken,
        "Content-Type": "application/json",
      },
    }
  );

  const cjOrderId = response.data?.data?.orderId;

  if (cjOrderId) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        cjOrderId,
      },
    });
  }

  return response.data;
}