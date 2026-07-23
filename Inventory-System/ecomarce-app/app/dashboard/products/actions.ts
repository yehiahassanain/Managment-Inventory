"use server";

import { db } from "../../../lib/db";
import { getSession } from "../../../lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
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
  if (!session) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const sku = (formData.get("sku") as string)?.trim() || null;
  const barcode = (formData.get("barcode") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const supplierId = (formData.get("supplierId") as string) || null;
  const buyPrice = parseFloat(formData.get("buyPrice") as string);
  const sellPrice = parseFloat(formData.get("sellPrice") as string);
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const minimumStock = parseInt(formData.get("minimumStock") as string, 10);
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;

  // Validation
  if (!name || !barcode || !categoryId || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity) || isNaN(minimumStock)) {
    return { success: false, error: "Please fill all required fields correctly." };
  }

  try {
    // Check barcode uniqueness
    const existingBarcode = await db.items.findUnique({ where: { barcode } });
    if (existingBarcode) {
      return { success: false, error: "A product with this barcode already exists." };
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

    const user = await db.user.findUnique({ where: { id: session.userId } });
    const creatorName = user?.name || "System";

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
          userItemId: session.userId,
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
          userInventoryId: session.userId,
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
            userId: session.userId,
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

export async function updateProduct(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const sku = (formData.get("sku") as string)?.trim() || null;
  const barcode = (formData.get("barcode") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const supplierId = (formData.get("supplierId") as string) || null;
  const buyPrice = parseFloat(formData.get("buyPrice") as string);
  const sellPrice = parseFloat(formData.get("sellPrice") as string);
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const minimumStock = parseInt(formData.get("minimumStock") as string, 10);
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;
  const existingImageUrl = formData.get("existingImageUrl") as string;
  const transactionType = (formData.get("transactionType") as string) || "Restock";

  if (!productId || !name || !barcode || !categoryId || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity) || isNaN(minimumStock)) {
    return { success: false, error: "Please fill all required fields correctly." };
  }

  try {
    // Check barcode uniqueness excluding current
    const barcodeDup = await db.items.findFirst({
      where: { barcode, id: { not: productId } },
    });
    if (barcodeDup) {
      return { success: false, error: "A product with this barcode already exists." };
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

    // Fetch existing product
    const existingProduct = await db.items.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!existingProduct) {
      return { success: false, error: "Product not found." };
    }

    // Image upload logic
    let finalImageUrl = existingImageUrl || null;
    const newUploadedUrl = await handleImageUpload(imageFile);
    if (newUploadedUrl) {
      finalImageUrl = newUploadedUrl;
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    const updaterName = user?.name || "System";

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

      const updatedInventory = await tx.inventory.update({
        where: { itemId: productId },
        data: {
          buyPrice,
          sellPrice,
          quantity,
          updatedBy: updaterName,
        },
      });

      // Log transaction if quantity changed
      if (qtyDiff !== 0) {
        await tx.inventory_Transaction.create({
          data: {
            quantity: Math.abs(qtyDiff),
            type: transactionType as "Sold" | "Restock" | "Return" | "Damaged",
            createdBy: updaterName,
            updatedBy: updaterName,
            deletedBy: "",
            userId: session.userId,
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
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const product = await db.items.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      return { success: false, error: "Product not found." };
    }

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

    revalidatePath("/dashboard/products");
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Delete product error:", error);
    return { success: false, error: error.message || "Failed to delete product." };
  }
}
