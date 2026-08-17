import { db } from "./db";

export const defaultCategories = [
  "Wood",
  "Protein & Vitamins",
  "Big Sport",
  "Electronics",
  "CrossFit Sport",
];

export const defaultSuppliers = [
  { name: "ماي سبورت", contact: "ماي سبورت", email: "tarek@gmail.com", phone: "01016176777", address: "01023158900" },
  { name: "خالد التابعي", contact: "خالد التابعي", email: "khaled.tabey@gmail.com", phone: "01272454072", address: "ALEX" },
  { name: "الخولي بنج", contact: "الخولي بنج", email: "elkholy.ping@gmail.com", phone: "01211130685", address: "Cairo" },
  { name: "احمد ناجي ZAM", contact: "احمد ناجي ZAM", email: "ahmed.naji.zam@gmail.com", phone: "01000776818", address: "Cairo" },
  { name: "سما سبورت (محفوظ)", contact: "سما سبورت (محفوظ)", email: "sama.sport@gmail.com", phone: "01112539211", address: "Cairo" },
  { name: "اليسر جمله", contact: "اليسر جمله", email: "elyosr.gomla@gmail.com", phone: "01116924551", address: "Cairo" },
  { name: "عبد المنعم طيبه", contact: "عبد المنعم طيبه", email: "abdelmonem.tiba@gmail.com", phone: "01001381018", address: "Cairo" },
  { name: "نايس سبورت", contact: "نايس سبورت", email: "ahmednabil@gmail.com", phone: "01014155531", address: "Cairo" },
  { name: "خليفه", contact: "خليفه", email: "_5alifa@gmail.com", phone: "01000293002", address: "Cairo" },
  { name: "شهاب", contact: "شهاب", email: "Shaib@gmail.com", phone: "01090017383", address: "Cairo" },
];

export async function ensureDefaultCategoriesAndSuppliers(userId?: string) {
  try {
    // 1. Resolve a valid user for foreign key relations
    let user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
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
      console.warn("No user found in database to associate categories/suppliers with.");
      return;
    }

    const creatorName = user.name || "Yehia";
    const validUserId = user.id;

    // 2. Ensure categories exist
    for (const catName of defaultCategories) {
      const existing = await db.category.findFirst({
        where: { name: catName }
      });

      if (!existing) {
        await db.category.create({
          data: {
            name: catName,
            createdBy: creatorName,
            updatedBy: creatorName,
            deletedBy: "",
            userCategoryId: validUserId,
          },
        });
      }
    }

    // 3. Ensure suppliers exist
    for (const sup of defaultSuppliers) {
      const existing = await db.supplier.findFirst({
        where: { name: sup.name }
      });

      if (!existing) {
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
            userSupplierId: validUserId,
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to seed default categories and suppliers:", error);
  }
}
