import dotenv from 'dotenv';
dotenv.config();

function req(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // We don't throw here for optional third-party keys (Stripe, AliExpress, etc.)
    // so the app still boots in a partially-configured dev environment.
    return '';
  }
  return String(value).trim();
}

export const env = {
  port: parseInt(req('APP_PORT', req('PORT', '4001')), 10),
  nodeEnv: req('NODE_ENV', 'development'),
  clientUrl: req('CLIENT_URL', 'http://localhost:3000'),

  databaseUrl: req('DATABASE_URL'),
  databaseUrlPooler: req('DATABASE_URL_POOLER'),
  directUrl: req('DIRECT_URL'),

  jwt: {
    accessSecret: req('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
    refreshSecret: req('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
    accessExpiresIn: req('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: req('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  aliexpress: {
    appKey: req('ALIEXPRESS_APP_KEY', req('CJ_API_KEY')),
    appSecret: req('ALIEXPRESS_APP_SECRET', req('CJ_API_SECRET')),
    session: req('ALIEXPRESS_SESSION', req('CJ_SESSION')),
    baseUrl: req('ALIEXPRESS_API_BASE_URL', 'https://eco.taobao.com/router/rest'),
    country: req('ALIEXPRESS_COUNTRY', 'US'),
    language: req('ALIEXPRESS_LANGUAGE', 'en'),
    signMethod: req('ALIEXPRESS_SIGN_METHOD', 'md5'),
  },

  defaultMarkupPercent: parseFloat(req('DEFAULT_MARKUP_PERCENT', '10')),

  cloudinary: {
    cloudName: req('CLOUDINARY_CLOUD_NAME'),
    apiKey: req('CLOUDINARY_API_KEY'),
    apiSecret: req('CLOUDINARY_API_SECRET'),
  },

  stripe: {
    secretKey: req('STRIPE_SECRET_KEY'),
    webhookSecret: req('STRIPE_WEBHOOK_SECRET'),
  },
  paypal: {
    clientId: req('PAYPAL_CLIENT_ID'),
    clientSecret: req('PAYPAL_CLIENT_SECRET'),
    mode: req('PAYPAL_MODE', 'sandbox'),
  },
  paystack: {
    secretKey: req('PAYSTACK_SECRET_KEY'),
  },
  flutterwave: {
    secretKey: req('FLUTTERWAVE_SECRET_KEY'),
  },

  smtp: {
    host: req('SMTP_HOST'),
    port: parseInt(req('SMTP_PORT', '587'), 10),
    user: req('SMTP_USER'),
    pass: req('SMTP_PASS'),
    from: req('EMAIL_FROM', 'Elite X Shop <no-reply@elitexshop.com>'),
  },

  rateLimit: {
    windowMs: parseInt(req('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(req('RATE_LIMIT_MAX', '200'), 10),
  },
};
