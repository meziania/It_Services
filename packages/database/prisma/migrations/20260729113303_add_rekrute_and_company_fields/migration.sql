-- AlterEnum
ALTER TYPE "Platform" ADD VALUE 'REKRUTE';

-- AlterTable
ALTER TABLE "job_offers" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyUrl" TEXT;
