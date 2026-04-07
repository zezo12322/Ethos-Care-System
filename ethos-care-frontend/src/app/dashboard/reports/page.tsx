"use client";

import Link from "next/link";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { casesService } from "@/services/cases.service";
import { familiesService } from "@/services/families.service";
import { operationsService } from "@/services/operations.service";
import {
  CaseRecord,
  FamilyRecord,
  OperationRecord,
} from "@/types/api";

type DatasetKey = "cases" | "families" | "operations";

interface ExtractPreset {
  id: string;
  dataset: DatasetKey;
  title: string;
  description: string;
  icon: string;
  badge: string;
  tone: {
    card: string;
    icon: string;
    badge: string;
  };
  matchesCase?: (item: CaseRecord) => boolean;
  matchesFamily?: (item: FamilyRecord) => boolean;
  matchesOperation?: (item: OperationRecord) => boolean;
}

const DATASET_META: Record<
  DatasetKey,
  {
    label: string;
    icon: string;
    sourceHref: string;
    sourceLabel: string;
  }
> = {
  cases: {
    label: "الحالات",
    icon: "folder_shared",
    sourceHref: "/dashboard/cases",
    sourceLabel: "إدارة الحالات",
  },
  families: {
    label: "الأسر",
    icon: "family_restroom",
    sourceHref: "/dashboard/families",
    sourceLabel: "إدارة الأسر",
  },
  operations: {
    label: "العمليات",
    icon: "medical_services",
    sourceHref: "/dashboard/operations",
    sourceLabel: "إدارة العمليات",
  },
};

const CASE_LIFECYCLE_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  INTAKE_REVIEW: "مراجعة مبدئية",
  FIELD_VERIFICATION: "تحقق ميداني",
  COMMITTEE_REVIEW: "مراجعة اللجنة",
  APPROVED: "معتمدة",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتملة",
  REJECTED: "مرفوضة",
  ON_HOLD: "معلقة",
  ARCHIVED: "مؤرشفة",
  TECH_REJECTED: "مرفوضة فنيًا",
};

const CASE_DECISION_LABELS: Record<string, string> = {
  PENDING_DECISION: "بانتظار القرار",
  APPROVED: "تم الاعتماد",
  REJECTED: "تم الرفض",
};

const CASE_PRIORITY_LABELS: Record<string, string> = {
  NORMAL: "عادية",
  HIGH: "عالية",
  URGENT: "عاجلة",
};

