-- الحوكمة: حذف ناعم (soft-delete) + حقول تدقيق (من أنشأ السجل)
-- إضافات غير مدمّرة فقط — لا حذف لأي بيانات قائمة.

ALTER TABLE "Case" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Case" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "Family" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Family" ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "Volunteer" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- فهارس تسريع تصفية السجلات غير المحذوفة
CREATE INDEX "Case_deletedAt_idx" ON "Case"("deletedAt");
CREATE INDEX "Family_deletedAt_idx" ON "Family"("deletedAt");
CREATE INDEX "Volunteer_deletedAt_idx" ON "Volunteer"("deletedAt");
