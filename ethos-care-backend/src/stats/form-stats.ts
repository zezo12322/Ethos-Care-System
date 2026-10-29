// تجميع أرقام استمارة الحالة: كم مرة طُلب كل بند دعم (لحوم، سلة غذائية...)،
// وكم منها اعتُمد، وإجمالي تكلفته، مع أنواع التدخل والتصنيفات.

const APPROVED_STAGES = ['APPROVED', 'EXECUTION', 'COMPLETED'];
const REJECTED_STAGES = ['REJECTED', 'TECH_REJECTED'];

export interface FormStatsCase {
  caseType: string;
  lifecycleStatus: string;
  formData: unknown;
}

interface Counter {
  requested: number;
  approved: number;
  cost: number;
}

interface FormShape {
  support?: {
    items?: {
      category?: string;
      name?: string;
      selected?: boolean;
      cost?: string;
    }[];
    disabilitySupportType?: string;
    disabilitySupportCost?: string;
  };
  classification?: { tags?: string[]; degree?: string };
}

// التكلفة نص حر: نحوّل الأرقام العربية ونتجاهل أي رموز (ج.م، فواصل...)
export const parseCost = (value?: string): number => {
  if (!value) return 0;
  const latin = value
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^\d.]/g, '');
  const n = Number.parseFloat(latin);
  return Number.isFinite(n) ? n : 0;
};

const bump = (
  map: Map<string, Counter>,
  key: string,
  approved: boolean,
  cost = 0,
) => {
  const c = map.get(key) ?? { requested: 0, approved: 0, cost: 0 };
  c.requested++;
  if (approved) c.approved++;
  c.cost += cost;
  map.set(key, c);
};

const toRows = (map: Map<string, Counter>) =>
  [...map.entries()]
    .map(([name, c]) => ({ name, ...c }))
    .sort((a, b) => b.requested - a.requested);

// الحالات المرفوضة لا تُحسب ضمن المطلوب
export function aggregateFormStats(cases: FormStatsCase[]) {
  const items = new Map<string, Map<string, Counter>>();
  const caseTypes = new Map<string, Counter>();
  const classifications = new Map<string, Counter>();
  const degrees = new Map<string, Counter>();
  const disability = new Map<string, Counter>();
  let counted = 0;

  for (const c of cases) {
    if (REJECTED_STAGES.includes(c.lifecycleStatus)) continue;
    counted++;
    const approved = APPROVED_STAGES.includes(c.lifecycleStatus);
    const form = (c.formData ?? {}) as FormShape;

    for (const type of (c.caseType ?? '').split(/[،,]/)) {
      if (type.trim()) bump(caseTypes, type.trim(), approved);
    }

    for (const item of form.support?.items ?? []) {
      if (!item?.selected || !item.name) continue;
      const category = item.category || 'أخرى';
      if (!items.has(category)) items.set(category, new Map());
      bump(items.get(category)!, item.name, approved, parseCost(item.cost));
    }

    const disabilityType = form.support?.disabilitySupportType?.trim();
    if (disabilityType) {
      bump(
        disability,
        disabilityType,
        approved,
        parseCost(form.support?.disabilitySupportCost),
      );
    }

    for (const tag of form.classification?.tags ?? []) {
      if (tag) bump(classifications, tag, approved);
    }
    // الدرجة تُحسب فقط لو الباحث صنّف الحالة فعلًا
    const degree = form.classification?.degree;
    if (degree && form.classification?.tags?.length) {
      bump(degrees, degree, approved);
    }
  }

  const supportItems = [...items.entries()].map(([category, map]) => {
    const rows = toRows(map);
    return {
      category,
      items: rows,
      requested: rows.reduce((s, r) => s + r.requested, 0),
      approved: rows.reduce((s, r) => s + r.approved, 0),
      cost: rows.reduce((s, r) => s + r.cost, 0),
    };
  });
  if (disability.size) {
    const rows = toRows(disability);
    supportItems.push({
      category: 'دعم ذوي الإعاقة',
      items: rows,
      requested: rows.reduce((s, r) => s + r.requested, 0),
      approved: rows.reduce((s, r) => s + r.approved, 0),
      cost: rows.reduce((s, r) => s + r.cost, 0),
    });
  }

  return {
    casesCounted: counted,
    supportItems: supportItems.sort((a, b) => b.requested - a.requested),
    caseTypes: toRows(caseTypes),
    classifications: toRows(classifications),
    degrees: toRows(degrees),
  };
}
