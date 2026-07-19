import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: env.smtp.host || 'localhost',
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

async function send(to: string, subject: string, html: string) {
  // If SMTP isn't configured yet, log instead of throwing so auth flows
  // remain testable before real email credentials are added.
  if (!env.smtp.host || !env.smtp.user) {
    logger.warn(`[mailer] SMTP not configured — would have sent "${subject}" to ${to}`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

const wrapper = (title: string, body: string) => `
  <div style="background:#0b0b0d;padding:40px 0;font-family:Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#141416;border:1px solid #d4af3733;border-radius:12px;padding:32px;color:#eee;">
      <h1 style="color:#d4af37;font-size:20px;letter-spacing:1px;margin-top:0;">ELITE X SHOP</h1>
      <h2 style="color:#fff;font-size:18px;">${title}</h2>
      <div style="color:#ccc;font-size:14px;line-height:1.6;">${body}</div>
      <p style="color:#666;font-size:12px;margin-top:32px;">© ${new Date().getFullYear()} Elite X Shop. All rights reserved.</p>
    </div>
  </div>
`;

export async function sendWelcomeEmail(to: string, firstName: string) {
  await send(
    to,
    'Welcome to Elite X Shop',
    wrapper('Welcome aboard', `<p>Hi ${firstName}, thanks for joining Elite X Shop. Your account is ready to use.</p>`)
  );
}

export async function sendVerificationEmail(to: string, firstName: string, verifyUrl: string) {
  await send(
    to,
    'Verify your email — Elite X Shop',
    wrapper(
      'Confirm your email address',
      `<p>Hi ${firstName}, please confirm your email to activate your account.</p>
       <p><a href="${verifyUrl}" style="color:#0b0b0d;background:#d4af37;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a></p>
       <p>Or copy this link: ${verifyUrl}</p>
       <p>This link expires in 24 hours.</p>`
    )
  );
}

export async function sendPasswordResetEmail(to: string, firstName: string, resetUrl: string) {
  await send(
    to,
    'Reset your password — Elite X Shop',
    wrapper(
      'Reset your password',
      `<p>Hi ${firstName}, we received a request to reset your password.</p>
       <p><a href="${resetUrl}" style="color:#0b0b0d;background:#d4af37;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
       <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>`
    )
  );
}

export async function sendOrderConfirmationEmail(to: string, firstName: string, orderNumber: string, total: string) {
  await send(
    to,
    `Order Confirmed — #${orderNumber}`,
    wrapper(
      'Your order is confirmed',
      `<p>Hi ${firstName}, thank you for your order <strong>#${orderNumber}</strong>.</p>
       <p>Order total: <strong>${total}</strong></p>
       <p>We'll email you again once it ships.</p>`
    )
  );
}

export async function sendShippingUpdateEmail(to: string, firstName: string, orderNumber: string, status: string, tracking?: string) {
  await send(
    to,
    `Shipping Update — Order #${orderNumber}`,
    wrapper(
      'Your order has shipped',
      `<p>Hi ${firstName}, your order <strong>#${orderNumber}</strong> status is now: <strong>${status}</strong>.</p>
       ${tracking ? `<p>Tracking number: ${tracking}</p>` : ''}`
    )
  );
}
