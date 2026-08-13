"use server";

import { db } from "../../../lib/db";
import { getSession } from "../../../lib/session";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateRange(period: "today" | "week" | "month" | "year" | "all") {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "all":
    default:
      return null;
  }
  return { gte: start, lte: now };
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

// ─── KPI Summary ─────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalRevenue: number;
  totalProfit: number;
  totalSales: number;
  totalOrders: number;
  inventoryValue: number;
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await requireAdmin();
  const [transactions, inventoryItems, products, categories, suppliers] =
    await Promise.all([
      db.inventory_Transaction.findMany({
        where: { type: { in: ["Sold", "Return", "Damaged"] } },
        include: { inventory: true },
      }),
      db.inventory.findMany(),
      db.items.count(),
      db.category.count(),
      db.supplier.count(),
    ]);

  let totalRevenue = 0;
  let totalProfit = 0;
  let totalSales = 0;
  let totalOrders = 0;

  for (const t of transactions) {
    const sellPrice = t.inventory?.sellPrice ?? 0;
    const buyPrice = t.inventory?.buyPrice ?? 0;

    if (t.type === "Sold") {
      totalRevenue += t.quantity * sellPrice;
      totalProfit += t.quantity * (sellPrice - buyPrice);
      totalSales += t.quantity;
      totalOrders += 1;
    } else if (t.type === "Return") {
      totalRevenue -= t.quantity * sellPrice;
      totalProfit -= t.quantity * (sellPrice - buyPrice);
      totalSales -= t.quantity;
      totalOrders -= 1;
    } else if (t.type === "Damaged") {
      totalRevenue -= t.quantity * sellPrice;
      totalProfit -= t.quantity * buyPrice;
    }
  }

  totalRevenue = Math.max(0, totalRevenue);
  totalSales = Math.max(0, totalSales);
  totalOrders = Math.max(0, totalOrders);

  const inventoryValue = inventoryItems.reduce(
    (sum, inv) => sum + inv.quantity * inv.buyPrice,
    0
  );

  return {
    totalRevenue,
    totalProfit,
    totalSales,
    totalOrders,
    inventoryValue,
    totalProducts: products,
    totalCategories: categories,
    totalSuppliers: suppliers,
  };
}

// ─── Profit / Sales Report ────────────────────────────────────────────────────

export interface PeriodReport {
  period: string;
  revenue: number;
  profit: number;
  orders: number;
  unitsSold: number;
}

export async function getProfitReport(
  period: "today" | "week" | "month" | "year" | "all",
  customFrom?: string,
  customTo?: string
): Promise<PeriodReport> {
  await requireAdmin();

  let dateFilter: { gte: Date; lte: Date } | null = null;
  if (period === "all" && customFrom && customTo) {
    dateFilter = { gte: new Date(customFrom), lte: new Date(customTo) };
  } else {
    dateFilter = getDateRange(period);
  }

  const where: Record<string, unknown> = {
    type: { in: ["Sold", "Return", "Damaged"] },
  };
  if (dateFilter) where.createdAt = dateFilter;

  const transactions = await db.inventory_Transaction.findMany({
    where,
    include: { inventory: true },
  });

  let revenue = 0;
  let profit = 0;
  let orders = 0;
  let unitsSold = 0;

  for (const t of transactions) {
    const sellPrice = t.inventory?.sellPrice ?? 0;
    const buyPrice = t.inventory?.buyPrice ?? 0;

    if (t.type === "Sold") {
      revenue += t.quantity * sellPrice;
      profit += t.quantity * (sellPrice - buyPrice);
      unitsSold += t.quantity;
      orders += 1;
    } else if (t.type === "Return") {
      revenue -= t.quantity * sellPrice;
      profit -= t.quantity * (sellPrice - buyPrice);
      unitsSold -= t.quantity;
      orders -= 1;
    } else if (t.type === "Damaged") {
      revenue -= t.quantity * sellPrice;
      profit -= t.quantity * buyPrice;
    }
  }

  return {
    period,
    revenue: Math.max(0, revenue),
    profit,
    orders: Math.max(0, orders),
    unitsSold: Math.max(0, unitsSold),
  };
}

