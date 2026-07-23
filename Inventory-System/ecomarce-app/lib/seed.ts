import { db } from "./db";

export async function ensureDefaultCategoriesAndSuppliers(userId: string) {
  try {
    // 1. Ensure categories exist
    const categoryCount = await db.category.count();
    if (categoryCount === 0) {
      console.log("Seeding default categories...");
      const defaultCategories = [
        "Big Sport",
        "Cross Fit Sport",
        "Protein and Vitamin",
        "Electronics",
      ];
      
      const user = await db.user.findUnique({ where: { id: userId } });
      const creatorName = user?.name || "System";

      for (const catName of defaultCategories) {
        await db.category.create({
          data: {
            name: catName,
            createdBy: creatorName,
            updatedBy: creatorName,
            deletedBy: "",
            userCategoryId: userId,
          },
        });
      }
    }

    // 2. Ensure suppliers exist
    const supplierCount = await db.supplier.count();
    if (supplierCount === 0) {
      console.log("Seeding default suppliers...");
      const defaultSuppliers = [
        { name: "Global Tech Inc", contact: "John Doe", email: "john@globaltech.com", phone: "123-456-7890", address: "123 Tech Way" },
        { name: "Acme Wholesale", contact: "Jane Smith", email: "jane@acme.com", phone: "234-567-8901", address: "456 Market St" },
        { name: "Fresh Foods Dist", contact: "Bob Johnson", email: "bob@freshfoods.com", phone: "345-678-9012", address: "789 Farm Lane" },
        { name: "Premium Goods Ltd", contact: "Alice Brown", email: "alice@premium.com", phone: "456-789-0123", address: "101 Luxury Blvd" },
      ];

      const user = await db.user.findUnique({ where: { id: userId } });
      const creatorName = user?.name || "System";

      for (const sup of defaultSuppliers) {
        await db.supplier.create({
          data: {
            name: sup.name,
            contactName: sup.contact,
            email: sup.email,
            phone: sup.phone,
            address: sup.address,
            createdBy: creatorName,
            updatedBy: creatorName,
            deletedBy: "",
            userSupplierId: userId,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to seed default categories and suppliers:", error);
  }
}
