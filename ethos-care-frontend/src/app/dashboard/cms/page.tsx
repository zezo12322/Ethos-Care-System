"use client";

import { useAuth } from "@/contexts/AuthContext";
import { cmsService, Campaign, Program, SiteContent } from "@/services/cms.service";
import { useEffect, useState } from "react";

type Tab = "content" | "campaigns" | "programs";

const CAMPAIGN_LABELS: Record<string, string> = {
  title: "العنوان",
  description: "الوصف",
  category: "الفئة",
  icon: "الأيقونة (اسم Material Icon)",
  color: "لون الشريط (مثل: bg-primary)",
  lightColor: "لون الخلفية الفاتح (مثل: bg-primary/10)",
  target: "المبلغ المستهدف",
  raised: "المبلغ المجموع",
  order: "الترتيب",
};

const PROGRAM_LABELS: Record<string, string> = {
  title: "العنوان",
  description: "الوصف",
  icon: "الأيقونة (اسم Material Icon)",
  bg: "لون الخلفية (مثل: bg-primary/10)",
  accent: "لون النص (مثل: text-primary)",
  order: "الترتيب",
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "content", label: "محتوى الموقع", icon: "article" },
  { id: "campaigns", label: "الحملات", icon: "campaign" },
  { id: "programs", label: "البرامج", icon: "hub" },
];

