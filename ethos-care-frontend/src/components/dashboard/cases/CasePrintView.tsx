"use client";

import React from "react";
import { CaseRecord } from "@/types/api";

interface CasePrintViewProps {
  caseRecord: CaseRecord;
}

function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3"
        >
          <div className="text-xs text-on-surface-variant">{item.label}</div>
          <div className="mt-1 text-sm font-bold text-on-surface">
            {item.value || "غير محدد"}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-on-surface">{title}</h2>
      {children}
    </section>
  );
}

function formatPriority(priority: string) {
  if (priority === "URGENT") return "عاجل";
  if (priority === "HIGH") return "عالي";
  if (priority === "NORMAL") return "عادي";
  return priority || "غير محدد";
}

function formatManagerDecision(value?: string) {
  if (value === "APPROVE") return "اعتماد";
  if (value === "RETURN") return "إعادة للباحث";
  if (value === "REJECT") return "رفض";
  return "بانتظار الاعتماد";
}

export default function CasePrintView({ caseRecord }: CasePrintViewProps) {
  const formData = caseRecord.formData;
  const familyMembers = formData?.family.members ?? [];
  const possessionItems = formData?.possessions.items ?? [];
  const selectedSupportItems =
    formData?.support.items.filter((item) => item.selected) ?? [];
  const selectedSupportGroups = Array.from(
    new Set(selectedSupportItems.map((item) => item.category)),
  ).map((category) => ({
    category,
    items: selectedSupportItems.filter((item) => item.category === category),
  }));

  return (
    <div className="space-y-6 print:space-y-4">
      <section className="overflow-hidden rounded-[28px] border border-outline-variant/30 bg-white shadow-sm">
        <div className="bg-primary px-6 py-5 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm text-white/80">بيان حالة</div>
              <h1 className="mt-1 text-3xl font-bold">
                {formData?.person.fullName || caseRecord.applicantName}
              </h1>
              <p className="mt-2 text-sm text-white/85">
                رقم الحالة: {caseRecord.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="grid gap-2 text-sm md:text-left">
              <div>نوع الدعم: {caseRecord.caseType}</div>
              <div>الأولوية: {formatPriority(caseRecord.priority)}</div>
              <div>
                تاريخ التسجيل:{" "}
                {new Date(caseRecord.createdAt).toLocaleDateString("ar-EG")}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 bg-surface-container-lowest px-6 py-4 md:grid-cols-4">
          <div className="rounded-2xl bg-surface-container-low px-4 py-3">
            <div className="text-xs text-on-surface-variant">الحالة التشغيلية</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {caseRecord.lifecycleStatus}
            </div>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-4 py-3">
            <div className="text-xs text-on-surface-variant">القرار</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {caseRecord.decisionStatus}
            </div>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-4 py-3">
            <div className="text-xs text-on-surface-variant">استيفاء الملف</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {caseRecord.completenessStatus}
            </div>
          </div>
          <div className="rounded-2xl bg-surface-container-low px-4 py-3">
            <div className="text-xs text-on-surface-variant">الموقع</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {caseRecord.location}
            </div>
          </div>
        </div>
      </section>

      <Section title="بيانات الحالة">
        <DetailGrid
          items={[
            {
              label: "الاسم كامل",
              value: formData?.person.fullName || caseRecord.applicantName,
            },
            {
              label: "الرقم القومي",
              value: formData?.person.nationalId || caseRecord.nationalId,
            },
            { label: "الديانة", value: formData?.person.religion },
            { label: "العمر", value: formData?.person.age },
            { label: "النوع", value: formData?.person.gender },
            { label: "رقم المحمول", value: formData?.person.mobile },
            { label: "الوظيفة", value: formData?.person.job },
            { label: "الدخل الشهري", value: formData?.person.monthlyIncome },
            { label: "المؤهل التعليمي", value: formData?.person.educationState },
            {
              label: "نوع التعليم",
              value: formData?.person.educationState === "طالب" ? formData?.person.educationType : "غير منطبق",
            },
            {
              label: "المرحلة الدراسية",
              value: formData?.person.educationState === "طالب" ? formData?.person.educationStage : "غير منطبق",
            },
            {
              label: "الصف الدراسي",
              value: formData?.person.educationState === "طالب" ? formData?.person.schoolYear : "غير منطبق",
            },
            { label: "المركز", value: formData?.person.center },
            { label: "القرية", value: formData?.person.village },
            { label: "الجمعية", value: formData?.person.association },
            {
              label: "الدعم التمويني",
              value: formData?.person.tamweenSupport
                ? `مستفيد - عدد المستفيدين ${formData.person.tamweenBeneficiaries || "غير محدد"}`
                : "غير مستفيد",
            },
          ]}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">العنوان التفصيلي</div>
            <div className="mt-1 whitespace-pre-wrap text-sm font-medium text-on-surface">
              {formData?.person.detailedAddress || "غير محدد"}
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">الوصف المختصر</div>
            <div className="mt-1 whitespace-pre-wrap text-sm font-medium text-on-surface">
              {caseRecord.description || "لا يوجد وصف مدخل"}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
          <div className="text-xs text-on-surface-variant">المرفقات</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData?.person.attachments?.length ? (
              formData.person.attachments.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-on-surface-variant">لا توجد مرفقات محددة</span>
            )}
          </div>
        </div>
      </Section>

      <Section title="بيانات الأسرة">
        {familyMembers.length ? (
          <div className="overflow-hidden rounded-2xl border border-outline-variant/20">
            <table className="min-w-full divide-y divide-outline-variant/20 text-right text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-bold">الاسم</th>
                  <th className="px-4 py-3 font-bold">القرابة</th>
                  <th className="px-4 py-3 font-bold">الرقم القومي</th>
                  <th className="px-4 py-3 font-bold">السن</th>
                  <th className="px-4 py-3 font-bold">النوع</th>
                  <th className="px-4 py-3 font-bold">المحمول</th>
                  <th className="px-4 py-3 font-bold">التعليم</th>
                  <th className="px-4 py-3 font-bold">الوظيفة</th>
                  <th className="px-4 py-3 font-bold">الدخل الشهري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-white">
                {familyMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">{member.name || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.relation || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.nationalId || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.age || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.gender || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.mobile || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.education || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.job || "غير محدد"}</td>
                    <td className="px-4 py-3">{member.monthlyIncome || "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-4 py-4 text-sm text-on-surface-variant">
            لا توجد بيانات أفراد أسرة مدخلة.
          </div>
        )}
      </Section>

      <Section title="بيانات السكن">
        <DetailGrid
          items={[
            { label: "وصف حالة السكن", value: formData?.housing.description },
            { label: "طبيعة السكن", value: formData?.housing.residencyType },
            {
              label: "قيمة الإيجار",
              value:
                formData?.housing.residencyType === "إيجار"
                  ? formData?.housing.rentAmount
                  : "غير منطبق",
            },
            { label: "طبيعة دورات المياه", value: formData?.housing.bathroomType },
            { label: "حالة دورات المياه", value: formData?.housing.bathroomState },
            { label: "الكهرباء", value: formData?.housing.electricity },
            { label: "عداد المياه", value: formData?.housing.water },
            { label: "طلمبة المياه", value: formData?.housing.waterPump },
            { label: "أجهزة الطبخ", value: formData?.housing.cookware },
            { label: "التلفاز", value: formData?.housing.tv },
            { label: "الثلاجة", value: formData?.housing.fridge },
            { label: "الغسالة", value: formData?.housing.washingMachine },
            { label: "فرن خبيز", value: formData?.housing.oven },
            { label: "حاسب آلي", value: formData?.housing.computer },
            { label: "إنترنت", value: formData?.housing.internet },
          ]}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(
            [
              ["السقف", formData?.housing.roof],
              ["الأرضية", formData?.housing.floor],
              ["المدخل", formData?.housing.entrance],
              ["الحوائط", formData?.housing.walls],
              ["وسيلة المواصلات", formData?.housing.transport],
            ] as Array<[string, string[] | undefined]>
          ).map(([label, values]) => (
            <div
              key={label}
              className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3"
            >
              <div className="text-xs text-on-surface-variant">{label}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(values as string[] | undefined)?.length ? (
                  (values as string[]).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-on-surface-variant">غير محدد</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="الحيازات">
        <DetailGrid
          items={[
            {
              label: "هل توجد حيازات؟",
              value: formData?.possessions.hasPossessions || "غير محدد",
            },
          ]}
        />
        {possessionItems.length ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/20">
            <table className="min-w-full divide-y divide-outline-variant/20 text-right text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-bold">الحيازة</th>
                  <th className="px-4 py-3 font-bold">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-white">
                {possessionItems
                  .filter((item) => item.selected || item.notes)
                  .map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.name || "غير محدد"}</td>
                    <td className="px-4 py-3">{item.notes || "غير محدد"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Section>

      <Section title="الدخل والمصروفات">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-outline-variant/20">
            <div className="bg-success/10 px-4 py-3 text-sm font-bold text-success">
              الدخل
            </div>
            <div className="divide-y divide-outline-variant/10 bg-white">
              {Object.entries(formData?.finance.incomes ?? {}).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{label}</span>
                  <strong>{value || "0"}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-outline-variant/20">
            <div className="bg-error/10 px-4 py-3 text-sm font-bold text-error">
              المصروفات
            </div>
            <div className="divide-y divide-outline-variant/10 bg-white">
              {Object.entries(formData?.finance.expenses ?? {}).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{label}</span>
                  <strong>{value || "0"}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
          <div className="text-xs text-on-surface-variant">صافي الدخل الشهري</div>
          <div className="mt-1 text-base font-bold text-on-surface">
            {formData?.finance.netMonthlyIncome || "0"}
          </div>
        </div>
      </Section>

      <Section title="تصنيف الحالة">
        <DetailGrid
          items={[
            {
              label: "درجة التصنيف",
              value: formData?.classification.degree || "غير محدد",
            },
          ]}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {formData?.classification.tags?.length ? (
            formData.classification.tags.map((item) => (
              <span
                key={item}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-on-surface-variant">لا توجد تصنيفات محددة</span>
          )}
        </div>
      </Section>

      <Section title="الدعم الحالي">
        {selectedSupportGroups.length ? (
          <div className="space-y-4">
            {selectedSupportGroups.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl border border-outline-variant/20 bg-white p-4"
              >
                <h3 className="mb-3 text-base font-bold text-on-surface">
                  {group.category}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-surface-container-low px-4 py-3"
                    >
                      <div className="text-sm font-bold text-on-surface">
                        {item.name}
                      </div>
                      <div className="mt-2 text-xs text-on-surface-variant">
                        الوصف: {item.notes || "لا يوجد"}
                      </div>
                      <div className="mt-1 text-xs text-on-surface-variant">
                        التكلفة: {item.cost || "غير محددة"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-4 py-4 text-sm text-on-surface-variant">
            لا توجد خدمات محددة لهذه الحالة.
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">الباحث</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {formData?.support.specialistName || "غير محدد"}
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">رأي الباحث</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {formData?.support.specialistOpinion || "غير محدد"}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
          <div className="text-xs text-on-surface-variant">ملاحظات الباحث</div>
          <div className="mt-1 whitespace-pre-wrap text-sm font-medium text-on-surface">
            {formData?.support.specialistNotes || "لا توجد ملاحظات"}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">قرار مسؤول إدارة الحالة</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {formatManagerDecision(formData?.support.managerDecision)}
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">تعليقات مسؤول إدارة الحالة</div>
            <div className="mt-1 whitespace-pre-wrap text-sm font-medium text-on-surface">
              {formData?.support.managerComments || "لا توجد تعليقات"}
            </div>
          </div>
        </div>
        {formData?.support.disabilitySupportType ? (
          <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-white px-4 py-3">
            <div className="text-xs text-on-surface-variant">دعم للإعاقات ذوي الهمم</div>
            <div className="mt-1 text-sm font-bold text-on-surface">
              {formData.support.disabilitySupportType}
            </div>
            <div className="mt-2 text-sm text-on-surface-variant">
              {formData.support.disabilitySupportDescription || "لا يوجد وصف"}
            </div>
            <div className="mt-1 text-xs text-on-surface-variant">
              التكلفة: {formData.support.disabilitySupportCost || "غير محددة"}
            </div>
          </div>
        ) : null}
      </Section>
    </div>
  );
}