// ─── Top Selling Products ─────────────────────────────────────────────────────

export interface TopProduct {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export async function getTopSellingProducts(limit = 10): Promise<TopProduct[]> {
  await requireAdmin();

  const transactions = await db.inventory_Transaction.findMany({
    where: { type: { in: ["Sold", "Return", "Damaged"] } },
    include: {
      inventory: {
        include: { item: { include: { category: true } } },
      },
    },
  });

  const map = new Map<
    string,
    { item: NonNullable<(typeof transactions)[0]["inventory"]>["item"]; quantitySold: number; revenue: number; profit: number }
  >();

  for (const t of transactions) {
    const item = t.inventory?.item;
    if (!item) continue;
    const sellPrice = t.inventory?.sellPrice ?? 0;
    const buyPrice = t.inventory?.buyPrice ?? 0;

    let deltaQty = 0;
    let deltaRev = 0;
    let deltaProf = 0;

    if (t.type === "Sold") {
      deltaQty = t.quantity;
      deltaRev = t.quantity * sellPrice;
      deltaProf = t.quantity * (sellPrice - buyPrice);
    } else if (t.type === "Return") {
      deltaQty = -t.quantity;
      deltaRev = -t.quantity * sellPrice;
      deltaProf = -t.quantity * (sellPrice - buyPrice);
    } else if (t.type === "Damaged") {
      deltaRev = -t.quantity * sellPrice;
      deltaProf = -t.quantity * buyPrice;
    }

    const existing = map.get(item.id);
    if (existing) {
      existing.quantitySold += deltaQty;
      existing.revenue += deltaRev;
      existing.profit += deltaProf;
    } else {
      map.set(item.id, { item, quantitySold: deltaQty, revenue: deltaRev, profit: deltaProf });
    }
  }

  return Array.from(map.values())
    .map(({ item, quantitySold, revenue, profit }) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      imageUrl: item.imageUrl,
      categoryName: item.category?.name ?? "—",
      quantitySold: Math.max(0, quantitySold),
      revenue: Math.max(0, revenue),
      profit,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}

// ─── Inventory Overview ───────────────────────────────────────────────────────

export interface LowStockItem {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  minimumStock: number;
  categoryName: string;
}

export interface InventoryOverview {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  inventoryValue: number;
  lowStockProducts: LowStockItem[];
  outOfStockProducts: LowStockItem[];
}

export async function getInventoryOverview(): Promise<InventoryOverview> {
  await requireAdmin();

  const [items, categories, suppliers] = await Promise.all([
    db.items.findMany({ include: { inventory: true, category: true } }),
    db.category.count(),
    db.supplier.count(),
  ]);

  const inventoryValue = items.reduce(
    (sum, item) => sum + (item.inventory?.quantity ?? 0) * (item.inventory?.buyPrice ?? 0),
    0
  );

  const toStockItem = (item: (typeof items)[0]): LowStockItem => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    imageUrl: item.imageUrl,
    quantity: item.inventory?.quantity ?? 0,
    minimumStock: item.minimumStock,
    categoryName: item.category?.name ?? "—",
  });

  return {
    totalProducts: items.length,
    totalCategories: categories,
    totalSuppliers: suppliers,
    inventoryValue,
    lowStockProducts: items
      .filter((i) => (i.inventory?.quantity ?? 0) > 0 && (i.inventory?.quantity ?? 0) <= i.minimumStock)
      .map(toStockItem),
    outOfStockProducts: items
      .filter((i) => (i.inventory?.quantity ?? 0) === 0)
      .map(toStockItem),
  };
}

// ─── Sales by Category ────────────────────────────────────────────────────────

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  share: number;
}