export default function CmsPage() {
  const { user, loading: authLoading } = useAuth();
  const canAccess = user?.role === "ADMIN" || user?.role === "CEO";

  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  // Content
  const [content, setContent] = useState<SiteContent[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignModal, setCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<Partial<Campaign>>({});

  // Programs
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programModal, setProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState<Partial<Program>>({});

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  useEffect(() => {
    if (authLoading || !canAccess) {
      setLoading(false);
      return;
    }
    loadAll();
  }, [authLoading, canAccess]);

  async function loadAll() {
    setLoading(true);
    try {
      const [c, camp, prog] = await Promise.all([
        cmsService.getContent(),
        cmsService.getCampaigns(true),
        cmsService.getPrograms(true),
      ]);
      setContent(c);
      setCampaigns(camp);
      setPrograms(prog);
    } catch {
      showError("تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }

  // ── Content handlers ──────────────────────────────────────────────────────

  async function saveContent(key: string) {
    try {
      await cmsService.updateContent(key, editValue);
      setContent((prev) =>
        prev.map((item) => (item.key === key ? { ...item, value: editValue } : item))
      );
      setEditingKey(null);
      showFeedback("تم الحفظ");
    } catch {
      showError("فشل الحفظ");
    }
  }

  // ── Campaign handlers ─────────────────────────────────────────────────────

  function openCampaignModal(campaign?: Campaign) {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({ ...campaign });
    } else {
      setEditingCampaign(null);
      setCampaignForm({ active: true, order: 0, raised: 0, target: 0, color: "bg-primary", lightColor: "bg-primary/10" });
    }
    setCampaignModal(true);
  }

  async function saveCampaign() {
    try {
      if (editingCampaign) {
        const updated = await cmsService.updateCampaign(editingCampaign.id, campaignForm);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await cmsService.createCampaign(campaignForm as Omit<Campaign, "id">);
        setCampaigns((prev) => [...prev, created]);
      }
      setCampaignModal(false);
      showFeedback(editingCampaign ? "تم التحديث" : "تمت الإضافة");
    } catch {
      showError("فشلت العملية");
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm("حذف الحملة نهائياً؟")) return;
    try {
      await cmsService.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      showFeedback("تم الحذف");
    } catch {
      showError("فشل الحذف");
    }
  }

  // ── Program handlers ──────────────────────────────────────────────────────

  function openProgramModal(program?: Program) {
    if (program) {
      setEditingProgram(program);
      setProgramForm({ ...program });
    } else {
      setEditingProgram(null);
      setProgramForm({ active: true, order: 0, bg: "bg-primary/10", accent: "text-primary" });
    }
    setProgramModal(true);
  }

  async function saveProgram() {
    try {
      if (editingProgram) {
        const updated = await cmsService.updateProgram(editingProgram.id, programForm);
        setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await cmsService.createProgram(programForm as Omit<Program, "id">);
        setPrograms((prev) => [...prev, created]);
      }
      setProgramModal(false);
      showFeedback(editingProgram ? "تم التحديث" : "تمت الإضافة");
    } catch {
      showError("فشلت العملية");
    }
  }

  async function deleteProgram(id: string) {
    if (!confirm("حذف البرنامج نهائياً؟")) return;
    try {
      await cmsService.deleteProgram(id);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      showFeedback("تم الحذف");
    } catch {
      showError("فشل الحذف");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-64 text-error font-bold">
        غير مصرح لك بالوصول
      </div>
    );
  }

  const groupedContent = content.reduce<Record<string, SiteContent[]>>((acc, item) => {
    const g = item.group ?? "أخرى";
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface">إدارة محتوى الموقع</h1>
        <p className="text-sm text-on-surface-variant mt-1">تحكم في النصوص والحملات والبرامج الظاهرة في الصفحات العامة</p>
      </div>

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm font-bold">
          {feedback}
        </div>
      )}
      {error && (
        <div className="bg-error/5 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant/20 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-8">
          {Object.entries(groupedContent).map(([group, items]) => (
            <div key={group} className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-surface-container-lowest px-6 py-3 border-b border-outline-variant/20">
                <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide">{group}</h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {items.map((item) => (
                  <div key={item.key} className="px-6 py-4">
                    {editingKey === item.key ? (
                      <div className="space-y-2">
                        <p className="text-xs text-on-surface-variant font-bold">{item.label ?? item.key}</p>
                        <textarea
                          rows={3}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveContent(item.key)}
                            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="px-4 py-1.5 bg-surface-container text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-low transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-on-surface-variant font-bold mb-1">{item.label ?? item.key}</p>
                          <p className="text-sm text-on-surface truncate">{item.value}</p>
                        </div>
                        <button
                          onClick={() => { setEditingKey(item.key); setEditValue(item.value); }}
                          className="flex-shrink-0 p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openCampaignModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              إضافة حملة
            </button>
          </div>

          <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-lowest text-on-surface-variant text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-bold">الحملة</th>
                  <th className="px-4 py-3 text-right font-bold">الفئة</th>
                  <th className="px-4 py-3 text-right font-bold">الهدف</th>
                  <th className="px-4 py-3 text-right font-bold">تم جمعه</th>
                  <th className="px-4 py-3 text-center font-bold">الحالة</th>
                  <th className="px-4 py-3 text-center font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-lowest/50">
                    <td className="px-4 py-3 font-bold text-on-surface">{c.title}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{c.category}</td>
                    <td className="px-4 py-3 text-on-surface-variant" dir="ltr">{c.target.toLocaleString()}</td>
                    <td className="px-4 py-3 text-on-surface-variant" dir="ltr">{c.raised.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.active ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}>
                        {c.active ? "نشط" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openCampaignModal(c)} className="p-1.5 hover:bg-primary/5 text-primary rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => deleteCampaign(c.id)} className="p-1.5 hover:bg-error/5 text-error rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-on-surface-variant">لا توجد حملات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === "programs" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openProgramModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              إضافة برنامج
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${p.bg} ${p.accent}`}>
                  <span className="material-symbols-outlined">{p.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-on-surface">{p.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${p.active ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}>
                      {p.active ? "نشط" : "مخفي"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{p.description}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => openProgramModal(p)} className="p-1.5 hover:bg-primary/5 text-primary rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button onClick={() => deleteProgram(p.id)} className="p-1.5 hover:bg-error/5 text-error rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
            {programs.length === 0 && (
              <div className="md:col-span-2 py-12 text-center text-on-surface-variant">لا توجد برامج</div>
            )}
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {campaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <h2 className="font-bold font-headline text-on-surface">{editingCampaign ? "تعديل الحملة" : "إضافة حملة جديدة"}</h2>
              <button onClick={() => setCampaignModal(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(["title", "description", "category", "icon", "color", "lightColor"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant">{CAMPAIGN_LABELS[field]}</label>
                  <input
                    value={(campaignForm as Record<string, unknown>)[field] as string ?? ""}
                    onChange={(e) => setCampaignForm({ ...campaignForm, [field]: e.target.value })}
                    className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {(["target", "raised", "order"] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-bold mb-1 text-on-surface-variant">{CAMPAIGN_LABELS[field]}</label>
                    <input
                      type="number"
                      value={(campaignForm as Record<string, unknown>)[field] as number ?? 0}
                      onChange={(e) => setCampaignForm({ ...campaignForm, [field]: Number(e.target.value) })}
                      className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="camp-active"
                    type="checkbox"
                    checked={campaignForm.active ?? true}
                    onChange={(e) => setCampaignForm({ ...campaignForm, active: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="camp-active" className="text-sm font-bold text-on-surface">نشط</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={saveCampaign} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                حفظ
              </button>
              <button onClick={() => setCampaignModal(false)} className="flex-1 py-2.5 bg-surface-container text-on-surface-variant rounded-xl font-bold text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal */}
      {programModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <h2 className="font-bold font-headline text-on-surface">{editingProgram ? "تعديل البرنامج" : "إضافة برنامج جديد"}</h2>
              <button onClick={() => setProgramModal(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(["title", "description", "icon", "bg", "accent"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant">{PROGRAM_LABELS[field]}</label>
                  <input
                    value={(programForm as Record<string, unknown>)[field] as string ?? ""}
                    onChange={(e) => setProgramForm({ ...programForm, [field]: e.target.value })}
                    className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-on-surface-variant">{PROGRAM_LABELS.order}</label>
                  <input
                    type="number"
                    value={programForm.order ?? 0}
                    onChange={(e) => setProgramForm({ ...programForm, order: Number(e.target.value) })}
                    className="w-full border border-outline-variant/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="prog-active"
                    type="checkbox"
                    checked={programForm.active ?? true}
                    onChange={(e) => setProgramForm({ ...programForm, active: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="prog-active" className="text-sm font-bold text-on-surface">نشط</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={saveProgram} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                حفظ
              </button>
              <button onClick={() => setProgramModal(false)} className="flex-1 py-2.5 bg-surface-container text-on-surface-variant rounded-xl font-bold text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
