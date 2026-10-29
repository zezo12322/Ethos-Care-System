-- أرقام وروابط تُدار يدويًا من CMS بدل جداول العمليات والمتطوعين
-- نبدأ عدد المتطوعين بالعدد الحالي قبل حذف الجدول، والمدير يعدّله بعد كده
INSERT INTO "SiteContent" ("key", "value", "label", "group", "updatedAt")
VALUES
  ('stats_volunteers', (SELECT COUNT(*)::text FROM "Volunteer" WHERE "status" <> 'REJECTED'), 'عدد المتطوعين (يظهر في الصفحة الرئيسية)', 'أرقام الموقع', CURRENT_TIMESTAMP),
  ('volunteer_whatsapp', '201026236435', 'رقم واتساب «تطوع معنا» (بالصيغة الدولية بدون +)', 'التطوع', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_operationId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerAssignment" DROP CONSTRAINT "VolunteerAssignment_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerAssignment" DROP CONSTRAINT "VolunteerAssignment_operationId_fkey";

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "operationId";

-- DropTable
DROP TABLE "Operation";

-- DropTable
DROP TABLE "Volunteer";

-- DropTable
DROP TABLE "VolunteerAssignment";