export async function getSalesByCategory(): Promise<CategorySales[]> {
  await requireAdmin();

  const transactions = await db.inventory_Transaction.findMany({
    where: { type: { in: ["Sold", "Return", "Damaged"] } },
    include: {
      inventory: {
        include: { item: { include: { category: true } } },
      },
    },
  });

  const map = new Map<string, { name: string; unitsSold: number; revenue: number; profit: number }>();

  for (const t of transactions) {
    const category = t.inventory?.item?.category;
    if (!category) continue;
    const sellPrice = t.inventory?.sellPrice ?? 0;
    const buyPrice = t.inventory?.buyPrice ?? 0;

    let deltaUnits = 0;
    let deltaRev = 0;
    let deltaProf = 0;

    if (t.type === "Sold") {
      deltaUnits = t.quantity;
      deltaRev = t.quantity * sellPrice;
      deltaProf = t.quantity * (sellPrice - buyPrice);
    } else if (t.type === "Return") {
      deltaUnits = -t.quantity;
      deltaRev = -t.quantity * sellPrice;
      deltaProf = -t.quantity * (sellPrice - buyPrice);
    } else if (t.type === "Damaged") {
      deltaRev = -t.quantity * sellPrice;
      deltaProf = -t.quantity * buyPrice;
    }

    const existing = map.get(category.id);
    if (existing) {
      existing.unitsSold += deltaUnits;
      existing.revenue += deltaRev;
      existing.profit += deltaProf;
    } else {
      map.set(category.id, { name: category.name, unitsSold: deltaUnits, revenue: deltaRev, profit: deltaProf });
    }
  }

  const sanitizedCategories = Array.from(map.entries()).map(([categoryId, data]) => ({
    categoryId,
    categoryName: data.name,
    unitsSold: Math.max(0, data.unitsSold),
    revenue: Math.max(0, data.revenue),
    profit: data.profit,
  }));

  const totalRevenue = sanitizedCategories.reduce((sum, c) => sum + c.revenue, 0);

  return sanitizedCategories
    .map((c) => ({
      ...c,
      share: totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ─── Sales Trend ─────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  revenue: number;
  profit: number;
  unitsSold: number;
}

export async function getSalesTrend(days = 30): Promise<TrendPoint[]> {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const transactions = await db.inventory_Transaction.findMany({
    where: {
      type: { in: ["Sold", "Return", "Damaged"] },
      createdAt: { gte: since },
    },
    include: { inventory: true },
    orderBy: { createdAt: "asc" },
  });

  const map = new Map<string, { revenue: number; profit: number; unitsSold: number }>();

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), { revenue: 0, profit: 0, unitsSold: 0 });
  }

  for (const t of transactions) {
    const key = t.createdAt.toISOString().slice(0, 10);
    const entry = map.get(key);
    if (!entry) continue;

    const sellPrice = t.inventory?.sellPrice ?? 0;
    const buyPrice = t.inventory?.buyPrice ?? 0;

    if (t.type === "Sold") {
      entry.revenue += t.quantity * sellPrice;
      entry.profit += t.quantity * (sellPrice - buyPrice);
      entry.unitsSold += t.quantity;
    } else if (t.type === "Return") {
      entry.revenue -= t.quantity * sellPrice;
      entry.profit -= t.quantity * (sellPrice - buyPrice);
      entry.unitsSold -= t.quantity;
    } else if (t.type === "Damaged") {
      entry.revenue -= t.quantity * sellPrice;
      entry.profit -= t.quantity * buyPrice;
    }
  }

  return Array.from(map.entries()).map(([date, data]) => ({
    date,
    revenue: Math.max(0, data.revenue),
    profit: data.profit,
    unitsSold: Math.max(0, data.unitsSold),
  }));
}

// ─── Recent Transactions ──────────────────────────────────────────────────────

export interface RecentTransaction {
  id: string;
  type: string;
  quantity: number;
  createdAt: Date;
  createdBy: string;
  itemName: string;
  itemId: string;
}

export async function getRecentTransactions(limit = 15): Promise<RecentTransaction[]> {
  await requireAdmin();

  const transactions = await db.inventory_Transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { inventory: { include: { item: true } } },
  });

  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    quantity: t.quantity,
    createdAt: t.createdAt,
    createdBy: t.createdBy,
    itemName: t.inventory?.item?.name ?? "Unknown",
    itemId: t.inventory?.item?.id ?? "",
  }));
}
