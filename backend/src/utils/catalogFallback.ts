import { MOCK_CATALOG, RemoteProduct } from './cjdropshipping';
import { env } from '../config/env';
import slugify from './slugify';

export function categoryFromName(name: string) {
  return {
    id: 'mock-category-' + slugify(name),
    name,
    slug: slugify(name),
    imageUrl: null,
  };
}

export function mockSlug(product: RemoteProduct) {
  return slugify(product.title) + '-' + product.cjProductId.slice(-4);
}

export function toMockProduct(product: RemoteProduct) {
  const category = categoryFromName(product.category);

  return {
    id: product.cjProductId,
    cjProductId: product.cjProductId,
    title: product.title,
    slug: mockSlug(product),
    description: product.description,
    basePrice: product.basePrice,
    markupPercent: env.defaultMarkupPercent,
    sellingPrice: Math.round(product.basePrice * (1 + env.defaultMarkupPercent / 100) * 100) / 100,
    currency: product.currency,
    stock: product.stock,
    ratingAverage: product.ratingAverage,
    ratingCount: product.ratingCount,
    isActive: true,
    category,
    categoryId: category.id,
    images: product.images.map((url, index) => ({
      id: product.cjProductId + '-image-' + index,
      url,
      altText: product.title,
      position: index,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.sku,
      sku: variant.sku,
      name: variant.name,
      priceDelta: variant.priceDelta,
      stock: variant.stock,
      attributes: variant.attributes,
    })),
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mockProducts() {
  return MOCK_CATALOG.map(toMockProduct);
}

export function mockCategories() {
  return Array.from(new Map(MOCK_CATALOG.map((product) => [product.category, categoryFromName(product.category)])).values());
}

export function findMockProductBySlug(slug: string) {
  return mockProducts().find((product) => product.slug === slug);
}

export function mockRelatedProducts(categorySlug: string, slug: string) {
  return mockProducts()
    .filter((product) => product.category?.slug === categorySlug && product.slug !== slug)
    .slice(0, 4);
}

export function filterMockProducts(options: {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
}) {
  const page = Math.max(parseInt(options.page ?? '1', 10) || 1, 1);
  const pageSize = Math.min(parseInt(options.pageSize ?? '12', 10) || 12, 1000);

  let filtered = mockProducts();
  if (options.category) {
    filtered = filtered.filter((product) => product.category?.slug === options.category);
  }
  if (options.search) {
    const term = options.search.toLowerCase();
    filtered = filtered.filter((product) => product.title.toLowerCase().includes(term));
  }

  if (options.sort === 'price_asc') filtered = [...filtered].sort((left, right) => Number(left.sellingPrice) - Number(right.sellingPrice));
  else if (options.sort === 'price_desc') filtered = [...filtered].sort((left, right) => Number(right.sellingPrice) - Number(left.sellingPrice));
  else if (options.sort === 'rating') filtered = [...filtered].sort((left, right) => Number(right.ratingAverage) - Number(left.ratingAverage));
  else filtered = [...filtered].reverse();

  const skip = (page - 1) * pageSize;
  return {
    products: filtered.slice(skip, skip + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}
