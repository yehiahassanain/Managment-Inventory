"use server";

import { db } from "../../../../lib/db";
import { getSession } from "../../../../lib/session";

export interface StatusTransactionItem {
  id: string;
  transactionType: "Sold" | "Restock" | "Return" | "Damaged";
  quantity: number;
  date: string;
  formattedDate: string;
  loggedBy: string;
  productId: string;
  productName: string;
  productImage: string | null;
  sku: string | null;
  barcode: string;
  categoryId: string;
  categoryName: string;
  unitBuyPrice: number;
  unitSellPrice: number;
  totalValue: number;
}

export interface StatusAnalysisSummary {
  totalSoldUnits: number;
  totalSoldRevenue: number;
  totalReturnedUnits: number;
  totalReturnedValue: number;
  totalDamagedUnits: number;
  totalDamagedLoss: number;
  totalRestockedUnits: number;
  totalRestockedValue: number;
}

export interface StatusAnalysisResponse {
  sold: StatusTransactionItem[];
  returned: StatusTransactionItem[];
  damaged: StatusTransactionItem[];
  restocked: StatusTransactionItem[];
  summary: StatusAnalysisSummary;
  categories: { id: string; name: string }[];
}

export interface StatusFilterParams {
  categoryId?: string;
  search?: string;
  period?: "today" | "week" | "month" | "year" | "all";
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

function getDateFilter(period?: "today" | "week" | "month" | "year" | "all") {
  if (!period || period === "all") return undefined;
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
  }

  return {
    gte: start,
    lte: now,
  };
}

export async function getStatusAnalysis(params?: StatusFilterParams): Promise<StatusAnalysisResponse> {
  await requireAdmin();

  const dateFilter = getDateFilter(params?.period);

  const [transactions, categories] = await Promise.all([
    db.inventory_Transaction.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      include: {
        inventory: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const search = params?.search?.trim().toLowerCase() || "";
  const selectedCategory = params?.categoryId?.trim() || "";

  const sold: StatusTransactionItem[] = [];
  const returned: StatusTransactionItem[] = [];
  const damaged: StatusTransactionItem[] = [];
  const restocked: StatusTransactionItem[] = [];

  let totalSoldUnits = 0;
  let totalSoldRevenue = 0;
  let totalReturnedUnits = 0;
  let totalReturnedValue = 0;
  let totalDamagedUnits = 0;
  let totalDamagedLoss = 0;
  let totalRestockedUnits = 0;
  let totalRestockedValue = 0;

  for (const tx of transactions) {
    const item = tx.inventory?.item;
    if (!item) continue;

    // Filter by Category
    if (selectedCategory && item.categoryId !== selectedCategory) {
      continue;
    }

    // Filter by Search (Name, SKU, Barcode, Logged By)
    if (search) {
      const matchName = item.name.toLowerCase().includes(search);
      const matchSku = item.sku?.toLowerCase().includes(search) || false;
      const matchBarcode = item.barcode.toLowerCase().includes(search);
      const matchUser = tx.user?.name?.toLowerCase().includes(search) || tx.createdBy.toLowerCase().includes(search);
      if (!matchName && !matchSku && !matchBarcode && !matchUser) {
        continue;
      }
    }

    const unitBuyPrice = tx.inventory?.buyPrice ?? 0;
    const unitSellPrice = tx.inventory?.sellPrice ?? 0;
    const loggedBy = tx.user?.name || tx.createdBy || "System";

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(tx.createdAt));

    let totalValue = 0;
    if (tx.type === "Sold") {
      totalValue = tx.quantity * unitSellPrice;
      totalSoldUnits += tx.quantity;
      totalSoldRevenue += totalValue;
    } else if (tx.type === "Return") {
      totalValue = tx.quantity * unitSellPrice;
      totalReturnedUnits += tx.quantity;
      totalReturnedValue += totalValue;
    } else if (tx.type === "Damaged") {
      totalValue = tx.quantity * unitBuyPrice;
      totalDamagedUnits += tx.quantity;
      totalDamagedLoss += totalValue;
    } else if (tx.type === "Restock") {
      totalValue = tx.quantity * unitBuyPrice;
      totalRestockedUnits += tx.quantity;
      totalRestockedValue += totalValue;
    }

    const transactionItem: StatusTransactionItem = {
      id: tx.id,
      transactionType: tx.type,
      quantity: tx.quantity,
      date: tx.createdAt.toISOString(),
      formattedDate,
      loggedBy,
      productId: item.id,
      productName: item.name,
      productImage: item.imageUrl,
      sku: item.sku,
      barcode: item.barcode,
      categoryId: item.categoryId,
      categoryName: item.category?.name ?? "Uncategorized",
      unitBuyPrice,
      unitSellPrice,
      totalValue,
    };

    if (tx.type === "Sold") {
      sold.push(transactionItem);
    } else if (tx.type === "Return") {
      returned.push(transactionItem);
    } else if (tx.type === "Damaged") {
      damaged.push(transactionItem);
    } else if (tx.type === "Restock") {
      restocked.push(transactionItem);
    }
  }

  return {
    sold,
    returned,
    damaged,
    restocked,
    summary: {
      totalSoldUnits,
      totalSoldRevenue,
      totalReturnedUnits,
      totalReturnedValue,
      totalDamagedUnits,
      totalDamagedLoss,
      totalRestockedUnits,
      totalRestockedValue,
    },
    categories,
  };
}
