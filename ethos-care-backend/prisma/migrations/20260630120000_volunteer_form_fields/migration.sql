-- AlterTable: expanded volunteer application fields
ALTER TABLE "Volunteer" ADD COLUMN "nationalId" TEXT;
ALTER TABLE "Volunteer" ADD COLUMN "birthDate" TEXT;
ALTER TABLE "Volunteer" ADD COLUMN "education" TEXT;
ALTER TABLE "Volunteer" ADD COLUMN "schoolYear" TEXT;
ALTER TABLE "Volunteer" ADD COLUMN "center" TEXT;
ALTER TABLE "Volunteer" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "Volunteer" ADD COLUMN "address" TEXT;
