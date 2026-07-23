import "dotenv/config";
import { PrismaClient } from './prisma/generated/main/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Attempting to create user...");
    const userId = "e18e98d9-dc56-4a76-9e26-7647fca3d9ac";
    const result = await prisma.category.create({
    data: {
        name: "Wood",
        createdBy: userId,
        updatedBy: userId,
        deletedBy: userId,
        userCategoryId: userId,
      },
});
    console.log("Created user successfully:", result);
}

main()
    .catch((error) => {
        console.error("Error creating user:", error);
    })
    .finally(async () => {
         await prisma.$disconnect();
         await pool.end();
    });