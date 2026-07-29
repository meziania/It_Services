-- CreateTable
CREATE TABLE "team_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "services" JSONB NOT NULL,
    "weights" JSONB NOT NULL,
    "template" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_settings_pkey" PRIMARY KEY ("id")
);
