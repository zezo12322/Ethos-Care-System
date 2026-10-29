-- إلغاء دوري «مسؤول إدارة الحالة» و«مسؤول التنفيذ»: مستخدموهما يصبحون باحثين
UPDATE "User" SET "role" = 'CASE_WORKER' WHERE "role" IN ('MANAGER', 'EXECUTION_OFFICER');
