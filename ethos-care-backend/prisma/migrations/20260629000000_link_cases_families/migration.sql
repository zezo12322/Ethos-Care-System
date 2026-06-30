-- AlterTable: enrich FamilyMember so the family record is the single source of truth
ALTER TABLE "FamilyMember" ADD COLUMN "nationalId" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "gender" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "mobile" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "job" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "monthlyIncome" TEXT DEFAULT '0';
ALTER TABLE "FamilyMember" ADD COLUMN "classification" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "educationType" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "educationStage" TEXT;
ALTER TABLE "FamilyMember" ADD COLUMN "schoolYear" TEXT;

-- CreateIndex: one family per national ID (Postgres allows multiple NULLs).
-- NOTE: if existing rows hold duplicate non-null nationalId values, this will
-- fail to apply — dedupe those families first (merge their cases), then re-run.
CREATE UNIQUE INDEX "Family_nationalId_key" ON "Family"("nationalId");
