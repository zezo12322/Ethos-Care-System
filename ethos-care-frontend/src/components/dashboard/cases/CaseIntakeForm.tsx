"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { familiesService } from "@/services/families.service";
import { locationsService } from "@/services/locations.service";
import { partnersService } from "@/services/partners.service";
import { CreateCaseDto } from "@/services/cases.service";
import {
  CaseIntakeFamilyMember,
  CaseIntakeFormData,
  CaseIntakeHousingRoom,
  CaseIntakePossessionItem,
  CaseIntakeSupportItem,
  CaseRecord,
  FamilyRecord,
  LocationRecord,
  PartnerRecord,
} from "@/types/api";

type CasePriority = "NORMAL" | "HIGH" | "URGENT";

interface CaseFormDraft {
  caseType: string;
  priority: CasePriority;
  description: string;
  formData: CaseIntakeFormData;
}

interface CaseIntakeFormProps {
  mode: "create" | "edit";
  caseRecord?: CaseRecord | null;
  currentUserName: string;
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
  "سكن كريم",
  "تدخل طبي",
  "تعليم",
  "تمكين اقتصادي",
  "مواد غذائية",
  "مرافق وخدمات",
  "أجهزة تعويضية",
] as const;

const RELIGIONS = ["مسلم", "مسيحي"] as const;
const PRIORITY_OPTIONS: Array<{ label: string; value: CasePriority }> = [
  { label: "عادي", value: "NORMAL" },
  { label: "عالي", value: "HIGH" },
  { label: "عاجل", value: "URGENT" },
];

const EDUCATION_STATES = [
  "غير محدد",
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
];

const EDUCATION_TYPES = ["حكومي", "أزهري", "خاص", "فصل واحد", "فني"];
const EDUCATION_STAGES = [
  "المرحلة التمهيدية",
  "المرحلة الابتدائية",
  "المرحلة الاعدادية",
  "المرحلة الثانوية",
  "المرحلة الجامعية",
  "ثانوي فني 3 سنوات",
  "ثانوي فني 5 سنوات",
];
const SCHOOL_YEARS = [
  "الأول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
];

const ATTACHMENT_OPTIONS = [
  "بطاقة الرقم القومي",
  "شهادة الميلاد",
  "تقرير طبي",
  "برنت تأميني",
  "إثبات قيد مدرسي",
];

const RESIDENCY_TYPES = ["خاص", "إيجار", "منزل عائلة"];
const ROOF_OPTIONS = ["بدون", "مسلح", "خشب", "سعف", "جريد"];
const FLOOR_OPTIONS = ["تراب", "أسمنت", "بلاط", "سيراميك"];
const ENTRANCE_OPTIONS = ["تراب", "أسمنت", "بلاط", "سيراميك", "رخام"];
const WALL_OPTIONS = ["طوب أحمر", "بلوك", "محارة", "دهان", "طوب لبن"];
const TRANSPORT_OPTIONS = ["سيارة", "موتوسيكل", "توك توك", "أخرى"];

const HOUSE_RADIO_OPTIONS: Record<string, string[]> = {
  bathroomType: ["خاص", "مشترك"],
  bathroomState: ["آدمي", "غير آدمي"],
  electricity: ["لا يوجد", "ممارسة", "عداد"],
  water: ["لا يوجد", "طلمبة", "عداد"],
  waterPump: ["لا يوجد", "يوجد"],
  cookware: ["لا يوجد", "غاز", "بوتاجاز"],
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
  أخرى: "0",
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
  "إيجار الأرض الزراعية": "0",
  أخرى: "0",
};

const CLASSIFICATION_OPTIONS = [
  "بدون/لا يوجد",
  "مطلق/مطلقة/هجر",
  "أيتام",
  "أرامل",
  "مسنين",
  "منعدم الدخل",
  "الدخل لا يكفي",
  "تكافل وكرامة",
  "مسجون/غارمين",
  "أمراض",
];

