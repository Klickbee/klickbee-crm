/*
  Warnings:

  - You are about to drop the column `company` on the `Prospect` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prospect" DROP COLUMN "company",
ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
