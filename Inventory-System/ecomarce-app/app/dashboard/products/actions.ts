"use server";

import { db } from "../../../lib/db";
import { getSession } from "../../../lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// Helper to handle image uploads to /public/uploads/
async function handleImageUpload(imageFile: File | null): Promise<string | null> {
  if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
    return null;
  }

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create public/uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueFileName = `${Date.now()}_${cleanFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save to disk
    await writeFile(filePath, buffer);
    return `/uploads/${uniqueFileName}`;
  } catch (error) {
    console.error("Error saving image:", error);
    return null;
  }
}

// Helper to delete an image file from /public/uploads/ (best-effort, won't throw)
async function deleteImageFile(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  try {
    const filename = path.basename(imageUrl);
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    await unlink(filePath);
  } catch (error: any) {
    // If the file doesn't exist (ENOENT), silently skip — otherwise log it
    if (error?.code !== "ENOENT") {
      console.error("Error deleting image file:", error);
    }
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getFormData() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const categories = await db.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const suppliers = await db.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return { categories, suppliers };
}

export interface GetProductsParams {
  search: string;
  category: string;
  supplier: string;
  status: string;
  sortBy: string;
  page: number;
  limit: number;
}

export async function getProducts(params: GetProductsParams) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Fetch all active products (exclude soft deleted, though we don't have soft deletes set up yet)
  const items = await db.items.findMany({
    include: {
      category: true,
      supplier: true,
      inventory: true,
    },
  });

  // Filter in-memory for computed properties and cross-table conditions
  let filteredItems = items.filter((item) => {
    // 1. Search filter (name, SKU, barcode)
    if (params.search) {
      const q = params.search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q) || false;
      const matchBarcode = item.barcode.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBarcode) return false;
    }

    // 2. Category filter
    if (params.category && item.categoryId !== params.category) {
      return false;
    }

    // 3. Supplier filter
    if (params.supplier && item.supplierId !== params.supplier) {
      return false;
    }

    // 4. Status filter
    if (params.status) {
      const qty = item.inventory?.quantity ?? 0;
      const minStock = item.minimumStock;
      if (params.status === "out_of_stock" && qty > 0) return false;
      if (params.status === "low_stock" && (qty <= 0 || qty > minStock)) return false;
      if (params.status === "in_stock" && qty <= minStock) return false;
    }

    return true;
  });

  // Sorting
  filteredItems.sort((a, b) => {
    const qtyA = a.inventory?.quantity ?? 0;
    const qtyB = b.inventory?.quantity ?? 0;
    const buyA = a.inventory?.buyPrice ?? 0;
    const buyB = b.inventory?.buyPrice ?? 0;
    const sellA = a.inventory?.sellPrice ?? 0;
    const sellB = b.inventory?.sellPrice ?? 0;

    switch (params.sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "quantity_asc":
        return qtyA - qtyB;
      case "quantity_desc":
        return qtyB - qtyA;
      case "buyPrice_asc":
        return buyA - buyB;
      case "buyPrice_desc":
        return buyB - buyA;
      case "sellPrice_asc":
        return sellA - sellB;
      case "sellPrice_desc":
        return sellB - sellA;
      case "created_asc":
        return a.createdOn.getTime() - b.createdOn.getTime();
      case "created_desc":
      default:
        return b.createdOn.getTime() - a.createdOn.getTime();
    }
  });

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / params.limit);
  const startIndex = (params.page - 1) * params.limit;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + params.limit);

  return {
    products: paginatedItems,
    totalPages,
    totalItems,
  };
}

export async function getProductById(productId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  return db.items.findUnique({
    where: { id: productId },
    include: {
      category: true,
      supplier: true,
      inventory: true,
    },
  });
}

export async function createProduct(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const name = (formData.get("name") as string)?.trim();
  const sku = (formData.get("sku") as string)?.trim() || null;
  const submittedBarcode = (formData.get("barcode") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const rawSupplierId = (formData.get("supplierId") as string)?.trim() || null;
  const rawBuyPrice = formData.get("buyPrice") as string;
  const rawSellPrice = formData.get("sellPrice") as string;
  const rawQuantity = formData.get("quantity") as string;
  const rawMinimumStock = formData.get("minimumStock") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;

  const buyPrice = parseFloat(rawBuyPrice);
  const sellPrice = parseFloat(rawSellPrice);
  const quantity = parseInt(rawQuantity, 10);
  const minimumStock = parseInt(rawMinimumStock, 10);

  // Validation
  if (!name || !categoryId || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity) || isNaN(minimumStock)) {
    return { success: false, error: "Please fill all required fields correctly." };
  }

  if (sellPrice < buyPrice) {
    return { success: false, error: "Selling Price cannot be less than Purchase Price." };
  }

  try {
    // 1. Validate Category exists
    const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return { success: false, error: "The selected category does not exist." };
    }

    // 2. Validate Supplier if provided
    let supplierId: string | null = null;
    if (rawSupplierId) {
      const supplierExists = await db.supplier.findUnique({ where: { id: rawSupplierId } });
      if (supplierExists) {
        supplierId = supplierExists.id;
      }
    }

    // 3. Resolve user (prevents foreign key constraint failure if session cookie has stale ID)
    let user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      user = await db.user.findFirst({
        where: {
          OR: [
            { email: "yehiahassanain@gmail.com" },
            { role: "ADMIN" }
          ]
        }
      });
    }

    if (!user) {
      return { success: false, error: "User session is invalid. Please sign out and sign in again." };
    }

    const creatorName = user.name || "System";
    const validUserId = user.id;

    let barcode = submittedBarcode || sku || `BC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check barcode uniqueness
    const existingBarcode = await db.items.findUnique({ where: { barcode } });
    if (existingBarcode) {
      if (submittedBarcode) {
        return { success: false, error: "A product with this barcode already exists." };
      } else {
        barcode = `BC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    // Check SKU uniqueness
    if (sku) {
      const existingSku = await db.items.findUnique({ where: { sku } });
      if (existingSku) {
        return { success: false, error: "A product with this SKU already exists." };
      }
    }

    // Save image
    const imageUrl = await handleImageUpload(imageFile);

    // Run in Prisma Transaction
    await db.$transaction(async (tx) => {
      const newItem = await tx.items.create({
        data: {
          name,
          sku,
          barcode,
          imageUrl,
          description: description || "",
          minimumStock,
          note: "",
          createdBy: creatorName,
          updatedBy: creatorName,
          deletedBy: "",
          categoryId,
          supplierId,
          userItemId: validUserId,
        },
      });

      const newInventory = await tx.inventory.create({
        data: {
          buyPrice,
          sellPrice,
          quantity,
          Note: "Initial stock load",
          createdBy: creatorName,
          updatedBy: creatorName,
          deletedBy: "",
          itemId: newItem.id,
          userInventoryId: validUserId,
        },
      });

      // Log transaction if quantity > 0
      if (quantity > 0) {
        await tx.inventory_Transaction.create({
          data: {
            quantity,
            type: "Restock",
            createdBy: creatorName,
            updatedBy: creatorName,
            deletedBy: "",
            userId: validUserId,
            inventoryId: newInventory.id,
          },
        });
      }
    });

    revalidatePath("/dashboard/products");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Create product error:", error);
    return { success: false, error: error.message || "Failed to create product." };
  }
}

export interface StockAlertItem {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  minimumStock: number;
  categoryName: string;
}

export async function getStockAlerts(): Promise<{
  lowStockProducts: StockAlertItem[];
  outOfStockProducts: StockAlertItem[];
}> {
  const session = await getSession();
  if (!session) return { lowStockProducts: [], outOfStockProducts: [] };

  const items = await db.items.findMany({
    include: { inventory: true, category: true },
    orderBy: { name: "asc" },
  });

  const toStockItem = (item: (typeof items)[0]): StockAlertItem => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    imageUrl: item.imageUrl,
    quantity: item.inventory?.quantity ?? 0,
    minimumStock: item.minimumStock,
    categoryName: item.category?.name ?? "—",
  });

  return {
    lowStockProducts: items
      .filter((i) => (i.inventory?.quantity ?? 0) > 0 && (i.inventory?.quantity ?? 0) <= i.minimumStock)
      .map(toStockItem),
    outOfStockProducts: items
      .filter((i) => (i.inventory?.quantity ?? 0) === 0)
      .map(toStockItem),
  };
}

export async function updateProduct(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const sku = (formData.get("sku") as string)?.trim() || null;
  const submittedBarcode = (formData.get("barcode") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const rawSupplierId = formData.get("supplierId") as string;
  const rawBuyPrice = formData.get("buyPrice") as string;
  const rawSellPrice = formData.get("sellPrice") as string;
  const rawQuantity = formData.get("quantity") as string;
  const minimumStock = parseInt(formData.get("minimumStock") as string, 10);
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;
  const existingImageUrl = formData.get("existingImageUrl") as string;
  const transactionType = (formData.get("transactionType") as string) || "Restock";

  if (!productId || !name || !categoryId || isNaN(minimumStock)) {
    return { success: false, error: "Please fill all required fields correctly." };
  }

  try {
    // Fetch existing product
    const existingProduct = await db.items.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!existingProduct) {
      return { success: false, error: "Product not found." };
    }

    const buyPrice = (rawBuyPrice !== null && rawBuyPrice !== "" && !isNaN(parseFloat(rawBuyPrice)))
      ? parseFloat(rawBuyPrice)
      : (existingProduct.inventory?.buyPrice ?? 0);
    const sellPrice = (rawSellPrice !== null && rawSellPrice !== "" && !isNaN(parseFloat(rawSellPrice)))
      ? parseFloat(rawSellPrice)
      : (existingProduct.inventory?.sellPrice ?? 0);
    const supplierId = rawSupplierId !== undefined && rawSupplierId !== null
      ? (rawSupplierId || null)
      : existingProduct.supplierId;

    const parsedQty = parseInt(rawQuantity, 10);
    const quantity = (rawQuantity !== null && rawQuantity !== "" && !isNaN(parsedQty))
      ? parsedQty
      : (existingProduct.inventory?.quantity ?? 0);

    const barcode = submittedBarcode || existingProduct.barcode;

    // Check barcode uniqueness excluding current
    if (submittedBarcode) {
      const barcodeDup = await db.items.findFirst({
        where: { barcode, id: { not: productId } },
      });
      if (barcodeDup) {
        return { success: false, error: "A product with this barcode already exists." };
      }
    }

    // Check SKU uniqueness excluding current
    if (sku) {
      const skuDup = await db.items.findFirst({
        where: { sku, id: { not: productId } },
      });
      if (skuDup) {
        return { success: false, error: "A product with this SKU already exists." };
      }
    }

    // Image upload logic
    let finalImageUrl = existingImageUrl || null;
    const newUploadedUrl = await handleImageUpload(imageFile);
    if (newUploadedUrl) {
      // Delete old image file from disk since it's being replaced with a new one
      await deleteImageFile(existingProduct.imageUrl);
      finalImageUrl = newUploadedUrl;
    }

    // Resolve valid user
    let user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      user = await db.user.findFirst({
        where: {
          OR: [
            { email: "yehiahassanain@gmail.com" },
            { role: "ADMIN" }
          ]
        }
      });
    }

    const updaterName = user?.name || "System";
    const validUserId = user?.id || session.userId;

    // Run in Prisma Transaction
    await db.$transaction(async (tx) => {
      await tx.items.update({
        where: { id: productId },
        data: {
          name,
          sku,
          barcode,
          imageUrl: finalImageUrl,
          description: description || "",
          minimumStock,
          updatedBy: updaterName,
          categoryId,
          supplierId,
        },
      });

      const oldQty = existingProduct.inventory?.quantity ?? 0;
      const qtyDiff = quantity - oldQty;

      // When stock decreases, it always means the product was Sold.
      const resolvedTransactionType = qtyDiff < 0
        ? "Sold"
        : (transactionType as "Sold" | "Restock" | "Return" | "Damaged");

      // If reason is Damaged when adding stock (qtyDiff > 0), do not add to available stock (remains at oldQty).
      const finalQuantity = resolvedTransactionType === "Damaged" && qtyDiff > 0 ? oldQty : quantity;

      const updatedInventory = await tx.inventory.update({
        where: { itemId: productId },
        data: {
          buyPrice,
          sellPrice,
          quantity: finalQuantity,
          updatedBy: updaterName,
        },
      });

      // Log transaction if quantity changed
      if (qtyDiff !== 0) {
        await tx.inventory_Transaction.create({
          data: {
            quantity: Math.abs(qtyDiff),
            type: resolvedTransactionType,
            createdBy: updaterName,
            updatedBy: updaterName,
            deletedBy: "",
            userId: validUserId,
            inventoryId: updatedInventory.id,
          },
        });
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Update product error:", error);
    return { success: false, error: error.message || "Failed to update product." };
  }
}

export async function deleteProduct(productId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const product = await db.items.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

    // Capture the image URL before deletion so we can remove the file after
    const imageUrlToDelete = product.imageUrl;

    // Cascading delete manually to avoid foreign key violations
    await db.$transaction(async (tx) => {
      const inventoryId = product.inventory?.id;
      if (inventoryId) {
        // Delete all transactions linked to this inventory
        await tx.inventory_Transaction.deleteMany({
          where: { inventoryId },
        });

        // Delete inventory record
        await tx.inventory.delete({
          where: { id: inventoryId },
        });
      }

      // Delete items record
      await tx.items.delete({
        where: { id: productId },
      });
    });

    // Delete the product image file from disk (best-effort, won't fail the operation)
    await deleteImageFile(imageUrlToDelete);

    revalidatePath("/dashboard/products");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return { success: false, error: error.message || "Failed to delete product." };
  }
}