const CLASSIFICATION_DEGREES = [
  "حالة متوسطة",
  "حالة فوق متوسطة",
  "حالة قصوى",
];

const SUPPORT_CATALOG: Array<{ category: string; items: string[] }> = [
  {
    category: "سلع غذائية",
    items: ["سلة غذائية", "لحوم", "وجبات إطعام", "مساعدة مالية"],
  },
  {
    category: "دعم صحي",
    items: ["علاج", "عملية جراحية", "أدوية", "أجهزة تعويضية", "نظارات"],
  },
  {
    category: "مرافق",
    items: ["توصيل مياه", "توصيل كهرباء", "سداد مديونية"],
  },
  {
    category: "تعليم ومدارس",
    items: ["مصروفات دراسية", "شنط وأدوات", "زي مدرسي", "دروس تقوية"],
  },
  {
    category: "دعم منزلي",
    items: ["أثاث", "أجهزة منزلية", "ترميم منزل"],
  },
  {
    category: "منحة تعليمية",
    items: ["منحة دراسية", "دعم جامعي"],
  },
  {
    category: "سماعات أذن",
    items: ["سماعة أذن يمنى", "سماعة أذن يسرى", "سماعات للأذنين"],
  },
  {
    category: "دعم موسمي",
    items: ["كسوة موسمية", "كسوة استثنائية", "معارض كساء"],
  },
];

const SPECIALIST_OPINIONS = [
  "لم يتم البت",
  "يتم النظر لاحقًا",
  "مقبول",
  "مرفوض",
  "مرفوض نهائيًا",
];

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

function buildFamilyMembersFromRecord(family?: FamilyRecord | null): CaseIntakeFamilyMember[] {
  if (!family) {
    return [];
  }

  if (family.familyMembers?.length) {
    return family.familyMembers.map((member) => ({
      id: member.id,
      name: member.name,
      relation: member.relation,
      age: member.age ?? "",
      education: member.education ?? "",
      mobile: "",
      job: "",
      classification: "",
    }));
  }

  return family.headName
    ? [
        {
          id: createLocalId("member"),
          name: family.headName,
          relation: "رب الأسرة",
          age: "",
          education: family.education ?? "",
          mobile: family.phone ?? "",
          job: family.job ?? "",
          classification: "",
        },
      ]
    : [];
}

function mergeSupportItems(
  existingItems?: CaseIntakeSupportItem[],
): CaseIntakeSupportItem[] {
  const baseItems = flattenSupportItems();

  if (!existingItems?.length) {
    return baseItems;
  }

  return baseItems.map((item) => {
    const found = existingItems.find((candidate) => candidate.id === item.id);
    return found ? { ...item, ...found } : item;
  });
}

