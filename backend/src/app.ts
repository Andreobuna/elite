import express from "express";
impor cors, { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { generalLimiter } from "./middleware/rateLimiter";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { filterMockProducts, findMockProductBySlug, mockCategories, mockRelatedProducts } from "./utils/catalogFallback";
import { isDatabaseUnavailable } from "./utils/dbFallback";

import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";
import ordersRoutes from "./routes/orders.routes";
import adminRoutes from "./routes/admin.routes";
import addressesRoutes from "./routes/addresses.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import notificationsRoutes from "./routes/notifications.routes";

const app = express();

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
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(generalLimiter);

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.json({
      status: "ok",
      service: "elite-x-shop-api",
      database: "ok",
      cjConfigured: Boolean(env.cj.apiKey),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (env.nodeEnv !== "production") {
      console.error("[health] database check failed:", message);
    }

    if (isDatabaseUnavailable(error)) {
      return res.json({
        status: "ok",
        service: "elite-x-shop-api",
        database: "fallback",
        cjConfigured: Boolean(env.cj.apiKey && env.cj.apiSecret),
        error: env.nodeEnv !== "production" ? message : undefined,
      });
    }

    res.status(503).json({
      status: "degraded",
      service: "elite-x-shop-api",
      database: "down",
      cjConfigured: Boolean(env.cj.apiKey && env.cj.apiSecret),
      error: env.nodeEnv !== "production" ? message : "unavailable",
    });
  }
});

app.use("/api/products", (req, res, next) => {
  if (req.method !== "GET") return next();

  const sendJson = res.json.bind(res);
  res.json = ((body: any) => {
    if (req.path === "/" && body && Array.isArray(body.products) && body.products.length === 0) {
      return sendJson(filterMockProducts(req.query as Record<string, string>));
    }

    if (req.path === "/categories" && body && Array.isArray(body.categories) && body.categories.length === 0) {
      return sendJson({ categories: mockCategories() });
    }

    if (/^\/[A-Za-z0-9-]+$/.test(req.path) && body && !body.product) {
      const fallbackProduct = findMockProductBySlug(req.path.slice(1));
      if (fallbackProduct) {
        return sendJson({
          product: fallbackProduct,
          related: mockRelatedProducts(fallbackProduct.category?.slug ?? "", fallbackProduct.slug),
        });
      }
    }

    return sendJson(body);
  }) as typeof res.json;

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  if (req.method === "GET" && req.originalUrl.startsWith("/api/products")) {
    const statusCode = err?.statusCode ?? err?.status ?? 500;
    if (statusCode !== 404) {
      if (req.originalUrl === "/api/products/categories") {
        return res.json({ categories: mockCategories() });
      }

      if (req.originalUrl === "/api/products") {
        return res.json(filterMockProducts(req.query as Record<string, string>));
      }

      const slug = req.params?.slug;
      if (slug) {
        const fallbackProduct = findMockProductBySlug(slug);
        if (fallbackProduct) {
          return res.json({
            product: fallbackProduct,
            related: mockRelatedProducts(fallbackProduct.category?.slug ?? "", fallbackProduct.slug),
          });
        }
      }
    }
  }

  return next(err);
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;t