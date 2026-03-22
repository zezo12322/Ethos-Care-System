# تقرير تحديثات إدارة الحالات (Case Workflow Improvements)

## 1. التغييرات التي تم إجراؤها
- تم تعديل نموذج الحالات (Case Mode) لفصل "حالة التقدم" (Lifecycle Status) و "حالة الاكتمال" (Completeness) و "حالة القرار" (Decision Status).
- تم إضافة نموذج `CaseHistory` وتخصيص جدول جديد لتتبع سجل تغييرات الحالة لكل الانتقالات الرئيسية (Transitions) لضمان موثوقية السجل.
- تم التعديل على بناء الخدمات البرمجية لتستقبل التغييرات والطلبات في القوائم المشتقة (Derived Queues) بدلاً من الاعتماد على حقول فردية عشوائية.

## 2. الملفات المحدثة
- `ethos-care-backend/prisma/schema.prisma`
- `ethos-care-backend/src/cases/cases.controller.ts`
- `ethos-care-backend/src/cases/cases.service.ts`
- `ethos-care-backend/src/cases/dto/update-case.dto.ts` (تم إضافته)
- `ethos-care-backend/src/families/families.service.ts`
- `ethos-care-frontend/src/app/dashboard/cases/page.tsx`

## 3. كيفية تعيين الحالات القديمة (Mapping) والحالات الجديدة المعتمدة
- **Lifecycle Status**:
  - `DRAFT` مسودة (حالة البداية لأي حالة جديدة)
  - `INTAKE_REVIEW` مراجعة مبدئية
  - `FIELD_VERIFICATION` تحقق ميداني
  - `COMMITTEE_REVIEW` مراجعة اللجنة
  - `APPROVED` تمت الموافقة
  - `IN_PROGRESS` قيد التنفيذ
  - `COMPLETED` مكتملة
  - `REJECTED` مرفوضة
  - `ON_HOLD` معلقة
  - `ARCHIVED` مؤرشفة
- **Completeness Status**:
  - `COMPLETE`: إذا توفر الرقم القومي
  - `MISSING_NATIONAL_ID`: نقص/غياب للرقم القومي
  - `MISSING_DOCUMENTS` / `NEEDS_FOLLOWUP`
- **Decision Status**: `PENDING_DECISION`, `APPROVED`, `REJECTED`, `RETURNED_FOR_COMPLETION`
- الحالات السابقة التي في النظام تستخدم حقل `status` والذي تم الابقاء عليه (كـ Legacy) لكي تعمل شاشات الفرونت إند القديمة لحين التحديث الشامل لاحقاً.

## 4. قوائم العمل (Derived Queues) المضافة
بدلاً من الاعتماد على مجرد حالات، القوائم الآن تعتمد على شروط مركبة:
1. **Urgent Queue (الحالات العاجلة)**: `priority == URGENT` وماعدا الحالات المنتهية.
2. **Missing National ID**: `completenessStatus == MISSING_NATIONAL_ID`.
3. **Under Review (قيد المراجعة)**: كل ما هو تحت دورة حياة `INTAKE_REVIEW`, `FIELD_VERIFICATION`, `COMMITTEE_REVIEW`.
4. **Awaiting Execution (في انتظار التنفيذ)**: `decisionStatus == APPROVED` && `lifecycleStatus == APPROVED`.

## 5. واجهات الـ API التي تمت إضافتها وتعديلها
- **Queues (تصفح القوائم)**
  - `GET /cases/queues/urgent`
  - `GET /cases/queues/missing-national-id`
  - `GET /cases/queues/under-review`
  - `GET /cases/queues/awaiting-execution`
- **Transitions (نقل الحالات)**
  - `POST /cases/:id/transitions/review`
  - `POST /cases/:id/transitions/approve`
  - `POST /cases/:id/transitions/reject`
  - `POST /cases/:id/transitions/complete`
- **History (سجل العمليات)**
  - `GET /cases/:id/history`

## 6. القيود المعروفة والمتبقية (Known Limitations)
- الواجهة الأمامية (Frontend) ما زالت بحاجة لدمج أزرار التحكم الجديدة (Approve / Reject) بشكل مرئي داخل عرض تفاصيل الحالة (Case Details). 
- الحالات القديمة تمتلك `status` بنصوص عربية. سيكون من الضروري مستقبلاً كتابة كود تهجير بيانات (Data Migration Snippet) للربط التام ونقل كافة النصوص العربية الى الـ Enums الجديدة بمجرد اعتمادها ودمجها عبر الواجهة بشكل كامل. 
- لم يتم تطبيق مصادقة شاملة (Authentication/Guards) على كل مسار Transition، لذا يفترض أن يعتمد المشروع على نظام صلاحيات مركزي لاحقاً.
