"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { familiesService } from "@/services/families.service";
import { locationsService } from "@/services/locations.service";
import { casesService, CreateCaseDto } from "@/services/cases.service";
import {
  CaseIntakeFamilyMember,
  CaseIntakeFormData,
  CaseIntakePossessionItem,
  CaseIntakeSupportItem,
  CaseRecord,
  FamilyRecord,
  LocationRecord,
} from "@/types/api";
import { useOfflineDraft } from "@/hooks/useOfflineDraft";
import {
  readCache,
  writeCache,
  LOCATIONS_CACHE_KEY,
  FAMILIES_CACHE_KEY,
} from "@/lib/offlineCache";
import { useToast } from "@/components/ui/Toast";
import SyncStatusBar from "./SyncStatusBar";

function isNetworkError(error: unknown): boolean {
  const candidate = error as { isAxiosError?: boolean; response?: unknown } | null;
  return Boolean(candidate?.isAxiosError) && !candidate?.response;
}

type CasePriority = "NORMAL" | "HIGH" | "URGENT";
type ManagerDecision = "PENDING" | "APPROVE" | "RETURN" | "REJECT";

interface CaseFormDraft {
  caseType: string;
  caseTypes: string[];
  priority: CasePriority;
  description: string;
  formData: CaseIntakeFormData;
}

interface CaseIntakeFormProps {
  mode: "create" | "edit";
  caseRecord?: CaseRecord | null;
  currentUserName: string;
  currentUserRole: string;
  onSubmit: (payload: CreateCaseDto) => Promise<void>;
  onDelete?: () => Promise<void>;
}

