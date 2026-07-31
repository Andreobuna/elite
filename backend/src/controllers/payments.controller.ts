import axios from 'axios';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthedRequest } from '../middleware/auth';

async function finalizePaystackPayment(reference: string, userId?: string) {
  const trimmed = String(reference || '').trim();
  if (!trimmed) throw new AppError('Payment reference is required.', 400);
  if (!env.paystack.secretKey) throw new AppError('Paystack secret key is not configured.', 500);

  const payment = await prisma.payment.findFirst({
    where: { provider: 'PAYSTACK', providerRef: trimmed },
    include: { order: true },
  });
  if (!payment) throw new AppError('Payment session not found.', 404);
  if (userId && payment.order.userId !== userId) throw new AppError('You cannot verify another user payment.', 403);
  if (payment.status === PaymentStatus.SUCCEEDED && payment.order.status === OrderStatus.PAID) {
    return { payment, order: payment.order, alreadyVerified: true };
  }

  const verifyUrl = 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(trimmed);
  const { data } = await axios.get(verifyUrl, { headers: { Authorization: 'Bearer ' + env.paystack.secretKey } });
  const tx = data?.data;
  if (!tx || String(tx.status).toLowerCase() !== 'success') throw new AppError('Payment was not successful.', 400);
  if (Number(tx.amount) !== Number(payment.amount) * 100) throw new AppError('Verified amount does not match the order total.', 400);

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.SUCCEEDED, currency: tx.currency ?? payment.currency, providerRef: tx.reference ?? trimmed },
  });
  await prisma.transaction.create({ data: { paymentId: payment.id, type: 'charge', amount: payment.amount, rawPayload: tx } });
  const updatedOrder = await prisma.order.update({ where: { id: payment.orderId }, data: { status: OrderStatus.PAID } });
  return { payment: updatedPayment, order: updatedOrder, alreadyVerified: false };
}

export async function verifyPaystackPayment(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const reference = String(req.body?.reference ?? req.query.reference ?? '').trim();
    const result = await finalizePaystackPayment(reference, req.user?.sub);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handlePaystackWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!env.paystack.secretKey) throw new AppError('Paystack secret key is not configured.', 500);
    const signature = req.headers['x-paystack-signature'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    const computed = crypto.createHmac('sha512', env.paystack.secretKey).update(rawBody).digest('hex');
    if (typeof signature !== 'string' || signature !== computed) throw new AppError('Invalid Paystack signature.', 401);

    const payload = JSON.parse(rawBody.toString('utf8'));
    if (payload?.event === 'charge.success' && payload?.data?.reference) {
      await finalizePaystackPayment(String(payload.data.reference));
    }
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
