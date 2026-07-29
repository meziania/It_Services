-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('JOBMAROC', 'INDEED', 'LINKEDIN', 'FIVERR', 'AMAZON', 'OTHER');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('JOB_BOARD', 'FREELANCE_MARKETPLACE', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('FREELANCE', 'CONTRACT', 'FULL_TIME', 'BUYER_REQUEST');

-- CreateEnum
CREATE TYPE "ItCategory" AS ENUM ('WEB', 'MOBILE', 'FULLSTACK', 'DEVOPS', 'WORDPRESS', 'API_INTEGRATION', 'ECOMMERCE', 'DESIGN', 'DATA', 'OTHER', 'NOT_IT');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('NEW', 'CONTACTED', 'REPLIED', 'WON', 'LOST', 'SKIP');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP', 'PLATFORM_MESSAGE');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('IN_POST', 'USER_ADDED');

-- CreateEnum
CREATE TYPE "OutreachChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('DRAFT', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "platform_sources" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL DEFAULT 'JOB_BOARD',
    "baseUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "frequencyMinutes" INTEGER NOT NULL DEFAULT 1440,
    "maxPages" INTEGER NOT NULL DEFAULT 5,
    "config" JSONB,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_documents" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'text/html',
    "rawContent" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "raw_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "sourceId" TEXT,
    "rawDocumentId" TEXT,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionRaw" TEXT NOT NULL,
    "descriptionClean" TEXT,
    "publishedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "budgetText" TEXT,
    "location" TEXT,
    "remote" BOOLEAN,
    "offerType" "OfferType" NOT NULL DEFAULT 'FREELANCE',
    "itCategory" "ItCategory" NOT NULL DEFAULT 'OTHER',
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "matchReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "OfferStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_contacts" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "source" "ContactSource" NOT NULL DEFAULT 'IN_POST',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outreach_messages" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "channel" "OutreachChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "OutreachStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_sources_platform_name_key" ON "platform_sources"("platform", "name");

-- CreateIndex
CREATE UNIQUE INDEX "raw_documents_urlHash_key" ON "raw_documents"("urlHash");

-- CreateIndex
CREATE INDEX "raw_documents_sourceId_status_idx" ON "raw_documents"("sourceId", "status");

-- CreateIndex
CREATE INDEX "job_offers_status_idx" ON "job_offers"("status");

-- CreateIndex
CREATE INDEX "job_offers_itCategory_idx" ON "job_offers"("itCategory");

-- CreateIndex
CREATE INDEX "job_offers_matchScore_idx" ON "job_offers"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "job_offers_platform_externalId_key" ON "job_offers"("platform", "externalId");

-- CreateIndex
CREATE INDEX "offer_contacts_offerId_idx" ON "offer_contacts"("offerId");

-- CreateIndex
CREATE INDEX "outreach_messages_offerId_idx" ON "outreach_messages"("offerId");

-- AddForeignKey
ALTER TABLE "raw_documents" ADD CONSTRAINT "raw_documents_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "platform_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "platform_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_rawDocumentId_fkey" FOREIGN KEY ("rawDocumentId") REFERENCES "raw_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_contacts" ADD CONSTRAINT "offer_contacts_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outreach_messages" ADD CONSTRAINT "outreach_messages_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
