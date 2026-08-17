import "dotenv/config";
import { PrismaClient } from './prisma/generated/main/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const suppliers = await prisma.supplier.findMany();
    console.log("SUPPLIERS IN DB:", suppliers);
    const users = await prisma.user.findMany();
    console.log("USERS IN DB:", users);
}

main()
    .catch((error) => {
        console.error("Error:", error);
    })
    .finally(async () => {
         await prisma.$disconnect();
         await pool.end();
    });