/*
  Warnings:

  - You are about to drop the column `contact` on the `Deal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deal" DROP COLUMN "contact",
ADD COLUMN     "contactId" TEXT;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