function buildInitialFormData(
  caseRecord: CaseRecord | null | undefined,
  currentUserName: string,
): CaseFormDraft {
  const existing = caseRecord?.formData;

  return {
    caseType: caseRecord?.caseType ?? "مساعدة مالية",
    priority:
      (caseRecord?.priority as CasePriority | undefined) ??
      "NORMAL",
    description: caseRecord?.description ?? "",
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
        mobile:
          existing?.person.mobile ??
          caseRecord?.family?.phone ??
          "",
        job:
          existing?.person.job ??
          caseRecord?.family?.job ??
          "",
        monthlyIncome:
          existing?.person.monthlyIncome ??
          caseRecord?.family?.income ??
          "",
        educationState:
          existing?.person.educationState ??
          caseRecord?.family?.education ??
          "غير محدد",
        educationType: existing?.person.educationType ?? "حكومي",
        educationStage: existing?.person.educationStage ?? "المرحلة الابتدائية",
        schoolYear: existing?.person.schoolYear ?? "الأول",
        educationNotes: existing?.person.educationNotes ?? "",
        expensesExempted: existing?.person.expensesExempted ?? false,
        region:
          existing?.person.region ??
          caseRecord?.location ??
          [
            caseRecord?.family?.city ?? "",
            caseRecord?.family?.village ?? "",
          ]
            .filter(Boolean)
            .join(" > "),
        association: existing?.person.association ?? "",
        detailedAddress:
          existing?.person.detailedAddress ??
          caseRecord?.family?.addressDetails ??
          caseRecord?.family?.address ??
          "",
        attachments: existing?.person.attachments ?? [],
        tamweenSupport: existing?.person.tamweenSupport ?? false,
        tamweenBeneficiaries:
          existing?.person.tamweenBeneficiaries ?? "1",
      },
      family: {
        linkedFamilyId:
          existing?.family.linkedFamilyId ??
          caseRecord?.familyId ??
          "",
        members:
          existing?.family.members?.length
            ? existing.family.members
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
        transport: existing?.housing.transport ?? [],
        rooms: existing?.housing.rooms ?? [],
        dataComplete: existing?.housing.dataComplete ?? false,
      },
      possessions: {
        hasPossessions: existing?.possessions.hasPossessions ?? "لا",
        items: existing?.possessions.items ?? [],
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
        tags: existing?.classification.tags ?? [],
        degree: existing?.classification.degree ?? "حالة متوسطة",
      },
      support: {
        items: mergeSupportItems(existing?.support.items),
        specialistName:
          existing?.support.specialistName ??
          currentUserName,
        specialistNotes: existing?.support.specialistNotes ?? "",
        specialistOpinion:
          existing?.support.specialistOpinion ?? "لم يتم البت",
      },
    },
  };
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
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return {
    birthDate: birthDate.toISOString().split("T")[0],
    age: String(Math.max(age, 0)),
    gender: Number(trimmed[12]) % 2 === 0 ? "أنثى" : "ذكر",
  };
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
            <div className="mt-1 text-sm text-on-surface-variant">
              {subtitle}
            </div>
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
  onSubmit,
  onDelete,
}: CaseIntakeFormProps) {
  const [draft, setDraft] = useState<CaseFormDraft>(() =>
    buildInitialFormData(caseRecord, currentUserName),
  );
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTION_IDS.map((id) => [id, true])),
  );
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDraft(buildInitialFormData(caseRecord, currentUserName));
  }, [caseRecord, currentUserName]);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      try {
        const [familyRows, locationRows, partnerRows] = await Promise.all([
          familiesService.getAll(),
          locationsService.getAll(),
          partnersService.getAll(),
        ]);

        if (!cancelled) {
          setFamilies(familyRows);
          setLocations(locationRows);
          setPartners(partnerRows);
        }
      } catch (error) {
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
    if (!derived) {
      return;
    }

    setDraft((current) => {
      const person = current.formData.person;
      if (
        person.birthDate === derived.birthDate &&
        person.age === derived.age &&
        person.gender === derived.gender
      ) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          person: {
            ...person,
            birthDate: derived.birthDate,
            age: derived.age,
            gender: derived.gender,
          },
        },
      };
    });
  }, [draft.formData.person.nationalId]);

  useEffect(() => {
    const incomesTotal = Object.values(draft.formData.finance.incomes).reduce(
      (sum, value) => sum + toNumber(value),
      0,
    );
    const expensesTotal = Object.values(draft.formData.finance.expenses).reduce(
      (sum, value) => sum + toNumber(value),
      0,
    );
    const net = String(incomesTotal - expensesTotal);

    setDraft((current) => {
      if (current.formData.finance.netMonthlyIncome === net) {
        return current;
      }

      return {
        ...current,
        formData: {
          ...current.formData,
          finance: {
            ...current.formData.finance,
            netMonthlyIncome: net,
          },
        },
      };
    });
  }, [draft.formData.finance.expenses, draft.formData.finance.incomes]);

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

  const updatePossessions = <
    K extends keyof CaseIntakeFormData["possessions"],
  >(
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

  const importFamilyData = () => {
    const family = families.find(
      (item) => item.id === draft.formData.family.linkedFamilyId,
    );

    if (!family) {
      return;
    }

    setDraft((current) => ({
      ...current,
      formData: {
        ...current.formData,
        person: {
          ...current.formData.person,
          fullName: family.headName || current.formData.person.fullName,
          nationalId:
            family.nationalId || current.formData.person.nationalId,
          mobile: family.phone || current.formData.person.mobile,
          job: family.job || current.formData.person.job,
          monthlyIncome:
            family.income || current.formData.person.monthlyIncome,
          educationState:
            family.education || current.formData.person.educationState,
          region: [family.city ?? "", family.village ?? ""]
            .filter(Boolean)
            .join(" > "),
          detailedAddress:
            family.addressDetails ||
            family.address ||
            current.formData.person.detailedAddress,
        },
        family: {
          ...current.formData.family,
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
      draft.formData.family.members.map((member) =>
        member.id === memberId ? { ...member, [key]: value } : member,
      ),
    );
  };

  const addFamilyMember = () => {
    updateFamily("members", [
      ...draft.formData.family.members,
      {
        id: createLocalId("member"),
        name: "",
        relation: "فرد أسرة",
        classification: "",
        age: "",
        mobile: "",
        education: "",
        job: "",
      },
    ]);
  };

  const removeFamilyMember = (memberId: string) => {
    updateFamily(
      "members",
      draft.formData.family.members.filter((member) => member.id !== memberId),
    );
  };

  const addRoom = () => {
    updateHousing("rooms", [
      ...draft.formData.housing.rooms,
      { id: createLocalId("room"), name: "", condition: "" },
    ]);
  };

  const updateRoom = (
    roomId: string,
    key: keyof CaseIntakeHousingRoom,
    value: string,
  ) => {
    updateHousing(
      "rooms",
      draft.formData.housing.rooms.map((room) =>
        room.id === roomId ? { ...room, [key]: value } : room,
      ),
    );
  };

  const removeRoom = (roomId: string) => {
    updateHousing(
      "rooms",
      draft.formData.housing.rooms.filter((room) => room.id !== roomId),
    );
  };

  const addPossession = () => {
    updatePossessions("items", [
      ...draft.formData.possessions.items,
      {
        id: createLocalId("possession"),
        name: "",
        type: "",
        value: "",
        notes: "",
      },
    ]);
  };

  const updatePossession = (
    itemId: string,
    key: keyof CaseIntakePossessionItem,
    value: string,
  ) => {
    updatePossessions(
      "items",
      draft.formData.possessions.items.map((item) =>
        item.id === itemId ? { ...item, [key]: value } : item,
      ),
    );
  };

  const removePossession = (itemId: string) => {
    updatePossessions(
      "items",
      draft.formData.possessions.items.filter((item) => item.id !== itemId),
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

  const selectedSupportByCategory = SUPPORT_CATALOG.map((category) => ({
    ...category,
    items: draft.formData.support.items.filter(
      (item) => item.category === category.category,
    ),
  }));

  const primaryStudents = draft.formData.family.members.filter((member) =>
    member.education?.includes("ابتدائي"),
  ).length;
  const preparatoryStudents = draft.formData.family.members.filter((member) =>
    member.education?.includes("اعدادي") ||
    member.education?.includes("إعدادي"),
  ).length;

  const previousCases =
    caseRecord?.family?.cases?.filter((item) => item.id !== caseRecord.id) ?? [];

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.formData.person.fullName.trim()) {
      alert("يجب إدخال الاسم الكامل.");
      return;
    }
    if (!draft.caseType.trim()) {
      alert("يجب اختيار نوع الدعم أو التدخل.");
      return;
    }

    const payload: CreateCaseDto = {
      applicantName: draft.formData.person.fullName.trim(),
      nationalId: draft.formData.person.nationalId.trim() || undefined,
      caseType: draft.caseType.trim(),
      priority: draft.priority,
      description: draft.description.trim() || undefined,
      location: draft.formData.person.region.trim() || "غير محدد",
      familyId: draft.formData.family.linkedFamilyId || undefined,
      formData: {
        ...draft.formData,
        support: {
          ...draft.formData.support,
          specialistName:
            draft.formData.support.specialistName || currentUserName,
        },
      },
    };

    try {
      setSaving(true);
      await onSubmit(payload);
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

  return (
    <form onSubmit={submitForm} className="space-y-6">
      <div className="rounded-[28px] border border-outline-variant/30 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">
              {mode === "edit" ? "تعديل بيانات الحالة" : "تسجيل حالة جديدة"}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              نفس تقسيم الكارت المرجعي: بيانات الحالة، الأسرة، السكن، الحيازات،
              الدخل، التصنيف، والدعم الحالي.
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
              <span className="block text-xs">الأخصائي</span>
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
        title="بيانات الحالة"
        subtitle="البيانات الشخصية والأساسية كما تظهر في الكارت المرجعي."
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
            </span>
            <input
              required
              value={draft.formData.person.fullName}
              onChange={(event) => updatePerson("fullName", event.target.value)}
              placeholder="الاسم كامل"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
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
              placeholder="الرقم القومي"
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
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              تاريخ الميلاد
            </span>
            <input
              type="date"
              value={draft.formData.person.birthDate}
              onChange={(event) => updatePerson("birthDate", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              العمر
            </span>
            <input
              value={draft.formData.person.age}
              onChange={(event) => updatePerson("age", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              النوع
            </span>
            <input
              value={draft.formData.person.gender}
              onChange={(event) => updatePerson("gender", event.target.value)}
              placeholder="ذكر / أنثى"
              className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low py-3 px-4 text-sm outline-none focus:border-primary"
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
              value={draft.formData.person.monthlyIncome}
              onChange={(event) =>
                updatePerson("monthlyIncome", event.target.value)
              }
              placeholder="الدخل الشهري"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              المؤهل التعليمي
            </span>
            <select
              value={draft.formData.person.educationState}
              onChange={(event) =>
                updatePerson("educationState", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              {EDUCATION_STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              نوع التعليم
            </span>
            <select
              value={draft.formData.person.educationType}
              onChange={(event) =>
                updatePerson("educationType", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              {EDUCATION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              المرحلة الدراسية
            </span>
            <select
              value={draft.formData.person.educationStage}
              onChange={(event) =>
                updatePerson("educationStage", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              {EDUCATION_STAGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-1">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الصف الدراسي
            </span>
            <select
              value={draft.formData.person.schoolYear}
              onChange={(event) => updatePerson("schoolYear", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              {SCHOOL_YEARS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              ملاحظات الدراسة
            </span>
            <input
              value={draft.formData.person.educationNotes}
              onChange={(event) =>
                updatePerson("educationNotes", event.target.value)
              }
              placeholder="ملاحظات الدراسة"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-6 flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.person.expensesExempted}
              onChange={(event) =>
                updatePerson("expensesExempted", event.target.checked)
              }
              className="h-4 w-4 accent-primary"
            />
            الإعفاء من المصروفات
          </label>
          <label className="xl:col-span-3">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              المدينة / القرية
            </span>
            <select
              value={draft.formData.person.region}
              onChange={(event) => updatePerson("region", event.target.value)}
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">اختر المنطقة</option>
              {locations.map((location) => (
                <option key={location.id} value={`${location.region} > ${location.name}`}>
                  {location.region} &gt; {location.name}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-3">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              الجمعية
            </span>
            <select
              value={draft.formData.person.association}
              onChange={(event) =>
                updatePerson("association", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">اختر الجمعية</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.name}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
          <label className="xl:col-span-6">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              العنوان التفصيلي
            </span>
            <textarea
              rows={3}
              value={draft.formData.person.detailedAddress}
              onChange={(event) =>
                updatePerson("detailedAddress", event.target.value)
              }
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
              onChange={(event) =>
                updatePerson("tamweenSupport", event.target.checked)
              }
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
              onChange={(event) =>
                updatePerson("tamweenBeneficiaries", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="xl:col-span-2">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              نوع الدعم / التدخل
            </span>
            <select
              value={draft.caseType}
              onChange={(event) =>
                setDraft((current) => ({ ...current, caseType: event.target.value }))
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              {CASE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="xl:col-span-1">
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
          <label className="xl:col-span-6">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              ملخص الحالة / الاحتياج
            </span>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="اكتب ملخصًا واضحًا للاحتياج الحالي"
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard
        id="family"
        title="بيانات الأسرة"
        subtitle="يمكن ربط الحالة بأسرة موجودة أو إدخال أفراد الأسرة يدويًا."
        open={sectionsOpen.family}
        onToggle={toggleSection}
        footer={
          <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.family.dataComplete}
              onChange={(event) =>
                updateFamily("dataComplete", event.target.checked)
              }
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
              onChange={(event) =>
                updateFamily("linkedFamilyId", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            >
              <option value="">بدون ربط</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.headName} {family.nationalId ? `- ${family.nationalId}` : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={importFamilyData}
              disabled={!draft.formData.family.linkedFamilyId}
              className="w-full rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              استيراد بيانات الأسرة
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-outline-variant/20">
          <table className="min-w-full divide-y divide-outline-variant/20 text-right text-sm">
            <thead className="bg-surface-container-lowest text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-bold">اسم الفرد</th>
                <th className="px-4 py-3 font-bold">درجة القرابة</th>
                <th className="px-4 py-3 font-bold">التصنيف</th>
                <th className="px-4 py-3 font-bold">السن</th>
                <th className="px-4 py-3 font-bold">المحمول</th>
                <th className="px-4 py-3 font-bold">التعليم</th>
                <th className="px-4 py-3 font-bold">الوظيفة</th>
                <th className="px-4 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {draft.formData.family.members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-5 text-center text-on-surface-variant">
                    لا يوجد أفراد مسجلون بعد.
                  </td>
                </tr>
              ) : (
                draft.formData.family.members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <input
                        value={member.name}
                        onChange={(event) =>
                          updateFamilyMember(member.id, "name", event.target.value)
                        }
                        className="w-44 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={member.relation}
                        onChange={(event) =>
                          updateFamilyMember(
                            member.id,
                            "relation",
                            event.target.value,
                          )
                        }
                        className="w-32 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={member.classification ?? ""}
                        onChange={(event) =>
                          updateFamilyMember(
                            member.id,
                            "classification",
                            event.target.value,
                          )
                        }
                        className="w-36 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={member.age ?? ""}
                        onChange={(event) =>
                          updateFamilyMember(member.id, "age", event.target.value)
                        }
                        className="w-20 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={member.mobile ?? ""}
                        onChange={(event) =>
                          updateFamilyMember(member.id, "mobile", event.target.value)
                        }
                        className="w-36 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={member.education ?? ""}
                        onChange={(event) =>
                          updateFamilyMember(
                            member.id,
                            "education",
                            event.target.value,
                          )
                        }
                        className="w-36 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={member.job ?? ""}
                        onChange={(event) =>
                          updateFamilyMember(member.id, "job", event.target.value)
                        }
                        className="w-36 rounded-xl border border-outline-variant/40 bg-white py-2 px-3 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(member.id)}
                        className="rounded-xl bg-error/10 px-3 py-2 text-xs font-bold text-error"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={addFamilyMember}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/15"
          >
            أضف فرد آخر
          </button>
          <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
            <span className="rounded-2xl bg-surface-container-low px-4 py-2">
              عدد الأفراد: {draft.formData.family.members.length}
            </span>
            <span className="rounded-2xl bg-surface-container-low px-4 py-2">
              ابتدائي: {primaryStudents}
            </span>
            <span className="rounded-2xl bg-surface-container-low px-4 py-2">
              إعدادي: {preparatoryStudents}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="housing"
        title="بيانات السكن"
        subtitle="نفس منطق الكارت المرجعي: الوصف، الطبيعة، المرافق، والأجهزة."
        open={sectionsOpen.housing}
        onToggle={toggleSection}
        footer={
          <label className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <input
              type="checkbox"
              checked={draft.formData.housing.dataComplete}
              onChange={(event) =>
                updateHousing("dataComplete", event.target.checked)
              }
              className="h-4 w-4 accent-primary"
            />
            تم استكمال بيانات السكن
          </label>
        }
      >
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-on-surface">
            وصف حالة السكن
          </span>
          <textarea
            rows={3}
            value={draft.formData.housing.description}
            onChange={(event) => updateHousing("description", event.target.value)}
            placeholder="وصف حالة السكن"
            className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="grid gap-5 xl:grid-cols-2">
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
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {[
            ["السقف", draft.formData.housing.roof, ROOF_OPTIONS, (values: string[]) => updateHousing("roof", values)],
            ["الأرضية", draft.formData.housing.floor, FLOOR_OPTIONS, (values: string[]) => updateHousing("floor", values)],
            ["المدخل", draft.formData.housing.entrance, ENTRANCE_OPTIONS, (values: string[]) => updateHousing("entrance", values)],
            ["الحوائط", draft.formData.housing.walls, WALL_OPTIONS, (values: string[]) => updateHousing("walls", values)],
            ["وسيلة مواصلات", draft.formData.housing.transport, TRANSPORT_OPTIONS, (values: string[]) => updateHousing("transport", values)],
          ].map(([label, values, options, onChange]) => (
            <div key={label as string}>
              <span className="mb-3 block text-sm font-bold text-on-surface">
                {label as string}
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
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
                          onChange as (values: string[]) => void,
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
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {(Object.entries(HOUSE_RADIO_OPTIONS) as Array<[keyof typeof HOUSE_RADIO_OPTIONS, string[]]>).map(
            ([key, options]) => (
              <div key={key}>
                <span className="mb-3 block text-sm font-bold text-on-surface">
                  {{
                    bathroomType: "طبيعة دورات المياه",
                    bathroomState: "حالة دورات المياه",
                    electricity: "الكهرباء",
                    water: "عداد المياه",
                    waterPump: "طلمبة مياه",
                    cookware: "أجهزة الطبخ",
                    tv: "التلفاز",
                    fridge: "الثلاجة",
                    washingMachine: "الغسالة",
                    oven: "فرن خبيز",
                    computer: "حاسب آلي",
                    internet: "إنترنت",
                  }[key]}
                </span>
                <div className="grid gap-3">
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
            ),
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-outline-variant/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface">الغرف</h3>
              <p className="text-sm text-on-surface-variant">
                تكرار مشابه لفكرة الـ repeater في المرجع.
              </p>
            </div>
            <button
              type="button"
              onClick={addRoom}
              className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
            >
              أضف غرفة
            </button>
          </div>
          <div className="space-y-3">
            {draft.formData.housing.rooms.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
                لا توجد غرف مضافة.
              </div>
            ) : (
              draft.formData.housing.rooms.map((room) => (
                <div
                  key={room.id}
                  className="grid gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    value={room.name}
                    onChange={(event) =>
                      updateRoom(room.id, "name", event.target.value)
                    }
                    placeholder="اسم الغرفة"
                    className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={room.condition ?? ""}
                    onChange={(event) =>
                      updateRoom(room.id, "condition", event.target.value)
                    }
                    placeholder="الحالة / الملاحظات"
                    className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-bold text-error"
                  >
                    حذف
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="possessions"
        title="الحيازات"
        subtitle="هل توجد حيازات؟ مع إمكانية إضافة تفاصيل متعددة."
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
            تم استكمال بيانات الحيازات
          </label>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {["غير محدد", "لا", "نعم"].map((option) => (
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
          <div className="space-y-4 rounded-3xl border border-outline-variant/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-on-surface">تفاصيل الحيازات</h3>
              <button
                type="button"
                onClick={addPossession}
                className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
              >
                أضف حيازة
              </button>
            </div>
            {draft.formData.possessions.items.length === 0 ? (
              <div className="rounded-2xl bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
                لا توجد حيازات مضافة.
              </div>
            ) : (
              draft.formData.possessions.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 lg:grid-cols-4"
                >
                  <input
                    value={item.name}
                    onChange={(event) =>
                      updatePossession(item.id, "name", event.target.value)
                    }
                    placeholder="اسم الحيازة"
                    className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={item.type ?? ""}
                    onChange={(event) =>
                      updatePossession(item.id, "type", event.target.value)
                    }
                    placeholder="النوع"
                    className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={item.value ?? ""}
                    onChange={(event) =>
                      updatePossession(item.id, "value", event.target.value)
                    }
                    placeholder="القيمة التقديرية"
                    className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex gap-3">
                    <input
                      value={item.notes ?? ""}
                      onChange={(event) =>
                        updatePossession(item.id, "notes", event.target.value)
                      }
                      placeholder="ملاحظات"
                      className="flex-1 rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removePossession(item.id)}
                      className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-bold text-error"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        id="finance"
        title="بيانات الدخل والمصروفات"
        subtitle="جدولان متقابلان للدخل والمصروفات مع صافي الدخل الشهري."
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
                          onChange={(event) =>
                            updateFinance("incomes", {
                              ...draft.formData.finance.incomes,
                              [label]: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
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
                          onChange={(event) =>
                            updateFinance("expenses", {
                              ...draft.formData.finance.expenses,
                              [label]: event.target.value,
                            })
                          }
                          className="w-full rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
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
        title="بيانات تصنيف الحالة"
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
            onChange={(event) =>
              updateClassification("degree", event.target.value)
            }
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
        title="الدعم الحالي"
        subtitle="خدمات مصنفة مع ملاحظات أخصائي التنمية ورأيه."
        open={sectionsOpen.support}
        onToggle={toggleSection}
      >
        <div className="space-y-6">
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
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input
                          value={item.notes ?? ""}
                          onChange={(event) =>
                            updateSupportItem(
                              item.id,
                              "notes",
                              event.target.value,
                            )
                          }
                          placeholder="الوصف / الملاحظات"
                          className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                        />
                        <input
                          value={item.cost ?? ""}
                          onChange={(event) =>
                            updateSupportItem(
                              item.id,
                              "cost",
                              event.target.value,
                            )
                          }
                          placeholder="التكلفة"
                          className="rounded-2xl border border-outline-variant/40 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-on-surface">
                أخصائي التنمية
              </span>
              <input
                disabled
                value={draft.formData.support.specialistName || currentUserName}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low py-3 px-4 text-sm text-on-surface"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-on-surface">
                رأي أخصائي التنمية
              </span>
              <select
                value={draft.formData.support.specialistOpinion}
                onChange={(event) =>
                  updateSupport("specialistOpinion", event.target.value)
                }
                className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
              >
                {SPECIALIST_OPINIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-on-surface">
              ملاحظات أخصائي التنمية
            </span>
            <textarea
              rows={4}
              value={draft.formData.support.specialistNotes}
              onChange={(event) =>
                updateSupport("specialistNotes", event.target.value)
              }
              className="w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary"
            />
          </label>
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
                  <th className="px-4 py-3 font-bold">تاريخ الطلب</th>
                  <th className="px-4 py-3 font-bold">نوع الدعم</th>
                  <th className="px-4 py-3 font-bold">الحالة</th>
                  <th className="px-4 py-3 font-bold">القرار</th>
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
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/cases"
                className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface"
              >
                العودة للقائمة
              </Link>
              {caseRecord && onDelete ? (
                <button
                  type="button"
                  onClick={deleteCase}
                  disabled={deleting}
                  className="rounded-2xl bg-error px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "جاري الحذف..." : "حذف الكارت"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
