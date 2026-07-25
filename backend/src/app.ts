import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { generalLimiter } from './middleware/rateLimiter';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { isDatabaseUnavailable } from './utils/dbFallback';

import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import ordersRoutes from './routes/orders.routes';
import adminRoutes from './routes/admin.routes';
import addressesRoutes from './routes/addresses.routes';
import wishlistRoutes from './routes/wishlist.routes';
import notificationsRoutes from './routes/notifications.routes';

const app = express();

app.set('trust proxy', 1);
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || env.clientUrls.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');

    return res.json({
      status: 'ok',
      service: 'elite-x-shop-api',
      database: 'ok',
      cjConfigured: Boolean(env.cj.apiKey),
      apiKeyLoaded: Boolean(env.cj.apiKey),
      apiKeyLength: env.cj.apiKey.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (isDatabaseUnavailable(error)) {
      return res.json({
        status: 'ok',
        service: 'elite-x-shop-api',
        database: 'fallback',
        cjConfigured: Boolean(env.cj.apiKey),
        apiKeyLoaded: Boolean(env.cj.apiKey),
        apiKeyLength: env.cj.apiKey.length,
      });
    }

    return res.status(503).json({
      status: 'degraded',
      service: 'elite-x-shop-api',
      database: 'down',
      cjConfigured: Boolean(env.cj.apiKey),
      apiKeyLoaded: Boolean(env.cj.apiKey),
      apiKeyLength: env.cj.apiKey.length,
      error: env.nodeEnv !== 'production' ? message : 'unavailable',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