interface SectionCardProps {
  id: string;
  title: string;
  subtitle?: React.ReactNode;
  open: boolean;
  onToggle: (sectionId: string) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const CASE_TYPES = [
  "مساعدة مالية",
  "دعم منزلي",
  "سقف",
  "دعم طبي",
  "منح دراسية",
  "تمكين اقتصادي",
  "مواد غذائية",
  "مرافق وخدمات",
  "تجهيز عرائس",
] as const;

// خريطة ربط نوع الدعم/التدخل بأقسام الدعم التي تظهر له (إظهار المرتبط فقط)
const CASE_TYPE_TO_SUPPORT_CATEGORIES: Record<string, string[]> = {
  "مساعدة مالية": ["المساعدات المالية"],
  "دعم منزلي": ["الدعم المنزلي"],
  سقف: ["الدعم المنزلي"],
  "دعم طبي": ["دعم طبي"],
  "منح دراسية": ["المنح الدراسية"],
  "تمكين اقتصادي": ["المساعدات المالية"],
  "مواد غذائية": ["دعم موسمي"],
  "مرافق وخدمات": ["المرافق"],
  "تجهيز عرائس": ["تجهيز عرائس"],
};

const RELIGIONS = ["مسلم", "مسيحي"] as const;
const PRIORITY_OPTIONS: Array<{ label: string; value: CasePriority }> = [
  { label: "عادي", value: "NORMAL" },
  { label: "عالي", value: "HIGH" },
  { label: "عاجل", value: "URGENT" },
];

const RESEARCHER_OPINIONS = [
  "يوصى بالدعم",
  "يحتاج استكمال",
  "لا يوصى بالدعم حاليًا",
] as const;

const MANAGER_DECISIONS: Array<{ label: string; value: ManagerDecision }> = [
  { label: "بانتظار الاعتماد", value: "PENDING" },
  { label: "اعتماد", value: "APPROVE" },
  { label: "إعادة للباحث", value: "RETURN" },
  { label: "رفض", value: "REJECT" },
];

const RELATION_OPTIONS = [
  "زوج",
  "زوجة",
  "ابن",
  "ابنة",
  "أب",
  "أم",
  "الجد",
  "الجدة",
] as const;

const EDUCATION_STATES = [
  "طفل",
  "غير متعلم",
  "محو أمية",
  "حاصل على الابتدائية",
  "حاصل على الاعدادية",
  "حاصل على الثانوية",
  "حاصل على دبلوم",
  "حاصل على بكالوريوس/ليسانس",
  "حاصل على الماجستير",
  "حاصل على الدكتوراة",
  "طالب",
] as const;

const EDUCATION_TYPES = ["حكومي", "أزهري", "خاص", "فني"] as const;
const EDUCATION_STAGES = [
  "تمهيدي",
  "ابتدائي",
  "إعدادي",
  "ثانوي",
  "جامعي",
  "فني",
] as const;
const SCHOOL_YEARS = [
  "الأول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
] as const;

const ATTACHMENT_OPTIONS = [
  "بطاقة الرقم القومي",
  "شهادة الميلاد",
  "تقرير طبي",
  "برنت تأميني",
  "إثبات قيد مدرسي",
] as const;

const RESIDENCY_TYPES = ["خاص", "إيجار", "منزل عائلة"] as const;
const ROOF_OPTIONS = ["لا يوجد", "مسلح", "خشب", "صاج", "جريد"] as const;
const FLOOR_OPTIONS = ["تراب", "أسمنت", "بلاط", "سيراميك"] as const;
const ENTRANCE_OPTIONS = ["تراب", "أسمنت", "بلاط", "سيراميك", "رخام"] as const;
const WALL_OPTIONS = ["طوب أحمر", "بلوك", "محارة", "دهان", "طوب لبن"] as const;
const TRANSPORT_OPTIONS = ["سيارة", "موتوسيكل", "توك توك", "أخرى"] as const;

const HOUSE_RADIO_OPTIONS: Record<string, string[]> = {
  bathroomType: ["خاص", "مشترك"],
  bathroomState: ["آدمي", "غير آدمي"],
  electricity: ["لا يوجد", "ممارسة", "عداد"],
  water: ["لا يوجد", "طرمبة", "عداد"],
  waterPump: ["لا يوجد", "يوجد"],
  cookware: ["لا يوجد", "غاز", "انابيب"],
  tv: ["لا يوجد", "عادي", "شاشة"],
  fridge: ["لا يوجد", "يوجد"],
  washingMachine: ["لا يوجد", "عادية", "هاف", "أوتوماتيك"],
  oven: ["لا يوجد", "يوجد"],
  computer: ["لا يوجد", "للتعليم", "للتسلية"],
  internet: ["لا يوجد", "يوجد"],
};

const DEFAULT_INCOMES: Record<string, string> = {
  "دخل رب الأسرة": "0",
  "دخل أفراد الأسرة": "0",
  معاش: "0",
  "تكافل وكرامة": "0",
  "دخل إضافي": "0",
};

const DEFAULT_EXPENSES: Record<string, string> = {
  إيجار: "0",
  مياه: "0",
  كهرباء: "0",
  غاز: "0",
  "أكل وشرب": "0",
  تعليم: "0",
  "علاج شهري": "0",
  أقساط: "0",
  قروض: "0",
  أخرى: "0",
};

const CLASSIFICATION_OPTIONS = [
  "مطلق/مطلقة/هجر",
  "أيتام",
  "مسنين",
  "منعدم الدخل",
  "الدخل لا يكفي",
  "تكافل وكرامة",
  "مسجون/غارمين",
  "أمراض مزمنة",
  "ذوي إعاقة",
] as const;

const CLASSIFICATION_DEGREES = [
  "حالة متوسطة",
  "حالة فوق متوسطة",
  "حالة قصوى",
] as const;

const SUPPORT_CATALOG: Array<{ category: string; items: string[] }> = [
  {
    category: "المساعدات المالية",
    items: ["مساعدة مالية شهرية", "قرض", "سداد إيجار"],
  },
  {
    category: "دعم طبي",
    items: ["علاج", "عملية جراحية", "أدوية", "تحاليل", "نظارات"],
  },
  {
    category: "المرافق",
    items: ["وصلة مياه", "توصيل كهرباء"],
  },
  {
    category: "المنح الدراسية",
    items: [
      "منح دراسية",
      "مصروفات دراسية",
      "شنط وأدوات",
      "زي مدرسي",
      "دروس تقوية",
    ],
  },
  {
    category: "الدعم المنزلي",
    items: ["أثاث", "أجهزة منزلية", "ترميم منزل"],
  },
  {
    category: "دعم موسمي",
    items: ["سلة غذائية", "لحوم", "كسوة موسمية", "معارض كساء"],
  },
  {
    category: "تجهيز عرائس",
    items: ["تجهيز عرائس"],
  },
];

const DISABILITY_SUPPORT_OPTIONS = [
  "كرسي متحرك",
  "طرف صناعي",
  "سماعات أذن",
  "مشاية",
  "عكاز",
  "أخرى",
] as const;

const POSSESSION_CATALOG = [
  { id: "livestock", name: "ماشية" },
  { id: "agricultural-land", name: "أراضي زراعية" },
  { id: "owned-land", name: "أراضي ملك" },
  { id: "other", name: "أخرى" },
] as const;

const SECTION_IDS = [
  "case",
  "family",
  "housing",
  "possessions",
  "finance",
  "classification",
  "support",
  "history",
] as const;

function createLocalId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildRegionString(center: string, village: string) {
  return [center, village].filter(Boolean).join(" > ");
}

function parseRegionValue(value?: string | null) {
  if (!value) {
    return { center: "", village: "" };
  }

  const normalized = value.replace(/\s*>\s*/g, ">").replace(/\s*-\s*/g, ">");
  const [center = "", village = ""] = normalized.split(">").map((item) => item.trim());
  return { center, village };
}

function buildAssociationRegion(center: string, village: string) {
  return [center, village].filter(Boolean).join(" > ");
}

function matchesAssociationLocation(
  location: LocationRecord,
  center: string,
  village: string,
) {
  if (location.type !== "جمعية") {
    return false;
  }

  const normalized = location.region.replace(/\s*>\s*/g, " > ").trim();
  return (
    normalized === buildAssociationRegion(center, village) ||
    normalized === village
  );
}

function normalizeCaseType(value?: string | null) {
  if (value === "تدخل طبي") return "دعم طبي";
  if (value === "تعليم") return "منح دراسية";
  if (value === "أجهزة تعويضية") return "دعم طبي";
  if (value === "سكن كريم") return "سقف";
  return value || "مساعدة مالية";
}

// نوع الدعم/التدخل أصبح اختيارًا متعددًا: نخزّنه نصًا مفصولًا ونحوّله لمصفوفة عند العرض
const CASE_TYPE_SEPARATOR = "، ";

function parseCaseTypes(value?: string | null): string[] {
  if (!value) {
    return [];
  }
  return Array.from(
    new Set(
      value
        .split(/[،,]/)
        .map((item) => normalizeCaseType(item.trim()))
        .filter(Boolean),
    ),
  );
}

function joinCaseTypes(values: string[]): string {
  return values.filter(Boolean).join(CASE_TYPE_SEPARATOR);
}

function normalizeEducationState(value?: string | null) {
  if (!value || value === "غير محدد") {
    return "";
  }
  return value;
}

function normalizeRelation(value?: string | null) {
  if (!value) {
    return "ابن";
  }
  if (value === "ابن/ة") {
    return "ابن";
  }
  return value;
}

function toNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isStudent(value?: string) {
  return value === "طالب";
}

function deriveBirthInfo(nationalId: string) {
  const trimmed = nationalId.trim();
  if (!/^\d{14}$/.test(trimmed)) {
    return null;
  }

  const centuryCode = trimmed[0];
  const year = Number(trimmed.slice(1, 3));
  const month = Number(trimmed.slice(3, 5));
  const day = Number(trimmed.slice(5, 7));
  const century =
    centuryCode === "2" ? 1900 : centuryCode === "3" ? 2000 : null;

  if (!century || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const birthDate = new Date(century + year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return {
    birthDate: birthDate.toISOString().split("T")[0],
    age: String(Math.max(age, 0)),
    gender: Number(trimmed[12]) % 2 === 0 ? "أنثى" : "ذكر",
  };
}

function createEmptyFamilyMember(): CaseIntakeFamilyMember {
  return {
    id: createLocalId("member"),
    name: "",
    relation: "ابن",
    classification: "",
    nationalId: "",
    age: "",
    gender: "",
    mobile: "",
    education: "",
    educationType: "",
    educationStage: "",
    schoolYear: "",
    job: "",
    monthlyIncome: "0",
  };
}

function buildFamilyMembersFromRecord(family?: FamilyRecord | null): CaseIntakeFamilyMember[] {
  if (!family?.familyMembers?.length) {
    return [];
  }

  return family.familyMembers.map((member) => ({
    ...createEmptyFamilyMember(),
    id: member.id,
    name: member.name,
    relation: normalizeRelation(member.relation),
    age: member.age ?? "",
    education: normalizeEducationState(member.education ?? ""),
    nationalId: member.nationalId ?? "",
    gender: member.gender ?? "",
    mobile: member.mobile ?? "",
    job: member.job ?? "",
    monthlyIncome: member.monthlyIncome ?? "0",
    classification: member.classification ?? "",
    educationType: member.educationType ?? "",
    educationStage: member.educationStage ?? "",
    schoolYear: member.schoolYear ?? "",
  }));
}

function flattenSupportItems(): CaseIntakeSupportItem[] {
  return SUPPORT_CATALOG.flatMap(({ category, items }) =>
    items.map((name) => ({
      id: `${category}-${name}`.replace(/\s+/g, "-"),
      category,
      name,
      selected: false,
      notes: "",
      cost: "",
    })),
  );
}

function mergeSupportItems(existingItems?: CaseIntakeSupportItem[]) {
  const baseItems = flattenSupportItems();
  if (!existingItems?.length) {
    return baseItems;
  }

  return baseItems.map((item) => {
    const found = existingItems.find((candidate) => candidate.id === item.id);
    return found ? { ...item, ...found } : item;
  });
}

function mergePossessionItems(existingItems?: CaseIntakePossessionItem[]) {
  return POSSESSION_CATALOG.map((entry) => {
    const found = existingItems?.find((item) => item.name === entry.name);
    return {
      id: found?.id || entry.id,
      name: entry.name,
      selected: found?.selected ?? !!found,
      notes: found?.notes ?? "",
    };
  });
}

function buildInitialFormData(
  caseRecord: CaseRecord | null | undefined,
  currentUserName: string,
): CaseFormDraft {
  const existing = caseRecord?.formData;
  const parsedRegion = parseRegionValue(existing?.person.region ?? caseRecord?.location);
  const center = existing?.person.center ?? caseRecord?.family?.city ?? parsedRegion.center;
  const village =
    existing?.person.village ?? caseRecord?.family?.village ?? parsedRegion.village;

  const parsedCaseTypes = parseCaseTypes(caseRecord?.caseType);
  const normalizedCaseTypes =
    parsedCaseTypes.length > 0 ? parsedCaseTypes : ["مساعدة مالية"];

  // دمج ملخص الحالة القديم مع ملاحظات الباحث في خانة واحدة دون فقدان أي منهما
  const baseDescription = caseRecord?.description ?? "";
  const existingNotes = existing?.support.specialistNotes ?? "";
  const mergedDescription = Array.from(
    new Set([baseDescription, existingNotes].map((v) => v.trim()).filter(Boolean)),
  ).join("\n");

  return {
    caseType: joinCaseTypes(normalizedCaseTypes),
    caseTypes: normalizedCaseTypes,
    priority: (caseRecord?.priority as CasePriority | undefined) ?? "NORMAL",
    description: mergedDescription,
    formData: {
      person: {
        fullName:
          existing?.person.fullName ??
          caseRecord?.applicantName ??
          caseRecord?.family?.headName ??
          "",
        nationalId:
          existing?.person.nationalId ??
          caseRecord?.nationalId ??
          caseRecord?.family?.nationalId ??
          "",
        religion: existing?.person.religion ?? "مسلم",
        birthDate: existing?.person.birthDate ?? "",
        age: existing?.person.age ?? "",
        gender: existing?.person.gender ?? "",
        mobile: existing?.person.mobile ?? caseRecord?.family?.phone ?? "",
        job: existing?.person.job ?? caseRecord?.family?.job ?? "",
        monthlyIncome:
          existing?.person.monthlyIncome ?? caseRecord?.family?.income ?? "0",
        educationState: normalizeEducationState(
          existing?.person.educationState ?? caseRecord?.family?.education,
        ),
        educationType: existing?.person.educationType ?? "",
        educationStage: existing?.person.educationStage ?? "",
        schoolYear: existing?.person.schoolYear ?? "",
        educationNotes: existing?.person.educationNotes ?? "",
        expensesExempted: existing?.person.expensesExempted ?? false,
        center,
        village,
        region: buildRegionString(center, village),
        association: existing?.person.association ?? "",
        detailedAddress:
          existing?.person.detailedAddress ??
          caseRecord?.family?.addressDetails ??
          caseRecord?.family?.address ??
          "",
        attachments: existing?.person.attachments ?? [],
        tamweenSupport: existing?.person.tamweenSupport ?? false,
        tamweenBeneficiaries: existing?.person.tamweenBeneficiaries ?? "1",
      },
      family: {
        linkedFamilyId: existing?.family.linkedFamilyId ?? caseRecord?.familyId ?? "",
        members:
          existing?.family.members?.length
            ? existing.family.members.map((member) => ({
                ...createEmptyFamilyMember(),
                ...member,
                relation: normalizeRelation(member.relation),
                education: normalizeEducationState(
                  member.education ?? member.education,
                ),
                monthlyIncome: member.monthlyIncome ?? "0",
              }))
            : buildFamilyMembersFromRecord(caseRecord?.family),
        dataComplete: existing?.family.dataComplete ?? false,
      },
      housing: {
        description: existing?.housing.description ?? "",
        residencyType: existing?.housing.residencyType ?? "خاص",
        roof: existing?.housing.roof ?? [],
        floor: existing?.housing.floor ?? [],
        entrance: existing?.housing.entrance ?? [],
        walls: existing?.housing.walls ?? [],
        bathroomType: existing?.housing.bathroomType ?? "خاص",
        bathroomState: existing?.housing.bathroomState ?? "آدمي",
        electricity: existing?.housing.electricity ?? "لا يوجد",
        water: existing?.housing.water ?? "لا يوجد",
        waterPump: existing?.housing.waterPump ?? "لا يوجد",
        cookware: existing?.housing.cookware ?? "لا يوجد",
        tv: existing?.housing.tv ?? "لا يوجد",
        fridge: existing?.housing.fridge ?? "لا يوجد",
        washingMachine: existing?.housing.washingMachine ?? "لا يوجد",
        oven: existing?.housing.oven ?? "لا يوجد",
        computer: existing?.housing.computer ?? "لا يوجد",
        internet: existing?.housing.internet ?? "لا يوجد",
        rentAmount:
          existing?.housing.rentAmount ??
          existing?.finance.expenses?.إيجار ??
          "0",
        transport: existing?.housing.transport ?? [],
        rooms: existing?.housing.rooms ?? [],
        roomsCount:
          existing?.housing.roomsCount ??
          (existing?.housing.rooms?.length
            ? String(existing.housing.rooms.length)
            : ""),
        dataComplete: existing?.housing.dataComplete ?? false,
      },
      possessions: {
        hasPossessions: existing?.possessions.hasPossessions ?? "لا",
        items: mergePossessionItems(existing?.possessions.items),
        dataComplete: existing?.possessions.dataComplete ?? false,
      },
      finance: {
        incomes: {
          ...DEFAULT_INCOMES,
          ...(existing?.finance.incomes ?? {}),
        },
        expenses: {
          ...DEFAULT_EXPENSES,
          ...(existing?.finance.expenses ?? {}),
        },
        netMonthlyIncome: existing?.finance.netMonthlyIncome ?? "0",
        dataComplete: existing?.finance.dataComplete ?? false,
      },
      classification: {
        tags: (existing?.classification.tags ?? []).filter(
          (tag) => tag !== "بدون/لا يوجد" && tag !== "أرامل",
        ),
        degree: existing?.classification.degree ?? "حالة متوسطة",
      },
      support: {
        items: mergeSupportItems(existing?.support.items),
        specialistName: existing?.support.specialistName ?? currentUserName,
        specialistNotes: mergedDescription,
        specialistOpinion:
          existing?.support.specialistOpinion ?? RESEARCHER_OPINIONS[0],
        managerDecision:
          (existing?.support.managerDecision as string | undefined) ?? "PENDING",
        managerComments: existing?.support.managerComments ?? "",
        disabilitySupportType: existing?.support.disabilitySupportType ?? "",
        disabilitySupportDescription:
          existing?.support.disabilitySupportDescription ?? "",
        disabilitySupportCost: existing?.support.disabilitySupportCost ?? "",
      },
    },
  };
}

function SectionCard({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
  footer,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-outline-variant/30 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 border-b border-outline-variant/20 bg-surface-container-lowest/60 px-6 py-5 text-right"
      >
        <div>
          <h2 className="text-xl font-bold text-on-surface">{title}</h2>
          {subtitle ? (
            <div className="mt-1 text-sm text-on-surface-variant">{subtitle}</div>
          ) : null}
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      {open ? (
        <>
          <div className="space-y-8 p-6">{children}</div>
          {footer ? (
            <div className="border-t border-outline-variant/20 bg-surface-container-lowest/40 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function pairsFromEntries(entries: Array<[string, string]>) {
  const rows: Array<Array<[string, string]>> = [];
  for (let index = 0; index < entries.length; index += 2) {
    rows.push(entries.slice(index, index + 2));
  }
  return rows;
}

export default function CaseIntakeForm({
  mode,
  caseRecord,
  currentUserName,
  currentUserRole,
  onSubmit,
  onDelete,
}: CaseIntakeFormProps) {
  const draftKey = caseRecord?.id
    ? `case-draft-${caseRecord.id}`
    : "case-draft-new";

  // Build the API payload from a draft. Shared by the online submit path and the
  // offline sync handler, so a queued submission is sent identically once back online.
  const buildCasePayload = useCallback(
    (source: CaseFormDraft): CreateCaseDto => ({
      applicantName: source.formData.person.fullName.trim(),
      nationalId: source.formData.person.nationalId.trim() || undefined,
      caseType: joinCaseTypes(source.caseTypes),
      priority: source.priority,
      description: source.description.trim() || undefined,
      location:
        buildRegionString(
          source.formData.person.center,
          source.formData.person.village,
        ) || "غير محدد",
      familyId: source.formData.family.linkedFamilyId || undefined,
      formData: {
        ...source.formData,
        person: {
          ...source.formData.person,
          region: buildRegionString(
            source.formData.person.center,
            source.formData.person.village,
          ),
        },
        support: {
          ...source.formData.support,
          specialistName:
            source.formData.support.specialistName || currentUserName,
          // ملخص الحالة/الاحتياج مدمج في ملاحظات الباحث (خانة واحدة)
          specialistNotes: source.description.trim(),
        },
      },
    }),
    [currentUserName],
  );

  const {
    loadDraft,
    saveDraft: saveDraftToLocal,
    clearDraft: clearLocalDraft,
    queueSubmission,
    syncStatus,
    isOnline,
    lastSavedAt,
    pendingCount,
  } = useOfflineDraft<CaseFormDraft>({
    storageKey: draftKey,
    // Only new-case entry is queued for offline sync — the volunteer-in-the-field case.
    onSync:
      mode === "create"
        ? async (queuedDraft) => {
            await casesService.create(buildCasePayload(queuedDraft));
          }
        : undefined,
  });

  const { toast } = useToast();

  const [draft, setDraft] = useState<CaseFormDraft>(() => {
    const local = loadDraft();
    if (local) {
      // حماية المسودّات القديمة المحفوظة قبل إضافة الاختيار المتعدد وعدد الغرف
      return {
        ...local,
        caseTypes:
          local.caseTypes && local.caseTypes.length > 0
            ? local.caseTypes
            : parseCaseTypes(local.caseType),
        formData: {
          ...local.formData,
          housing: {
            ...local.formData.housing,
            roomsCount: local.formData.housing.roomsCount ?? "",
          },
        },
      };
    }
    return buildInitialFormData(caseRecord, currentUserName);
  });
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTION_IDS.map((id) => [id, true])),
  );
  // نبدأ من الكاش المحلي حتى تظهر المراكز/الأسر فورًا حتى بدون اتصال
  const [families, setFamilies] = useState<FamilyRecord[]>(
    () => readCache<FamilyRecord[]>(FAMILIES_CACHE_KEY) ?? [],
  );
  const [locations, setLocations] = useState<LocationRecord[]>(
    () => readCache<LocationRecord[]>(LOCATIONS_CACHE_KEY) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // أخطاء التحقق بجانب كل حقل (بدل toast فقط)
  const [errors, setErrors] = useState<{
    fullName?: string;
    center?: string;
    caseTypes?: string;
  }>({});
  const fullNameRef = useRef<HTMLInputElement>(null);
  const centerRef = useRef<HTMLSelectElement>(null);
  const caseTypesRef = useRef<HTMLDivElement>(null);

  const clearError = (key: "fullName" | "center" | "caseTypes") =>
    setErrors((current) =>
      current[key] ? { ...current, [key]: undefined } : current,
    );

  const hasManagerAccess =
    currentUserRole === "MANAGER" ||
    currentUserRole === "CEO" ||
    currentUserRole === "ADMIN";

  // Auto-save draft to localStorage on every change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveDraftToLocal(draft);
  }, [draft, saveDraftToLocal]);

  useEffect(() => {
    setDraft(buildInitialFormData(caseRecord, currentUserName));
  }, [caseRecord, currentUserName]);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        const [familyRows, locationRows] = await Promise.all([
          familiesService.getAll(),
          locationsService.getAll(),
        ]);

        if (!cancelled) {
          setFamilies(familyRows);
          setLocations(locationRows);
          // تحديث الكاش لاستخدامه عند العمل بدون اتصال لاحقًا
          writeCache(FAMILIES_CACHE_KEY, familyRows);
          writeCache(LOCATIONS_CACHE_KEY, locationRows);
        }
      } catch (error) {
        // بدون اتصال أو فشل الطلب — نبقي على القوائم المخزّنة محليًا (المحمّلة من الكاش)
        console.error(error);
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const derived = deriveBirthInfo(draft.formData.person.nationalId);

    setDraft((current) => {
      const person = current.formData.person;
      const nextBirthDate = derived?.birthDate ?? "";
      const nextAge = derived?.age ?? "";
      const nextGender = derived?.gender ?? "";

      if (
        person.birthDate === nextBirthDate &&
        person.age === nextAge &&
        person.gender === nextGender
      ) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          person: {
            ...person,
            birthDate: nextBirthDate,
            age: nextAge,
            gender: nextGender,
          },
        },
      };
    });
  }, [draft.formData.person.nationalId]);

  useEffect(() => {
    if (isStudent(draft.formData.person.educationState)) {
      return;
    }

    setDraft((current) => {
      const person = current.formData.person;
      if (
        !person.educationType &&
        !person.educationStage &&
        !person.schoolYear
      ) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          person: {
            ...person,
            educationType: "",
            educationStage: "",
            schoolYear: "",
          },
        },
      };
    });
  }, [draft.formData.person.educationState]);

  useEffect(() => {
    setDraft((current) => {
      let changed = false;
      const nextMembers = current.formData.family.members.map((member) => {
        const derived = deriveBirthInfo(member.nationalId ?? "");
        const nextMember = {
          ...member,
          age: derived?.age ?? "",
          gender: derived?.gender ?? "",
          educationType: isStudent(member.education) ? member.educationType : "",
          educationStage: isStudent(member.education) ? member.educationStage : "",
          schoolYear: isStudent(member.education) ? member.schoolYear : "",
        };

        if (
          nextMember.age !== member.age ||
          nextMember.gender !== member.gender ||
          nextMember.educationType !== member.educationType ||
          nextMember.educationStage !== member.educationStage ||
          nextMember.schoolYear !== member.schoolYear
        ) {
          changed = true;
        }

        return nextMember;
      });

      if (!changed) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          family: {
            ...current.formData.family,
            members: nextMembers,
          },
        },
      };
    });
  }, [draft.formData.family.members]);

  useEffect(() => {
    setDraft((current) => {
      const center = current.formData.person.center;
      const village = current.formData.person.village;
      const nextRegion = buildRegionString(center, village);
      const nextHeadIncome = current.formData.person.monthlyIncome || "0";
      const nextFamilyIncome = String(
        current.formData.family.members.reduce(
          (sum, member) => sum + toNumber(member.monthlyIncome),
          0,
        ),
      );
      const nextRentExpense =
        current.formData.housing.residencyType === "إيجار"
          ? current.formData.housing.rentAmount || "0"
          : "0";

      const nextIncomes = {
        ...current.formData.finance.incomes,
        "دخل رب الأسرة": nextHeadIncome,
        "دخل أفراد الأسرة": nextFamilyIncome,
      };
      const nextExpenses = {
        ...current.formData.finance.expenses,
        إيجار: nextRentExpense,
      };

      if (
        current.formData.person.region === nextRegion &&
        current.formData.finance.incomes["دخل رب الأسرة"] === nextHeadIncome &&
        current.formData.finance.incomes["دخل أفراد الأسرة"] === nextFamilyIncome &&
        current.formData.finance.expenses.إيجار === nextRentExpense
      ) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          person: {
            ...current.formData.person,
            region: nextRegion,
          },
          finance: {
            ...current.formData.finance,
            incomes: nextIncomes,
            expenses: nextExpenses,
          },
        },
      };
    });
  }, [
    draft.formData.family.members,
    draft.formData.housing.rentAmount,
    draft.formData.housing.residencyType,
    draft.formData.person.center,
    draft.formData.person.monthlyIncome,
    draft.formData.person.village,
  ]);

  useEffect(() => {
    const incomesTotal = Object.values(draft.formData.finance.incomes).reduce(
      (sum, value) => sum + toNumber(value),
      0,
    );
    const expensesTotal = Object.values(draft.formData.finance.expenses).reduce(
      (sum, value) => sum + toNumber(value),
      0,
    );
    const nextNet = String(incomesTotal - expensesTotal);

    setDraft((current) => {
      if (current.formData.finance.netMonthlyIncome === nextNet) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          finance: {
            ...current.formData.finance,
            netMonthlyIncome: nextNet,
          },
        },
      };
    });
  }, [draft.formData.finance.expenses, draft.formData.finance.incomes]);

  const centerOptions = useMemo(() => {
    const explicitCenters = locations
      .filter((location) => location.type === "مركز")
      .map((location) => location.name)
      .filter(Boolean);

    const fallbackCenters =
      explicitCenters.length > 0
        ? []
        : locations
            .filter((location) => location.type === "قرية" && location.region)
            .map((location) => location.region)
            .filter(Boolean);

    return Array.from(new Set([...explicitCenters, ...fallbackCenters])).sort(
      (left, right) => left.localeCompare(right, "ar"),
    );
  }, [locations]);

  const villageOptions = useMemo(() => {
    return locations
      .filter(
        (location) =>
          location.type === "قرية" &&
          (!draft.formData.person.center ||
            location.region === draft.formData.person.center),
      )
      .map((location) => location.name)
      .sort((left, right) => left.localeCompare(right, "ar"));
  }, [draft.formData.person.center, locations]);

  const associationOptions = useMemo(() => {
    const matchedAssociations = locations
      .filter((location) =>
        matchesAssociationLocation(
          location,
          draft.formData.person.center,
          draft.formData.person.village,
        ),
      )
      .map((location) => location.name);

    const currentAssociation = draft.formData.person.association.trim();
    const values = currentAssociation
      ? [...matchedAssociations, currentAssociation]
      : matchedAssociations;

    return Array.from(new Set(values)).sort((left, right) =>
      left.localeCompare(right, "ar"),
    );
  }, [
    draft.formData.person.association,
    draft.formData.person.center,
    draft.formData.person.village,
    locations,
  ]);

  // الأقسام التي تظهر تبعًا لأنواع الدعم/التدخل المختارة (إظهار المرتبط فقط)
  const visibleSupportCategories = useMemo(() => {
    const set = new Set<string>();
    draft.caseTypes.forEach((type) => {
      (CASE_TYPE_TO_SUPPORT_CATEGORIES[type] ?? []).forEach((category) =>
        set.add(category),
      );
    });
    return set;
  }, [draft.caseTypes]);

  const selectedSupportByCategory = SUPPORT_CATALOG.filter((category) =>
    visibleSupportCategories.has(category.category),
  ).map((category) => ({
    ...category,
    items: draft.formData.support.items.filter(
      (item) => item.category === category.category,
    ),
  }));

  // إظهار قسم دعم ذوي الإعاقة فقط عند تصنيف الحالة كذوي إعاقة
  const showDisabilitySupport =
    draft.formData.classification.tags.includes("ذوي إعاقة");

  const previousCases =
    caseRecord?.family?.cases?.filter((item) => item.id !== caseRecord.id) ?? [];

  const membersIncomeTotal = draft.formData.family.members.reduce(
    (sum, member) => sum + toNumber(member.monthlyIncome),
    0,
  );
  const studentsCount = draft.formData.family.members.filter((member) =>
    isStudent(member.education),
  ).length;

  const toggleSection = (sectionId: string) => {
    setSectionsOpen((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const updatePerson = <K extends keyof CaseIntakeFormData["person"]>(
    key: K,
    value: CaseIntakeFormData["person"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        person: {
          ...current.formData.person,
          [key]: value,
        },
      },
    }));
  };

  const updateFamily = <K extends keyof CaseIntakeFormData["family"]>(
    key: K,
    value: CaseIntakeFormData["family"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        family: {
          ...current.formData.family,
          [key]: value,
        },
      },
    }));
  };

  const updateHousing = <K extends keyof CaseIntakeFormData["housing"]>(
    key: K,
    value: CaseIntakeFormData["housing"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        housing: {
          ...current.formData.housing,
          [key]: value,
        },
      },
    }));
  };

  const updatePossessions = <K extends keyof CaseIntakeFormData["possessions"]>(
    key: K,
    value: CaseIntakeFormData["possessions"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        possessions: {
          ...current.formData.possessions,
          [key]: value,
        },
      },
    }));
  };

  const updateFinance = <K extends keyof CaseIntakeFormData["finance"]>(
    key: K,
    value: CaseIntakeFormData["finance"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        finance: {
          ...current.formData.finance,
          [key]: value,
        },
      },
    }));
  };

  const updateSupport = <K extends keyof CaseIntakeFormData["support"]>(
    key: K,
    value: CaseIntakeFormData["support"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        support: {
          ...current.formData.support,
          [key]: value,
        },
      },
    }));
  };

  const updateClassification = <
    K extends keyof CaseIntakeFormData["classification"],
  >(
    key: K,
    value: CaseIntakeFormData["classification"][K],
  ) => {
    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        classification: {
          ...current.formData.classification,
          [key]: value,
        },
      },
    }));
  };

  // اختيار أسرة = تحميل بياناتها فورًا (الأسرة هي المصدر الوحيد لرب الأسرة وأفرادها)
  const applyFamily = (familyId: string) => {
    // "بدون أسرة" — نمسح الربط فقط دون مسح البيانات المُدخلة
    if (!familyId) {
      updateFamily("linkedFamilyId", "");
      return;
    }

    const family = families.find((item) => item.id === familyId);
    if (!family) {
      updateFamily("linkedFamilyId", familyId);
      return;
    }

    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        person: {
          ...current.formData.person,
          fullName: family.headName || current.formData.person.fullName,
          nationalId: family.nationalId || current.formData.person.nationalId,
          mobile: family.phone || current.formData.person.mobile,
          job: family.job || current.formData.person.job,
          monthlyIncome: family.income || current.formData.person.monthlyIncome,
          educationState: normalizeEducationState(
            family.education || current.formData.person.educationState,
          ),
          center: family.city || current.formData.person.center,
          village: family.village || current.formData.person.village,
          detailedAddress:
            family.addressDetails ||
            family.address ||
            current.formData.person.detailedAddress,
        },
        family: {
          ...current.formData.family,
          linkedFamilyId: familyId,
          members: buildFamilyMembersFromRecord(family),
        },
      },
    }));
  };

  const updateFamilyMember = (
    memberId: string,
    key: keyof CaseIntakeFamilyMember,
    value: string,
  ) => {
    updateFamily(
      "members",
      draft.formData.family.members.map((member) => {
        if (member.id !== memberId) {
          return member;
        }

        const nextMember = { ...member, [key]: value };

        if (key === "education" && value !== "طالب") {
          nextMember.educationType = "";
          nextMember.educationStage = "";
          nextMember.schoolYear = "";
        }

        return nextMember;
      }),
    );
  };

  const addFamilyMember = () => {
    updateFamily("members", [...draft.formData.family.members, createEmptyFamilyMember()]);
  };

  const removeFamilyMember = (memberId: string) => {
    updateFamily(
      "members",
      draft.formData.family.members.filter((member) => member.id !== memberId),
    );
  };

  const updatePossession = (
    itemId: string,
    key: keyof CaseIntakePossessionItem,
    value: string | boolean,
  ) => {
    updatePossessions(
      "items",
      draft.formData.possessions.items.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateSupportItem = (
    itemId: string,
    key: keyof CaseIntakeSupportItem,
    value: string | boolean,
  ) => {
    updateSupport(
      "items",
      draft.formData.support.items.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item,
      ),
    );
  };

  const toggleArrayItem = (
    currentValues: string[],
    targetValue: string,
    onChange: (values: string[]) => void,
  ) => {
    onChange(
      currentValues.includes(targetValue)
        ? currentValues.filter((value) => value !== targetValue)
        : [...currentValues, targetValue],
    );
  };

  const toggleCaseType = (type: string) => {
    setDraft((current) => {
      const nextTypes = current.caseTypes.includes(type)
        ? current.caseTypes.filter((item) => item !== type)
        : [...current.caseTypes, type];
      return {
        ...current,
        caseTypes: nextTypes,
        caseType: joinCaseTypes(nextTypes),
      };
    });
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (!draft.formData.person.fullName.trim()) {
      nextErrors.fullName = "يجب إدخال اسم رب الأسرة.";
    }
    if (!draft.formData.person.center.trim()) {
      nextErrors.center = "يجب اختيار المركز.";
    }
    if (draft.caseTypes.length === 0) {
      nextErrors.caseTypes = "يجب اختيار نوع الدعم أو التدخل.";
    }

    if (nextErrors.fullName || nextErrors.center || nextErrors.caseTypes) {
      setErrors(nextErrors);
      toast("يرجى استكمال الحقول المطلوبة.", "warning");

      // فتح الأقسام المعنية ونقل التركيز لأول حقل خاطئ
      if (nextErrors.fullName || nextErrors.center) {
        setSectionsOpen((current) => ({ ...current, case: true }));
      }
      if (nextErrors.caseTypes) {
        setSectionsOpen((current) => ({ ...current, support: true }));
      }

      window.setTimeout(() => {
        if (nextErrors.fullName) {
          fullNameRef.current?.focus();
        } else if (nextErrors.center) {
          centerRef.current?.focus();
        } else if (nextErrors.caseTypes) {
          caseTypesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 0);

      return;
    }

    setErrors({});

    const payload = buildCasePayload(draft);

    // Offline new-case entry: store locally and let the sync queue submit it
    // automatically once the connection returns (no data loss in the field).
    if (mode === "create" && !isOnline) {
      queueSubmission(draft);
      clearLocalDraft();
      setDraft(buildInitialFormData(undefined, currentUserName));
      toast(
        "لا يوجد اتصال — تم حفظ الحالة محليًا وسيتم إرسالها تلقائيًا عند عودة الإنترنت.",
        "success",
      );
      return;
    }

    try {
      setSaving(true);
      await onSubmit(payload);
      clearLocalDraft();
    } catch (error) {
      // A genuine network failure while nominally "online": queue it instead of losing it.
      if (mode === "create" && isNetworkError(error)) {
        queueSubmission(draft);
        clearLocalDraft();
        setDraft(buildInitialFormData(undefined, currentUserName));
        toast(
          "تعذّر الإرسال الآن — تم حفظ الحالة محليًا وستُرسل تلقائيًا عند عودة الإنترنت.",
          "warning",
        );
      } else {
        throw error;
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteCase = async () => {
    if (!onDelete) {
      return;
    }

    if (!confirm("هل أنت متأكد من حذف الحالة؟")) {
      return;
    }

    try {
      setDeleting(true);
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const openServerPdf = async () => {
    if (!caseRecord) {
      return;
    }

    try {
      setPdfLoading(true);
      const blob = await casesService.getPdf(caseRecord.id);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      console.error(error);
      toast("تعذر إنشاء ملف PDF للحالة.", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <form onSubmit={submitForm} className="space-y-6">
      {/* Offline / Sync Status Bar */}
      <SyncStatusBar
        syncStatus={syncStatus}
        isOnline={isOnline}
        lastSavedAt={lastSavedAt}
        pendingCount={pendingCount}
      />

      <div className="rounded-[28px] border border-outline-variant/30 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">
              {mode === "edit" ? "تعديل بيانات الحالة" : "تسجيل حالة جديدة"}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              نموذج خفيف وعملي: رب الأسرة، أفراد الأسرة، السكن، الحيازة،
              المالية، ثم الدعم والاعتماد.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
            <div className="rounded-2xl bg-surface-container-lowest px-4 py-3">
              <span className="block text-xs">كود الحالة</span>
              <strong className="mt-1 block text-on-surface">
                {caseRecord?.id?.slice(0, 8).toUpperCase() ?? "سيُنشأ تلقائيًا"}
              </strong>
            </div>
            <div className="rounded-2xl bg-surface-container-lowest px-4 py-3">
              <span className="block text-xs">الباحث</span>
              <strong className="mt-1 block text-on-surface">
                {draft.formData.support.specialistName || currentUserName}
              </strong>
            </div>
            <div className="rounded-2xl bg-surface-container-lowest px-4 py-3">
              <span className="block text-xs">تاريخ الإضافة</span>
              <strong className="mt-1 block text-on-surface">
                {caseRecord?.createdAt
                  ? new Date(caseRecord.createdAt).toLocaleString("ar-EG")
                  : "عند الحفظ"}
              </strong>
            </div>
            <div className="rounded-2xl bg-surface-container-lowest px-4 py-3">
              <span className="block text-xs">آخر تحديث</span>
              <strong className="mt-1 block text-on-surface">
                {caseRecord?.updatedAt
                  ? new Date(caseRecord.updatedAt).toLocaleString("ar-EG")
                  : "لم يتم بعد"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <SectionCard
        id="case"
        title="بيانات رب الأسرة"
        subtitle="يتم استنتاج السن والنوع تلقائيًا من الرقم القومي."
        open={sectionsOpen.case}
        onToggle={toggleSection}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              كود الحالة
            </span>
            <input
              disabled
              value={caseRecord?.id?.slice(0, 8).toUpperCase() ?? "تلقائي"}
              className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3 px-4 text-sm text-on-surface-variant"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الاسم كامل
              <span className="text-error" aria-hidden="true">
                {" *"}
              </span>
            </span>
            <input
              ref={fullNameRef}
              required
              aria-required="true"
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? "error-fullName" : undefined}
              value={draft.formData.person.fullName}
              onChange={(event) => {
                updatePerson("fullName", event.target.value);
                clearError("fullName");
              }}
              placeholder="اسم رب الأسرة"
              className={`w-full rounded-2xl border bg-white py-3 px-4 text-sm outline-none focus:border-primary ${
                errors.fullName ? "border-error" : "border-outline-variant/50"
              }`}
            />
            {errors.fullName ? (
              <span
                id="error-fullName"
                role="alert"
                className="mt-2 block text-xs font-medium text-error"
              >
                {errors.fullName}
              </span>
            ) : null}
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الرقم القومي
            </span>
            <input
              value={draft.formData.person.nationalId}
              onChange={(event) =>
                updatePerson("nationalId", event.target.value.replace(/\D/g, ""))
              }
              placeholder="14 رقم"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الديانة
            </span>
            <select
              value={draft.formData.person.religion}
              onChange={(event) => updatePerson("religion", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              {RELIGIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              السن
            </span>
            <input
              disabled
              value={draft.formData.person.age}
              className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low py-3 px-4 text-sm text-on-surface"
            />
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              النوع
            </span>
            <input
              disabled
              value={draft.formData.person.gender}
              className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low py-3 px-4 text-sm text-on-surface"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              رقم المحمول
            </span>
            <input
              value={draft.formData.person.mobile}
              onChange={(event) => updatePerson("mobile", event.target.value)}
              placeholder="رقم المحمول"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الوظيفة
            </span>
            <input
              value={draft.formData.person.job}
              onChange={(event) => updatePerson("job", event.target.value)}
              placeholder="الوظيفة"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الدخل الشهري
            </span>
            <input
              type="number"
              value={draft.formData.person.monthlyIncome}
              onChange={(event) => updatePerson("monthlyIncome", event.target.value)}
              placeholder="الدخل الشهري"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              المؤهل
            </span>
            <select
              value={draft.formData.person.educationState}
              onChange={(event) => updatePerson("educationState", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">اختر المؤهل</option>
              {EDUCATION_STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {isStudent(draft.formData.person.educationState) ? (
            <>
              <label className="xl:col-span-1">
                <span className="mb-2 block text-sm font-bold text-on-surface">
                  نوع التعليم
                </span>
                <select
                  value={draft.formData.person.educationType}
                  onChange={(event) => updatePerson("educationType", event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="">اختر النوع</option>
                  {EDUCATION_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="xl:col-span-1">
                <span className="mb-2 block text-sm font-bold text-on-surface">
                  المرحلة
                </span>
                <select
                  value={draft.formData.person.educationStage}
                  onChange={(event) => updatePerson("educationStage", event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="">اختر المرحلة</option>
                  {EDUCATION_STAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="xl:col-span-1">
                <span className="mb-2 block text-sm font-bold text-on-surface">
                  الصف
                </span>
                <select
                  value={draft.formData.person.schoolYear}
                  onChange={(event) => updatePerson("schoolYear", event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="">اختر الصف</option>
                  {SCHOOL_YEARS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              المركز
              <span className="text-error" aria-hidden="true">
                {" *"}
              </span>
            </span>
            <select
              ref={centerRef}
              aria-required="true"
              aria-invalid={errors.center ? true : undefined}
              aria-describedby={errors.center ? "error-center" : undefined}
              value={draft.formData.person.center}
              onChange={(event) => {
                updatePerson("center", event.target.value);
                clearError("center");
                updatePerson("association", "");
                if (
                  draft.formData.person.village &&
                  !locations.some(
                    (location) =>
                      location.type === "قرية" &&
                      location.region === event.target.value &&
                      location.name === draft.formData.person.village,
                  )
                ) {
                  updatePerson("village", "");
                }
              }}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">اختر المركز</option>
              {centerOptions.map((center) => (
                <option key={center} value={center}>
                  {center}
                </option>
              ))}
            </select>
            {errors.center ? (
              <span
                id="error-center"
                role="alert"
                className="mt-2 block text-xs font-medium text-error"
              >
                {errors.center}
              </span>
            ) : null}
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              القرية
            </span>
            <select
              disabled={!draft.formData.person.center}
              value={draft.formData.person.village}
              onChange={(event) => {
                updatePerson("village", event.target.value);
                updatePerson("association", "");
              }}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-container-low"
            >
              <option value="">اختر القرية</option>
              {villageOptions.map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
            {!draft.formData.person.center ? (
              <span className="mt-2 block text-xs font-medium text-on-surface-variant">
                اختر المركز أولًا لتظهر القرى التابعة له.
              </span>
            ) : null}
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الجمعية
            </span>
            <select
              disabled={!draft.formData.person.village}
              value={draft.formData.person.association}
              onChange={(event) => updatePerson("association", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-container-low"
            >
              <option value="">اختر الجمعية</option>
              {associationOptions.map((association) => (
                <option key={association} value={association}>
                  {association}
                </option>
              ))}
            </select>
            {!draft.formData.person.village ? (
              <span className="mt-2 block text-xs font-medium text-on-surface-variant">
                اختر القرية أولًا لتظهر الجمعيات التابعة لها.
              </span>
            ) : associationOptions.length === 0 ? (
              <span className="mt-2 block text-xs font-medium text-on-surface-variant">
                لا توجد جمعيات مضافة لهذه القرية حتى الآن.
              </span>
            ) : null}
          </label>

          <label className="xl:col-span-6">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              العنوان التفصيلي
            </span>
            <textarea
              rows={3}
              value={draft.formData.person.detailedAddress}
              onChange={(event) => updatePerson("detailedAddress", event.target.value)}
              placeholder="العنوان التفصيلي"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="xl:col-span-6">
            <span className="mb-3 block text-sm font-bold text-on-surface">
              الملفات / الوثائق المرفقة
            </span>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {ATTACHMENT_OPTIONS.map((attachment) => (
                <label
                  key={attachment}
                  className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface"
                >
                  <input
                    type="checkbox"
                    checked={draft.formData.person.attachments.includes(attachment)}
                    onChange={() =>
                      toggleArrayItem(
                        draft.formData.person.attachments,
                        attachment,
                        (values) => updatePerson("attachments", values),
                      )
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  {attachment}
                </label>
              ))}
            </div>
          </div>

          <label className="xl:col-span-2 flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.person.tamweenSupport}
              onChange={(event) => updatePerson("tamweenSupport", event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            مستفيد من التموين
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              عدد المستفيدين
            </span>
            <input
              value={draft.formData.person.tamweenBeneficiaries}
              onChange={(event) => updatePerson("tamweenBeneficiaries", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-3 flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.person.expensesExempted}
              onChange={(event) => updatePerson("expensesExempted", event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            الإعفاء من المصروفات
          </label>
        </div>
      </SectionCard>

      <SectionCard
        id="family"
        title="بيانات أفراد الأسرة"
        subtitle="كل فرد يظهر في كارت مستقل مشابه لبيانات رب الأسرة."
        open={sectionsOpen.family}
        onToggle={toggleSection}
        footer={
          <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.family.dataComplete}
              onChange={(event) => updateFamily("dataComplete", event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            تم استكمال بيانات أفراد الأسرة
          </label>
        }
      >
        <div className="grid gap-5 md:grid-cols-4">
          <label className="md:col-span-3">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              ربط بأسرة مسجلة
            </span>
            <select
              value={draft.formData.family.linkedFamilyId}
              onChange={(event) => applyFamily(event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">بدون ربط — أسرة جديدة من بيانات رب الأسرة</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.headName} {family.nationalId ? `- ${family.nationalId}` : ""}
                </option>
              ))}
            </select>
            <span className="mt-2 block text-xs font-medium text-on-surface-variant">
              عند الاختيار تُحمَّل بيانات الأسرة وأفرادها تلقائيًا. لو تركته بدون
              ربط، يُنشئ النظام أسرة من الرقم القومي لرب الأسرة (أو يربط بالأسرة
              القائمة بنفس الرقم) تلقائيًا عند الحفظ.
            </span>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => applyFamily(draft.formData.family.linkedFamilyId)}
              disabled={!draft.formData.family.linkedFamilyId}
              className="w-full rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              إعادة تحميل بيانات الأسرة
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {draft.formData.family.members.length === 0 ? (
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
              لا يوجد أفراد مضافون حتى الآن.
            </div>
          ) : (
            draft.formData.family.members.map((member, index) => (
              <div
                key={member.id}
                className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/60 p-5"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">
                      فرد الأسرة رقم {index + 1}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      بيانات شخصية، تعليم، ودخل الفرد.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(member.id)}
                    className="rounded-2xl bg-error/10 px-4 py-2 text-sm font-bold text-error"
                  >
                    حذف
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                  <label className="xl:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      الاسم
                    </span>
                    <input
                      value={member.name}
                      onChange={(event) =>
                        updateFamilyMember(member.id, "name", event.target.value)
                      }
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="xl:col-span-1">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      درجة القرابة
                    </span>
                    <select
                      value={member.relation}
                      onChange={(event) =>
                        updateFamilyMember(member.id, "relation", event.target.value)
                      }
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    >
                      {RELATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="xl:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      الرقم القومي
                    </span>
                    <input
                      value={member.nationalId ?? ""}
                      onChange={(event) =>
                        updateFamilyMember(
                          member.id,
                          "nationalId",
                          event.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="14 رقم"
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="xl:col-span-1">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      السن
                    </span>
                    <input
                      disabled
                      value={member.age ?? ""}
                      className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3 px-4 text-sm text-on-surface"
                    />
                  </label>
                  <label className="xl:col-span-1">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      النوع
                    </span>
                    <input
                      disabled
                      value={member.gender ?? ""}
                      className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3 px-4 text-sm text-on-surface"
                    />
                  </label>
                  <label className="xl:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      المحمول
                    </span>
                    <input
                      value={member.mobile ?? ""}
                      onChange={(event) =>
                        updateFamilyMember(member.id, "mobile", event.target.value)
                      }
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="xl:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      الوظيفة
                    </span>
                    <input
                      value={member.job ?? ""}
                      onChange={(event) =>
                        updateFamilyMember(member.id, "job", event.target.value)
                      }
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="xl:col-span-1">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      الدخل الشهري
                    </span>
                    <input
                      type="number"
                      value={member.monthlyIncome ?? "0"}
                      onChange={(event) =>
                        updateFamilyMember(
                          member.id,
                          "monthlyIncome",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="xl:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-on-surface">
                      المؤهل
                    </span>
                    <select
                      value={member.education ?? ""}
                      onChange={(event) =>
                        updateFamilyMember(member.id, "education", event.target.value)
                      }
                      className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    >
                      <option value="">اختر المؤهل</option>
                      {EDUCATION_STATES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  {isStudent(member.education) ? (
                    <>
                      <label className="xl:col-span-1">
                        <span className="mb-2 block text-sm font-bold text-on-surface">
                          نوع التعليم
                        </span>
                        <select
                          value={member.educationType ?? ""}
                          onChange={(event) =>
                            updateFamilyMember(
                              member.id,
                              "educationType",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                        >
                          <option value="">اختر النوع</option>
                          {EDUCATION_TYPES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="xl:col-span-1">
                        <span className="mb-2 block text-sm font-bold text-on-surface">
                          المرحلة
                        </span>
                        <select
                          value={member.educationStage ?? ""}
                          onChange={(event) =>
                            updateFamilyMember(
                              member.id,
                              "educationStage",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                        >
                          <option value="">اختر المرحلة</option>
                          {EDUCATION_STAGES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="xl:col-span-1">
                        <span className="mb-2 block text-sm font-bold text-on-surface">
                          الصف
                        </span>
                        <select
                          value={member.schoolYear ?? ""}
                          onChange={(event) =>
                            updateFamilyMember(
                              member.id,
                              "schoolYear",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                        >
                          <option value="">اختر الصف</option>
                          {SCHOOL_YEARS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={addFamilyMember}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/15"
          >
            أضف فردًا آخر
          </button>
          <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
            <span className="rounded-2xl bg-surface-container-low px-4 py-2">
              عدد الأفراد: {draft.formData.family.members.length}
            </span>
            <span className="rounded-2xl bg-surface-container-low px-4 py-2">
              عدد الطلاب: {studentsCount}
            </span>
            <span className="rounded-2xl bg-surface-container-low px-4 py-2">
              دخل الأفراد: {membersIncomeTotal}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="housing"
        title="السكن والعنوان"
        subtitle="العناصر مرتبة رأسيًا مع إظهار قيمة الإيجار فقط عند الحاجة."
        open={sectionsOpen.housing}
        onToggle={toggleSection}
        footer={
          <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.housing.dataComplete}
              onChange={(event) => updateHousing("dataComplete", event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            تم استكمال بيانات السكن
          </label>
        }
      >
        <div className="space-y-6">
          <div>
            <span className="mb-3 block text-sm font-bold text-on-surface">
              طبيعة السكن
            </span>
            <div className="grid gap-3 md:grid-cols-3">
              {RESIDENCY_TYPES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateHousing("residencyType", item)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                    draft.formData.housing.residencyType === item
                      ? "border-primary bg-primary text-white"
                      : "border-outline-variant/40 bg-white text-on-surface"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {draft.formData.housing.residencyType === "إيجار" ? (
            <label className="block max-w-md">
              <span className="mb-2 block text-sm font-bold text-on-surface">
                قيمة الإيجار الشهرية
              </span>
              <input
                type="number"
                value={draft.formData.housing.rentAmount}
                onChange={(event) => updateHousing("rentAmount", event.target.value)}
                className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
              />
            </label>
          ) : null}

          {[
            [
              "السقف",
              draft.formData.housing.roof,
              ROOF_OPTIONS,
              (values: string[]) => updateHousing("roof", values),
            ],
            [
              "الأرضية",
              draft.formData.housing.floor,
              FLOOR_OPTIONS,
              (values: string[]) => updateHousing("floor", values),
            ],
            [
              "المدخل",
              draft.formData.housing.entrance,
              ENTRANCE_OPTIONS,
              (values: string[]) => updateHousing("entrance", values),
            ],
            [
              "الحوائط",
              draft.formData.housing.walls,
              WALL_OPTIONS,
              (values: string[]) => updateHousing("walls", values),
            ],
            [
              "وسيلة المواصلات",
              draft.formData.housing.transport,
              TRANSPORT_OPTIONS,
              (values: string[]) => updateHousing("transport", values),
            ],
          ].map(([label, values, options, onChange]) => (
            <div key={label as string}>
              <span className="mb-3 block text-sm font-bold text-on-surface">
                {label as string}
              </span>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {(options as string[]).map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface"
                  >
                    <input
                      type="checkbox"
                      checked={(values as string[]).includes(option)}
                      onChange={() =>
                        toggleArrayItem(
                          values as string[],
                          option,
                          onChange as (nextValues: string[]) => void,
                        )
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {(Object.entries(HOUSE_RADIO_OPTIONS) as Array<
            [keyof typeof HOUSE_RADIO_OPTIONS, string[]]
          >).map(([key, options]) => (
            <div key={key}>
              <span className="mb-3 block text-sm font-bold text-on-surface">
                {{
                  bathroomType: "طبيعة دورات المياه",
                  bathroomState: "حالة دورات المياه",
                  electricity: "الكهرباء",
                  water: "المياه",
                  waterPump: "طرمبة المياه",
                  cookware: "أجهزة الطبخ",
                  tv: "التلفاز",
                  fridge: "الثلاجة",
                  washingMachine: "الغسالة",
                  oven: "فرن خبيز",
                  computer: "كومبيوتر",
                  internet: "إنترنت",
                }[key]}
              </span>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      updateHousing(
                        key as keyof CaseIntakeFormData["housing"],
                        option as never,
                      )
                    }
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                      draft.formData.housing[
                        key as keyof CaseIntakeFormData["housing"]
                      ] === option
                        ? "border-primary bg-primary text-white"
                        : "border-outline-variant/40 bg-white text-on-surface"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-4 rounded-3xl border border-outline-variant/20 p-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface">الغرف</h3>
              <p className="text-sm text-on-surface-variant">
                أدخل عدد الغرف فقط.
              </p>
            </div>

            <label className="block max-w-xs">
              <span className="mb-2 block text-sm font-bold text-on-surface">
                عدد الغرف
              </span>
              <input
                type="number"
                min={0}
                value={draft.formData.housing.roomsCount}
                onChange={(event) =>
                  updateHousing("roomsCount", event.target.value)
                }
                placeholder="عدد الغرف"
                className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <p className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface-variant">
              يرجى وصف الغرف مع ملخص الحالة.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="possessions"
        title="الحيازة"
        subtitle="الحيازة تشمل ماشية وأراضي زراعية وأراضي ملك وأخرى مع ملاحظة."
        open={sectionsOpen.possessions}
        onToggle={toggleSection}
        footer={
          <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.possessions.dataComplete}
              onChange={(event) =>
                updatePossessions("dataComplete", event.target.checked)
              }
              className="h-4 w-4 accent-primary"
            />
            تم استكمال بيانات الحيازة
          </label>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {(["لا", "نعم"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updatePossessions("hasPossessions", option)}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                draft.formData.possessions.hasPossessions === option
                  ? "border-primary bg-primary text-white"
                  : "border-outline-variant/40 bg-white text-on-surface"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {draft.formData.possessions.hasPossessions === "نعم" ? (
          <div className="grid gap-4 md:grid-cols-3">
            {draft.formData.possessions.items.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border p-4 ${
                  item.selected
                    ? "border-primary/40 bg-primary/5"
                    : "border-outline-variant/30 bg-white"
                }`}
              >
                <label className="flex items-center gap-3 text-sm font-bold text-on-surface">
                  <input
                    type="checkbox"
                    checked={!!item.selected}
                    onChange={(event) =>
                      updatePossession(item.id, "selected", event.target.checked)
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  {item.name}
                </label>

                {item.selected ? (
                  <textarea
                    rows={4}
                    value={item.notes ?? ""}
                    onChange={(event) =>
                      updatePossession(item.id, "notes", event.target.value)
                    }
                    placeholder="الوصف / الملاحظات"
                    className="mt-4 w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        id="finance"
        title="الدخل والمصروفات"
        subtitle="دخل رب الأسرة والأفراد يُحسب تلقائيًا من الكروت بالأعلى."
        open={sectionsOpen.finance}
        onToggle={toggleSection}
        footer={
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
              <span className="text-sm font-bold text-on-surface">
                صافي الدخل الشهري
              </span>
              <input
                disabled
                value={draft.formData.finance.netMonthlyIncome}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3 px-4 text-sm font-bold text-on-surface"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
              <input
                type="checkbox"
                checked={draft.formData.finance.dataComplete}
                onChange={(event) =>
                  updateFinance("dataComplete", event.target.checked)
                }
                className="h-4 w-4 accent-primary"
              />
              تم استكمال بيانات الدخل والمصروفات
            </label>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-outline-variant/20">
            <div className="bg-success/10 px-5 py-4 text-sm font-bold text-success">
              الدخل
            </div>
            <div className="divide-y divide-outline-variant/10">
              {pairsFromEntries(Object.entries(draft.formData.finance.incomes)).map(
                (row, index) => (
                  <div key={index} className="grid gap-4 p-4 md:grid-cols-2">
                    {row.map(([label, value]) => (
                      <label key={label} className="block">
                        <span className="mb-2 block text-sm font-medium text-on-surface">
                          {label}
                        </span>
                        <input
                          type="number"
                          value={value}
                          disabled={
                            label === "دخل رب الأسرة" || label === "دخل أفراد الأسرة"
                          }
                          onChange={(event) =>
                            updateFinance("incomes", {
                              ...draft.formData.finance.incomes,
                              [label]: event.target.value,
                            })
                          }
                          className={`w-full rounded-2xl border py-3 px-4 text-sm outline-none ${
                            label === "دخل رب الأسرة" || label === "دخل أفراد الأسرة"
                              ? "border-outline-variant/40 bg-surface-container-low text-on-surface"
                              : "border-outline-variant/40 bg-white focus:border-primary"
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-outline-variant/20">
            <div className="bg-error/10 px-5 py-4 text-sm font-bold text-error">
              المصروفات
            </div>
            <div className="divide-y divide-outline-variant/10">
              {pairsFromEntries(Object.entries(draft.formData.finance.expenses)).map(
                (row, index) => (
                  <div key={index} className="grid gap-4 p-4 md:grid-cols-2">
                    {row.map(([label, value]) => (
                      <label key={label} className="block">
                        <span className="mb-2 block text-sm font-medium text-on-surface">
                          {label}
                        </span>
                        <input
                          type="number"
                          value={value}
                          disabled={label === "إيجار" && draft.formData.housing.residencyType === "إيجار"}
                          onChange={(event) =>
                            updateFinance("expenses", {
                              ...draft.formData.finance.expenses,
                              [label]: event.target.value,
                            })
                          }
                          className={`w-full rounded-2xl border py-3 px-4 text-sm outline-none ${
                            label === "إيجار" && draft.formData.housing.residencyType === "إيجار"
                              ? "border-outline-variant/40 bg-surface-container-low text-on-surface"
                              : "border-outline-variant/40 bg-white focus:border-primary"
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="classification"
        title="تصنيف الحالة"
        subtitle="تصنيفات متعددة مع درجة التصنيف النهائية."
        open={sectionsOpen.classification}
        onToggle={toggleSection}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {CLASSIFICATION_OPTIONS.map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface"
            >
              <input
                type="checkbox"
                checked={draft.formData.classification.tags.includes(item)}
                onChange={() =>
                  toggleArrayItem(
                    draft.formData.classification.tags,
                    item,
                    (values) => updateClassification("tags", values),
                  )
                }
                className="h-4 w-4 accent-primary"
              />
              {item}
            </label>
          ))}
        </div>

        <label className="block max-w-md">
          <span className="mb-2 block text-sm font-bold text-on-surface">
            درجة التصنيف
          </span>
          <select
            value={draft.formData.classification.degree}
            onChange={(event) => updateClassification("degree", event.target.value)}
            className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
          >
            {CLASSIFICATION_DEGREES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </SectionCard>

      <SectionCard
        id="support"
        title="الدعم والاعتماد"
        subtitle="أنواع الدعم في نهاية النموذج مع خانة اعتماد لمسؤول إدارة الحالة."
        open={sectionsOpen.support}
        onToggle={toggleSection}
      >
        <div className="grid gap-5">
          <div ref={caseTypesRef}>
            <span className="mb-2 block text-sm font-bold text-on-surface">
              نوع الدعم / التدخل (اختيار متعدد)
              <span className="text-error" aria-hidden="true">
                {" *"}
              </span>
            </span>
            <p className="mb-3 text-xs text-on-surface-variant">
              اختر نوعًا أو أكثر، وستظهر الخانات الخاصة بكل نوع فقط بالأسفل.
            </p>
            {errors.caseTypes ? (
              <span
                id="error-caseTypes"
                role="alert"
                className="mb-3 block text-xs font-medium text-error"
              >
                {errors.caseTypes}
              </span>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {CASE_TYPES.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
                    draft.caseTypes.includes(item)
                      ? "border-primary bg-primary/5 text-on-surface"
                      : "border-outline-variant/40 bg-surface-container-low text-on-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={draft.caseTypes.includes(item)}
                    onChange={() => {
                      toggleCaseType(item);
                      clearError("caseTypes");
                    }}
                    className="h-4 w-4 accent-primary"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الأولوية
            </span>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      priority: option.value,
                    }))
                  }
                  className={`flex-1 rounded-2xl border px-3 py-3 text-sm font-bold transition-colors ${
                    draft.priority === option.value
                      ? "border-primary bg-primary text-white"
                      : "border-outline-variant/50 bg-white text-on-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {draft.caseTypes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
              اختر نوع الدعم / التدخل بالأعلى لتظهر الخانات الخاصة به.
            </div>
          ) : null}
          {selectedSupportByCategory.map((group) => (
            <div
              key={group.category}
              className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/60 p-4"
            >
              <h3 className="mb-4 text-lg font-bold text-on-surface">
                {group.category}
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      item.selected
                        ? "border-primary/40 bg-primary/5"
                        : "border-outline-variant/30 bg-white"
                    }`}
                  >
                    <label className="flex items-center gap-3 text-sm font-bold text-on-surface">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(event) =>
                          updateSupportItem(
                            item.id,
                            "selected",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 accent-primary"
                      />
                      {item.name}
                    </label>
                    {item.selected ? (
                      <div className="mt-4 space-y-3">
                        {item.name === "وصلة مياه" ? (
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-on-surface">
                              المقايسة - نوع الوصلة
                            </span>
                            <select
                              value={item.connectionType ?? ""}
                              onChange={(event) =>
                                updateSupportItem(
                                  item.id,
                                  "connectionType",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                            >
                              <option value="">اختر نوع الوصلة</option>
                              <option value="فردية">فردية</option>
                              <option value="خط رئيسي">خط رئيسي</option>
                            </select>
                          </label>
                        ) : null}
                        {item.name === "قرض" ? (
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-on-surface">
                              هل يوجد حكم قضائي؟
                            </span>
                            <select
                              value={item.courtRuling ?? ""}
                              onChange={(event) =>
                                updateSupportItem(
                                  item.id,
                                  "courtRuling",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                            >
                              <option value="">اختر</option>
                              <option value="نعم">نعم</option>
                              <option value="لا">لا</option>
                            </select>
                          </label>
                        ) : null}
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={item.notes ?? ""}
                            onChange={(event) =>
                              updateSupportItem(item.id, "notes", event.target.value)
                            }
                            placeholder={
                              group.category === "المساعدات المالية" ||
                              group.category === "الدعم المنزلي"
                                ? "الوصف"
                                : "ملاحظات"
                            }
                            className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                          />
                          <input
                            value={item.cost ?? ""}
                            onChange={(event) =>
                              updateSupportItem(item.id, "cost", event.target.value)
                            }
                            placeholder="التكلفة"
                            className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {showDisabilitySupport ? (
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/60 p-4">
            <h3 className="mb-4 text-lg font-bold text-on-surface">
              دعم ذوي الإعاقة
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-on-surface">
                  نوع الدعم
                </span>
                <select
                  value={draft.formData.support.disabilitySupportType}
                  onChange={(event) =>
                    updateSupport("disabilitySupportType", event.target.value)
                  }
                  className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="">اختر نوع الدعم</option>
                  {DISABILITY_SUPPORT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-on-surface">
                  الوصف
                </span>
                <input
                  value={draft.formData.support.disabilitySupportDescription}
                  onChange={(event) =>
                    updateSupport("disabilitySupportDescription", event.target.value)
                  }
                  placeholder="وصف الدعم المطلوب"
                  className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block max-w-sm">
                <span className="mb-2 block text-sm font-medium text-on-surface">
                  التكلفة
                </span>
                <input
                  value={draft.formData.support.disabilitySupportCost}
                  onChange={(event) =>
                    updateSupport("disabilitySupportCost", event.target.value)
                  }
                  placeholder="التكلفة"
                  className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
          </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/60 p-5">
              <h3 className="mb-4 text-lg font-bold text-on-surface">
                ملخص الحالة وملاحظات الباحث
              </h3>
              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-on-surface">
                    الباحث
                  </span>
                  <input
                    disabled
                    value={draft.formData.support.specialistName || currentUserName}
                    className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3 px-4 text-sm text-on-surface"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-on-surface">
                    رأي الباحث
                  </span>
                  <select
                    value={draft.formData.support.specialistOpinion}
                    onChange={(event) =>
                      updateSupport("specialistOpinion", event.target.value)
                    }
                    className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  >
                    {RESEARCHER_OPINIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-on-surface">
                    ملخص الحالة / الاحتياج وملاحظات الباحث
                  </span>
                  <textarea
                    rows={6}
                    value={draft.description}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        description: event.target.value,
                        formData: {
                          ...current.formData,
                          support: {
                            ...current.formData.support,
                            specialistNotes: event.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="اكتب ملخص الحالة والاحتياج وملاحظات الباحث (مثال: وصف الغرف، تفاصيل إضافية...)"
                    className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-on-surface">
                  اعتماد مسؤول إدارة الحالة
                </h3>
                {!hasManagerAccess ? (
                  <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
                    للعرض فقط
                  </span>
                ) : null}
              </div>
              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-on-surface">
                    قرار الاعتماد
                  </span>
                  <select
                    disabled={!hasManagerAccess}
                    value={draft.formData.support.managerDecision}
                    onChange={(event) =>
                      updateSupport(
                        "managerDecision",
                        event.target.value as ManagerDecision,
                      )
                    }
                    className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary disabled:bg-surface-container-low"
                  >
                    {MANAGER_DECISIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-on-surface">
                    تعليقات مسؤول إدارة الحالة
                  </span>
                  <textarea
                    rows={4}
                    disabled={!hasManagerAccess}
                    value={draft.formData.support.managerComments}
                    onChange={(event) =>
                      updateSupport("managerComments", event.target.value)
                    }
                    className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary disabled:bg-surface-container-low"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {mode === "edit" ? (
        <SectionCard
          id="history"
          title="تاريخ طلبات الدعم"
          subtitle="يعرض الحالات السابقة المرتبطة بنفس الأسرة عند وجودها."
          open={sectionsOpen.history}
          onToggle={toggleSection}
        >
          <div className="overflow-x-auto rounded-3xl border border-outline-variant/20">
            <table className="min-w-full divide-y divide-outline-variant/20 text-right text-sm">
              <thead className="bg-surface-container-lowest text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">تاريخ الطلب</th>
                  <th scope="col" className="px-4 py-3 font-bold">نوع الدعم</th>
                  <th scope="col" className="px-4 py-3 font-bold">الحالة</th>
                  <th scope="col" className="px-4 py-3 font-bold">القرار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {previousCases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-5 text-center text-on-surface-variant">
                      لا يوجد طلبات دعم سابقة
                    </td>
                  </tr>
                ) : (
                  previousCases.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-3">{item.caseType}</td>
                      <td className="px-4 py-3">{item.lifecycleStatus}</td>
                      <td className="px-4 py-3">{item.decisionStatus}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}

      <div className="sticky bottom-4 z-20">
        <div className="rounded-[28px] border border-outline-variant/30 bg-white/95 p-4 shadow-2xl shadow-black/5 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "حفظ الكارت"}
              </button>
              {caseRecord ? (
                <Link
                  href={`/dashboard/cases/${caseRecord.id}`}
                  className="rounded-2xl bg-success px-6 py-3 text-sm font-bold text-white shadow-lg shadow-success/15"
                >
                  عرض التفاصيل
                </Link>
              ) : null}
              {caseRecord && hasManagerAccess ? (
                <button
                  type="button"
                  onClick={openServerPdf}
                  disabled={pdfLoading}
                  className="rounded-2xl bg-tertiary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-tertiary/15"
                >
                  {pdfLoading ? "جاري إنشاء PDF..." : "PDF من السيرفر"}
                </button>
              ) : null}
              {mode === "edit" && onDelete ? (
                <button
                  type="button"
                  onClick={deleteCase}
                  disabled={deleting}
                  className="rounded-2xl bg-error/10 px-6 py-3 text-sm font-bold text-error"
                >
                  {deleting ? "جاري الحذف..." : "حذف الحالة"}
                </button>
              ) : null}
            </div>
            <div className="text-sm text-on-surface-variant">
              {buildRegionString(
                draft.formData.person.center,
                draft.formData.person.village,
              ) || "حدد المركز والقرية"}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