const EXTRACT_PRESETS: ExtractPreset[] = [
  {
    id: "cases-new",
    dataset: "cases",
    title: "كشف الحالات الجديدة",
    description: "كل الحالات التي ما زالت داخل دورة الاستلام والمراجعة الأولية.",
    icon: "playlist_add_check_circle",
    badge: "تشغيل يومي",
    tone: {
      card: "from-blue-50 to-cyan-50 border-blue-200/70",
      icon: "bg-blue-600 text-white",
      badge: "bg-blue-100 text-blue-700",
    },
    matchesCase: (item) =>
      ["DRAFT", "INTAKE_REVIEW", "FIELD_VERIFICATION"].includes(
        item.lifecycleStatus,
      ),
  },
  {
    id: "cases-urgent",
    dataset: "cases",
    title: "كشف الحالات العاجلة",
    description: "الحالات الحرجة ذات الأولوية القصوى والتي تحتاج متابعة فورية.",
    icon: "emergency",
    badge: "أولوية",
    tone: {
      card: "from-rose-50 to-orange-50 border-rose-200/70",
      icon: "bg-rose-600 text-white",
      badge: "bg-rose-100 text-rose-700",
    },
    matchesCase: (item) => item.priority === "URGENT",
  },
  {
    id: "cases-ready",
    dataset: "cases",
    title: "كشف الجاهز للتنفيذ",
    description: "الحالات التي وصلت لمرحلة الاعتماد أو التنفيذ ويمكن جدولة التدخل لها.",
    icon: "task_alt",
    badge: "تنفيذ",
    tone: {
      card: "from-emerald-50 to-teal-50 border-emerald-200/70",
      icon: "bg-emerald-600 text-white",
      badge: "bg-emerald-100 text-emerald-700",
    },
    matchesCase: (item) =>
      ["APPROVED", "IN_PROGRESS"].includes(item.lifecycleStatus),
  },
  {
    id: "families-eligible",
    dataset: "families",
    title: "كشف الأسر المستحقة",
    description: "قائمة الأسر التي تم تقييمها كمستحقة أو جاهزة للإدراج في التدخلات.",
    icon: "group",
    badge: "استحقاق",
    tone: {
      card: "from-amber-50 to-yellow-50 border-amber-200/70",
      icon: "bg-amber-500 text-white",
      badge: "bg-amber-100 text-amber-800",
    },
    matchesFamily: (item) => item.status === "مستحق",
  },
  {
    id: "operations-active",
    dataset: "operations",
    title: "كشف العمليات الجارية",
    description: "العمليات والحملات المفتوحة حاليًا مع نسب الإنجاز والمستهدف.",
    icon: "volunteer_activism",
    badge: "ميداني",
    tone: {
      card: "from-violet-50 to-fuchsia-50 border-violet-200/70",
      icon: "bg-violet-600 text-white",
      badge: "bg-violet-100 text-violet-700",
    },
    matchesOperation: (item) => item.status !== "مكتمل",
  },
  {
    id: "operations-completed",
    dataset: "operations",
    title: "كشف العمليات المكتملة",
    description: "الأعمال التي أُغلقت فعليًا ويمكن استخدامها في التقارير الدورية.",
    icon: "inventory",
    badge: "أرشفة",
    tone: {
      card: "from-slate-50 to-zinc-50 border-slate-200/70",
      icon: "bg-slate-700 text-white",
      badge: "bg-slate-200 text-slate-700",
    },
    matchesOperation: (item) => item.status === "مكتمل",
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ar-EG").format(value);

const formatDate = (value?: string | null) => {
  if (!value) {
    return "غير محدد";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "غير محدد";
  }

  return parsed.toLocaleDateString("ar-EG");
};

const withinDateRange = (value: string | null | undefined, from: string, to: string) => {
  if (!from && !to) {
    return true;
  }

  if (!value) {
    return false;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    if (parsed < fromDate) {
      return false;
    }
  }

  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    if (parsed > toDate) {
      return false;
    }
  }

  return true;
};

const sanitizeCsvCell = (value: string | number | null | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (filename: string, rows: Array<Array<string | number | null | undefined>>) => {
  const csv = rows
    .map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseIncomeValue = (value?: string | null) => {
  if (!value) {
    return 0;
  }

  const normalized = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildCaseSearchText = (item: CaseRecord) =>
  [
    item.id,
    item.applicantName,
    item.nationalId,
    item.caseType,
    item.location,
    item.lifecycleStatus,
    item.decisionStatus,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const buildFamilySearchText = (item: FamilyRecord) =>
  [
    item.id,
    item.headName,
    item.nationalId,
    item.phone,
    item.address,
    item.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const buildOperationSearchText = (item: OperationRecord) =>
  [
    item.id,
    item.name,
    item.type,
    item.status,
    item.location,
    item.budget,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getCaseLifecycleTone = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "REJECTED":
    case "TECH_REJECTED":
      return "bg-rose-100 text-rose-700";
    case "COMMITTEE_REVIEW":
      return "bg-violet-100 text-violet-700";
    case "FIELD_VERIFICATION":
    case "INTAKE_REVIEW":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getPriorityTone = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "text-rose-700 bg-rose-50";
    case "HIGH":
      return "text-amber-800 bg-amber-50";
    default:
      return "text-sky-700 bg-sky-50";
  }
};

const getFamilyStatusTone = (status: string) => {
  switch (status) {
    case "مستحق":
      return "bg-emerald-100 text-emerald-700";
    case "غير مستحق":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

const getOperationStatusTone = (status: string) => {
  switch (status) {
    case "مكتمل":
      return "bg-emerald-100 text-emerald-700";
    case "جاري":
      return "bg-blue-100 text-blue-700";
    case "تجهيز":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function ReportsPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceErrors, setSourceErrors] = useState<Record<DatasetKey, string>>({
    cases: "",
    families: "",
    operations: "",
  });
  const [downloadingCaseId, setDownloadingCaseId] = useState<string | null>(null);

  const [dataset, setDataset] = useState<DatasetKey>("cases");
  const [activePresetId, setActivePresetId] = useState<string>("cases-new");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [caseStatus, setCaseStatus] = useState("ALL");
  const [caseType, setCaseType] = useState("ALL");
  const [casePriority, setCasePriority] = useState("ALL");
  const [familyStatus, setFamilyStatus] = useState("ALL");
  const [operationStatus, setOperationStatus] = useState("ALL");
  const [operationType, setOperationType] = useState("ALL");

  const loadData = async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      casesService.getAll(),
      familiesService.getAll(),
      operationsService.getAll(),
    ]);

    const nextSourceErrors: Record<DatasetKey, string> = {
      cases: "",
      families: "",
      operations: "",
    };

    const [casesResult, familiesResult, operationsResult] = results;

    if (casesResult.status === "fulfilled") {
      setCases(casesResult.value);
    } else {
      console.error(casesResult.reason);
      nextSourceErrors.cases = "تعذر تحميل بيانات الحالات.";
    }

    if (familiesResult.status === "fulfilled") {
      setFamilies(familiesResult.value);
    } else {
      console.error(familiesResult.reason);
      nextSourceErrors.families = "تعذر تحميل بيانات الأسر.";
    }

    if (operationsResult.status === "fulfilled") {
      setOperations(operationsResult.value);
    } else {
      console.error(operationsResult.reason);
      nextSourceErrors.operations = "تعذر تحميل بيانات العمليات.";
    }

    setSourceErrors(nextSourceErrors);

    const failedSources = (Object.keys(nextSourceErrors) as DatasetKey[])
      .filter((key) => nextSourceErrors[key])
      .map((key) => DATASET_META[key].label);

    if (failedSources.length > 0) {
      setError(
        `تعذر تحميل بعض المصادر الآن: ${failedSources.join(
          "، ",
        )}. تم عرض البيانات المتاحة فقط.`,
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetFilters = () => {
    setActivePresetId("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCaseStatus("ALL");
    setCaseType("ALL");
    setCasePriority("ALL");
    setFamilyStatus("ALL");
    setOperationStatus("ALL");
    setOperationType("ALL");
  };

  const handleDatasetChange = (nextDataset: DatasetKey) => {
    setDataset(nextDataset);
    setActivePresetId("");
  };

  const handlePresetSelect = (preset: ExtractPreset) => {
    setDataset(preset.dataset);
    setActivePresetId(preset.id);
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setCaseStatus("ALL");
    setCaseType("ALL");
    setCasePriority("ALL");
    setFamilyStatus("ALL");
    setOperationStatus("ALL");
    setOperationType("ALL");
  };

  const activePreset =
    EXTRACT_PRESETS.find((preset) => preset.id === activePresetId) || null;
  const activeDatasetError = sourceErrors[dataset];

  const caseTypeOptions = Array.from(
    new Set(cases.map((item) => item.caseType).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, "ar"));

  const familyStatusOptions = Array.from(
    new Set(families.map((item) => item.status).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, "ar"));

  const operationTypeOptions = Array.from(
    new Set(operations.map((item) => item.type).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, "ar"));

  const operationStatusOptions = Array.from(
    new Set(operations.map((item) => item.status).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, "ar"));

  const filteredCases = cases.filter((item) => {
    if (
      activePreset?.dataset === "cases" &&
      activePreset.matchesCase &&
      !activePreset.matchesCase(item)
    ) {
      return false;
    }

    if (caseStatus !== "ALL" && item.lifecycleStatus !== caseStatus) {
      return false;
    }

    if (caseType !== "ALL" && item.caseType !== caseType) {
      return false;
    }

    if (casePriority !== "ALL" && item.priority !== casePriority) {
      return false;
    }

    if (deferredSearch && !buildCaseSearchText(item).includes(deferredSearch)) {
      return false;
    }

    return withinDateRange(item.createdAt, dateFrom, dateTo);
  });

  const filteredFamilies = families.filter((item) => {
    if (
      activePreset?.dataset === "families" &&
      activePreset.matchesFamily &&
      !activePreset.matchesFamily(item)
    ) {
      return false;
    }

    if (familyStatus !== "ALL" && item.status !== familyStatus) {
      return false;
    }

    if (deferredSearch && !buildFamilySearchText(item).includes(deferredSearch)) {
      return false;
    }

    return withinDateRange(item.lastVisit, dateFrom, dateTo);
  });

  const filteredOperations = operations.filter((item) => {
    if (
      activePreset?.dataset === "operations" &&
      activePreset.matchesOperation &&
      !activePreset.matchesOperation(item)
    ) {
      return false;
    }

    if (operationStatus !== "ALL" && item.status !== operationStatus) {
      return false;
    }

    if (operationType !== "ALL" && item.type !== operationType) {
      return false;
    }

    if (
      deferredSearch &&
      !buildOperationSearchText(item).includes(deferredSearch)
    ) {
      return false;
    }

    return withinDateRange(item.date, dateFrom, dateTo);
  });

  const summaryCards =
    dataset === "cases"
      ? [
          {
            label: "إجمالي النتائج",
            value: formatNumber(filteredCases.length),
            icon: "folder_shared",
          },
          {
            label: "حالات عاجلة",
            value: formatNumber(
              filteredCases.filter((item) => item.priority === "URGENT").length,
            ),
            icon: "emergency",
          },
          {
            label: "جاهزة للتنفيذ",
            value: formatNumber(
              filteredCases.filter((item) =>
                ["APPROVED", "IN_PROGRESS"].includes(item.lifecycleStatus),
              ).length,
            ),
            icon: "task_alt",
          },
        ]
      : dataset === "families"
        ? [
            {
              label: "إجمالي الأسر",
              value: formatNumber(filteredFamilies.length),
              icon: "group",
            },
            {
              label: "إجمالي الأفراد",
              value: formatNumber(
                filteredFamilies.reduce(
                  (total, item) => total + (item.membersCount || 0),
                  0,
                ),
              ),
              icon: "groups",
            },
            {
              label: "أسر مستحقة",
              value: formatNumber(
                filteredFamilies.filter((item) => item.status === "مستحق").length,
              ),
              icon: "verified_user",
            },
          ]
        : [
            {
              label: "إجمالي العمليات",
              value: formatNumber(filteredOperations.length),
              icon: "medical_services",
            },
            {
              label: "المستهدف الكلي",
              value: formatNumber(
                filteredOperations.reduce(
                  (total, item) => total + (item.target || 0),
                  0,
                ),
              ),
              icon: "flag",
            },
            {
              label: "المنجز الحالي",
              value: formatNumber(
                filteredOperations.reduce(
                  (total, item) => total + (item.achieved || 0),
                  0,
                ),
              ),
              icon: "trending_up",
            },
          ];

  const handleExport = () => {
    const today = new Date().toISOString().split("T")[0];

    if (dataset === "cases") {
      downloadCsv(`extract_cases_${today}.csv`, [
        [
          "رقم الحالة",
          "اسم المستفيد",
          "الرقم القومي",
          "نوع التدخل",
          "دورة الحالة",
          "القرار",
          "الأولوية",
          "الموقع",
          "تاريخ التسجيل",
        ],
        ...filteredCases.map((item) => [
          item.id,
          item.applicantName,
          item.nationalId || "",
          item.caseType,
          CASE_LIFECYCLE_LABELS[item.lifecycleStatus] || item.lifecycleStatus,
          CASE_DECISION_LABELS[item.decisionStatus] || item.decisionStatus,
          CASE_PRIORITY_LABELS[item.priority] || item.priority,
          item.location,
          formatDate(item.createdAt),
        ]),
      ]);
      return;
    }

    if (dataset === "families") {
      downloadCsv(`extract_families_${today}.csv`, [
        [
          "رقم الملف",
          "اسم العائل",
          "عدد الأفراد",
          "الدخل",
          "العنوان",
          "الهاتف",
          "حالة التقييم",
          "آخر زيارة",
        ],
        ...filteredFamilies.map((item) => [
          item.id,
          item.headName,
          item.membersCount,
          item.income || "",
          item.address || "",
          item.phone || "",
          item.status,
          formatDate(item.lastVisit),
        ]),
      ]);
      return;
    }

    downloadCsv(`extract_operations_${today}.csv`, [
      [
        "رقم العملية",
        "اسم العملية",
        "النوع",
        "الحالة",
        "التاريخ",
        "المستهدف",
        "المنجز",
        "نسبة الإنجاز",
        "المتطوعون",
        "الموقع",
      ],
      ...filteredOperations.map((item) => [
        item.id,
        item.name,
        item.type,
        item.status,
        formatDate(item.date),
        item.target,
        item.achieved,
        `${item.progress || 0}%`,
        item.volunteers,
        item.location || "غير محدد",
      ]),
    ]);
  };

  const handleCasePdf = async (id: string) => {
    try {
      setDownloadingCaseId(id);
      const blob = await casesService.getPdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
    } catch (downloadError) {
      console.error(downloadError);
      alert("تعذر إنشاء PDF لهذه الحالة الآن.");
    } finally {
      setDownloadingCaseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-[linear-gradient(135deg,rgba(16,90,140,0.10),rgba(255,255,255,0.98)_40%,rgba(0,132,116,0.08))] p-6 shadow-[0px_18px_50px_-28px_rgba(0,40,38,0.35)]">
        <div className="absolute inset-y-0 left-0 w-48 bg-[radial-gradient(circle_at_center,rgba(16,90,140,0.12),transparent_65%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-primary shadow-sm">
              <span className="material-symbols-outlined text-[18px]">table_view</span>
              الاستخراجات التشغيلية
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline text-on-surface">
                مركز الاستخراجات والكشوف
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-on-surface-variant">
                شاشة عملية على نفس منطق أنظمة الاستخراجات المرجعية: كشوف جاهزة
                للتشغيل اليومي، فلترة تفصيلية، معاينة مباشرة، وتصدير CSV من
                نفس النتائج المعروضة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-on-surface-variant">
              <span className="rounded-full bg-white/90 px-3 py-1.5">
                {formatNumber(cases.length)} حالة
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1.5">
                {formatNumber(families.length)} أسرة
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1.5">
                {formatNumber(operations.length)} عملية
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-container-lowest"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              تحديث البيانات
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              تصدير الاستخراج الحالي
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface">
              كشوف جاهزة
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              اضغط على أي استخراج لتطبيقه فورًا ثم عدل الفلاتر إذا احتجت.
            </p>
          </div>
          {activePreset && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              إلغاء القيد الجاهز
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXTRACT_PRESETS.map((preset) => {
            const count =
              preset.dataset === "cases"
                ? cases.filter((item) => preset.matchesCase?.(item)).length
                : preset.dataset === "families"
                  ? families.filter((item) => preset.matchesFamily?.(item)).length
                  : operations.filter((item) => preset.matchesOperation?.(item))
                      .length;

            const isActive = preset.id === activePresetId;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`rounded-[1.75rem] border bg-gradient-to-br p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-lg ${preset.tone.card} ${
                  isActive
                    ? "ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                    : "shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${preset.tone.icon}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {preset.icon}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${preset.tone.badge}`}
                  >
                    {preset.badge}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-lg font-bold text-on-surface">{preset.title}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant">
                      النتائج الحالية
                    </p>
                    <p className="text-2xl font-bold text-on-surface">
                      {formatNumber(count)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    تطبيق الاستخراج
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-outline-variant/30 bg-white shadow-sm">
        <div className="border-b border-outline-variant/20 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">
                بناء الاستخراج
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                اختر المصدر، ثم طبّق الفلاتر المطلوبة قبل التصدير أو المراجعة.
              </p>
            </div>

            <Link
              href={DATASET_META[dataset].sourceHref}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-surface-container-high px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-[18px]">
                {DATASET_META[dataset].icon}
              </span>
              {DATASET_META[dataset].sourceLabel}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(Object.keys(DATASET_META) as DatasetKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDatasetChange(key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                  dataset === key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {DATASET_META[key].icon}
                </span>
                {DATASET_META[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-bold text-on-surface">
              بحث حر
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 focus-within:border-primary">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                value={search}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => {
                    setSearch(nextValue);
                  });
                }}
                placeholder="اسم، رقم، عنوان، نوع تدخل..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-outline"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-on-surface">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-on-surface">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-2xl border border-outline-variant/40 px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-lowest"
            >
              إعادة الضبط
            </button>
          </div>
        </div>

        {dataset === "cases" && (
          <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                دورة الحالة
              </label>
              <select
                value={caseStatus}
                onChange={(event) => setCaseStatus(event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="ALL">كل الدورات</option>
                {Object.entries(CASE_LIFECYCLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                نوع التدخل
              </label>
              <select
                value={caseType}
                onChange={(event) => setCaseType(event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="ALL">كل الأنواع</option>
                {caseTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                الأولوية
              </label>
              <select
                value={casePriority}
                onChange={(event) => setCasePriority(event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="ALL">كل الأولويات</option>
                {Object.entries(CASE_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {dataset === "families" && (
          <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                حالة التقييم
              </label>
              <select
                value={familyStatus}
                onChange={(event) => setFamilyStatus(event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="ALL">كل الحالات</option>
                {familyStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {dataset === "operations" && (
          <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                حالة العملية
              </label>
              <select
                value={operationStatus}
                onChange={(event) => setOperationStatus(event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="ALL">كل الحالات</option>
                {operationStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                نوع العملية
              </label>
              <select
                value={operationType}
                onChange={(event) => setOperationType(event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="ALL">كل الأنواع</option>
                {operationTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryCards.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-outline-variant/30 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface-variant">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-bold font-headline text-on-surface">
                  {item.value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white shadow-sm">
        <div className="border-b border-outline-variant/20 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">
                معاينة الاستخراج
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {activePreset
                  ? `${activePreset.title} • ${DATASET_META[dataset].label}`
                  : `كل ${DATASET_META[dataset].label} بعد تطبيق الفلاتر الحالية`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-bold text-on-surface">
                {dataset === "cases"
                  ? `${formatNumber(filteredCases.length)} نتيجة`
                  : dataset === "families"
                    ? `${formatNumber(filteredFamilies.length)} نتيجة`
                    : `${formatNumber(filteredOperations.length)} نتيجة`}
              </span>
              {activePreset && (
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  {activePreset.badge}
                </span>
              )}
              {activeDatasetError && (
                <span className="rounded-full bg-error/10 px-3 py-1.5 text-xs font-bold text-error">
                  المصدر الحالي غير متاح
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm font-bold text-on-surface-variant">
              جارٍ تجهيز بيانات الاستخراج...
            </div>
          ) : dataset === "cases" ? (
            <table className="w-full min-w-[1100px] border-collapse text-right">
              <thead className="bg-surface-container-lowest text-sm text-on-surface-variant">
                <tr>
                  <th className="px-5 py-4 font-bold">المستفيد / رقم الحالة</th>
                  <th className="px-5 py-4 font-bold">نوع التدخل</th>
                  <th className="px-5 py-4 font-bold">الدورة</th>
                  <th className="px-5 py-4 font-bold">القرار</th>
                  <th className="px-5 py-4 font-bold">الأولوية</th>
                  <th className="px-5 py-4 font-bold">الموقع</th>
                  <th className="px-5 py-4 font-bold">التاريخ</th>
                  <th className="px-5 py-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {activeDatasetError ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-error"
                    >
                      {activeDatasetError}
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-on-surface-variant"
                    >
                      لا توجد حالات مطابقة للفلاتر الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-surface-container-lowest/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-on-surface">
                          {item.applicantName}
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-on-surface-variant">
                          {item.id.slice(0, 8).toUpperCase()}
                          {item.nationalId ? ` • ${item.nationalId}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {item.caseType}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getCaseLifecycleTone(item.lifecycleStatus)}`}
                        >
                          {CASE_LIFECYCLE_LABELS[item.lifecycleStatus] ||
                            item.lifecycleStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {CASE_DECISION_LABELS[item.decisionStatus] ||
                          item.decisionStatus}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getPriorityTone(item.priority)}`}
                        >
                          {CASE_PRIORITY_LABELS[item.priority] || item.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {item.location}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/cases/${item.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                            title="عرض الحالة"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </Link>
                          <button
                            onClick={() => void handleCasePdf(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-tertiary/10 text-tertiary transition-colors hover:bg-tertiary hover:text-white"
                            title="PDF"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {downloadingCaseId === item.id ? "hourglass_top" : "picture_as_pdf"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : dataset === "families" ? (
            <table className="w-full min-w-[980px] border-collapse text-right">
              <thead className="bg-surface-container-lowest text-sm text-on-surface-variant">
                <tr>
                  <th className="px-5 py-4 font-bold">العائل / رقم الملف</th>
                  <th className="px-5 py-4 font-bold">عدد الأفراد</th>
                  <th className="px-5 py-4 font-bold">الدخل</th>
                  <th className="px-5 py-4 font-bold">العنوان</th>
                  <th className="px-5 py-4 font-bold">الهاتف</th>
                  <th className="px-5 py-4 font-bold">الحالة</th>
                  <th className="px-5 py-4 font-bold">آخر زيارة</th>
                  <th className="px-5 py-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {activeDatasetError ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-error"
                    >
                      {activeDatasetError}
                    </td>
                  </tr>
                ) : filteredFamilies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-on-surface-variant"
                    >
                      لا توجد أسر مطابقة للفلاتر الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredFamilies.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-surface-container-lowest/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-on-surface">{item.headName}</p>
                        <p className="mt-1 text-[11px] font-mono text-on-surface-variant">
                          {item.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {formatNumber(item.membersCount || 0)}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant" dir="ltr">
                        {parseIncomeValue(item.income)
                          ? `${formatNumber(parseIncomeValue(item.income))} ج.م`
                          : item.income || "غير محدد"}
                      </td>
                      <td className="max-w-[220px] px-5 py-4 text-on-surface-variant">
                        <span className="line-clamp-2">{item.address || "غير محدد"}</span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {item.phone || "غير محدد"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getFamilyStatusTone(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {formatDate(item.lastVisit)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            href={`/dashboard/families/${item.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                            title="عرض الأسرة"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[980px] border-collapse text-right">
              <thead className="bg-surface-container-lowest text-sm text-on-surface-variant">
                <tr>
                  <th className="px-5 py-4 font-bold">العملية</th>
                  <th className="px-5 py-4 font-bold">النوع</th>
                  <th className="px-5 py-4 font-bold">الحالة</th>
                  <th className="px-5 py-4 font-bold">التاريخ</th>
                  <th className="px-5 py-4 font-bold">المستهدف</th>
                  <th className="px-5 py-4 font-bold">المنجز</th>
                  <th className="px-5 py-4 font-bold">المتطوعون</th>
                  <th className="px-5 py-4 font-bold">المكان</th>
                  <th className="px-5 py-4 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {activeDatasetError ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-error"
                    >
                      {activeDatasetError}
                    </td>
                  </tr>
                ) : filteredOperations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-on-surface-variant"
                    >
                      لا توجد عمليات مطابقة للفلاتر الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredOperations.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-surface-container-lowest/50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-on-surface">{item.name}</p>
                        <p className="mt-1 text-[11px] font-mono text-on-surface-variant">
                          {item.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {item.type}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getOperationStatusTone(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {formatNumber(item.target || 0)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-on-surface">
                            {formatNumber(item.achieved || 0)}
                          </p>
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-container-highest">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {formatNumber(item.volunteers || 0)}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">
                        {item.location || "غير محدد"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center">
                          <Link
                            href="/dashboard/operations"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                            title="فتح العمليات"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              open_in_new
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
