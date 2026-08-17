/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "supplierId" TEXT;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedBy" TEXT NOT NULL,
    "userSupplierId" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Items_sku_key" ON "Items"("sku");

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_userSupplierId_fkey" FOREIGN KEY ("userSupplierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
