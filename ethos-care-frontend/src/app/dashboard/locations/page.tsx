"use client";

import { locationsService } from "@/services/locations.service";
import { LocationRecord } from "@/types/api";
import { FormEvent, useEffect, useMemo, useState } from "react";

type CreationContext =
  | { kind: "center" }
  | { kind: "village"; centerName: string }
  | { kind: "association"; centerName: string; villageName: string };

const emptyForm = {
  name: "",
  status: "مفعل",
};

function buildAssociationRegion(centerName: string, villageName: string) {
  return `${centerName} > ${villageName}`;
}

function matchesAssociationLocation(
  location: LocationRecord,
  centerName: string,
  villageName: string,
) {
  if (location.type !== "جمعية") {
    return false;
  }

  const normalized = location.region.replace(/\s*>\s*/g, " > ").trim();
  return (
    normalized === buildAssociationRegion(centerName, villageName) ||
    normalized === villageName
  );
}

function getStatusTone(status: string) {
  return status === "مفعل"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-800";
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creationContext, setCreationContext] = useState<CreationContext>({
    kind: "center",
  });
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await locationsService.getAll();
        if (active) {
          setLocations(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("تعذر تحميل بيانات النطاق الجغرافي الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLocations();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refreshLocations = () => setReloadKey((current) => current + 1);

  const centerNodes = useMemo(() => {
    const centersByName = new Map<
      string,
      {
        name: string;
        record?: LocationRecord;
        villages: Array<{
          record: LocationRecord;
          associations: LocationRecord[];
        }>;
      }
    >();

    const centers = locations
      .filter((location) => location.type === "مركز")
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));
    const villages = locations
      .filter((location) => location.type === "قرية")
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));
    const associations = locations
      .filter((location) => location.type === "جمعية")
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));

    centers.forEach((center) => {
      centersByName.set(center.name, {
        name: center.name,
        record: center,
        villages: [],
      });
    });

    villages.forEach((village) => {
      const centerName = village.region || "غير مصنف";
      if (!centersByName.has(centerName)) {
        centersByName.set(centerName, {
          name: centerName,
          villages: [],
        });
      }

      centersByName.get(centerName)?.villages.push({
        record: village,
        associations: associations.filter((association) =>
          matchesAssociationLocation(association, centerName, village.name),
        ),
      });
    });

    return Array.from(centersByName.values())
      .map((center) => ({
        ...center,
        villages: center.villages.sort((left, right) =>
          left.record.name.localeCompare(right.record.name, "ar"),
        ),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));
  }, [locations]);

  const centersCount = centerNodes.length;
  const villagesCount = locations.filter((location) => location.type === "قرية").length;
  const associationsCount = locations.filter((location) => location.type === "جمعية").length;

  const openCreateModal = (context: CreationContext) => {
    setCreationContext(context);
    setFormData(emptyForm);
    setError("");
    setFeedback("");
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setFormData(emptyForm);
    setCreationContext({ kind: "center" });
  };

  const handleCreateLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError("يجب إدخال الاسم أولًا.");
      return;
    }

    const payload =
      creationContext.kind === "center"
        ? {
            name: trimmedName,
            type: "مركز",
            region: "بني سويف",
            status: formData.status,
          }
        : creationContext.kind === "village"
          ? {
              name: trimmedName,
              type: "قرية",
              region: creationContext.centerName,
              status: formData.status,
            }
          : {
              name: trimmedName,
              type: "جمعية",
              region: buildAssociationRegion(
                creationContext.centerName,
                creationContext.villageName,
              ),
              status: formData.status,
            };

    try {
      await locationsService.create(payload);
      setFeedback(
        creationContext.kind === "center"
          ? "تمت إضافة المركز بنجاح."
          : creationContext.kind === "village"
            ? "تمت إضافة القرية بنجاح."
            : "تمت إضافة الجمعية بنجاح.",
      );
      resetModal();
      refreshLocations();
    } catch (createError) {
      console.error(createError);
      setError("تعذر حفظ هذا العنصر الآن.");
    }
  };

  const handleDeleteLocation = async (location: LocationRecord) => {
    if (location.type === "مركز") {
      const hasVillages = locations.some(
        (candidate) => candidate.type === "قرية" && candidate.region === location.name,
      );
      if (hasVillages) {
        setError("لا يمكن حذف المركز قبل حذف القرى التابعة له.");
        return;
      }
    }

    if (location.type === "قرية") {
      const hasAssociations = locations.some((candidate) =>
        matchesAssociationLocation(candidate, location.region, location.name),
      );
      if (hasAssociations) {
        setError("لا يمكن حذف القرية قبل حذف الجمعيات التابعة لها.");
        return;
      }
    }

    if (!window.confirm(`هل تريد حذف ${location.type} "${location.name}"؟`)) {
      return;
    }

    setError("");
    setFeedback("");

    try {
      await locationsService.remove(location.id);
      setFeedback("تم الحذف بنجاح.");
      refreshLocations();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف هذا العنصر الآن.");
    }
  };

  const modalTitle =
    creationContext.kind === "center"
      ? "إضافة مركز جديد"
      : creationContext.kind === "village"
        ? `إضافة قرية داخل ${creationContext.centerName}`
        : `إضافة جمعية داخل ${creationContext.villageName}`;

  const modalHint =
    creationContext.kind === "center"
      ? "سيظهر المركز كبداية الهرم الجغرافي."
      : creationContext.kind === "village"
        ? `سيتم ربط القرية تلقائيًا بالمركز ${creationContext.centerName}.`
        : `سيتم ربط الجمعية تلقائيًا بالقرية ${creationContext.villageName}.`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            إدارة النطاق الجغرافي
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            إدارة هرمية مباشرة: المركز يضم قرى، وكل قرية تضم جمعياتها المحلية.
          </p>
        </div>
        <button
          onClick={() => openCreateModal({ kind: "center" })}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          إضافة مركز
        </button>
      </div>

      {(error || feedback) && (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-bold ${
            error
              ? "border border-error/20 bg-error/5 text-error"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {error || feedback}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">عدد المراكز</div>
          <div className="mt-2 text-3xl font-bold text-on-surface">{centersCount}</div>
        </div>
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">عدد القرى</div>
          <div className="mt-2 text-3xl font-bold text-on-surface">{villagesCount}</div>
        </div>
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">عدد الجمعيات</div>
          <div className="mt-2 text-3xl font-bold text-on-surface">
            {associationsCount}
          </div>
        </div>
      </div>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-3xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant">
            جار تحميل شجرة النطاق الجغرافي...
          </div>
        ) : centerNodes.length === 0 ? (
          <div className="rounded-3xl border border-outline-variant/20 bg-white p-8 text-center text-sm text-on-surface-variant">
            لا توجد مراكز مسجلة حتى الآن.
          </div>
        ) : (
          centerNodes.map((centerNode) => (
            <div
              key={centerNode.name}
              className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white shadow-sm"
            >
              <div className="border-b border-outline-variant/20 bg-[linear-gradient(135deg,rgba(1,73,118,0.08),rgba(255,255,255,0.98))] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-on-surface">
                        {centerNode.name}
                      </h2>
                      {centerNode.record ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(centerNode.record.status)}`}
                        >
                          {centerNode.record.status}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          مركز مستنتج من البيانات الحالية
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      عدد القرى: {centerNode.villages.length}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        openCreateModal({
                          kind: "village",
                          centerName: centerNode.name,
                        })
                      }
                      className="rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white"
                    >
                      إضافة قرية
                    </button>
                    {centerNode.record ? (
                      <button
                        onClick={() => handleDeleteLocation(centerNode.record!)}
                        className="rounded-2xl bg-error/10 px-4 py-2 text-sm font-bold text-error"
                      >
                        حذف المركز
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                {centerNode.villages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-outline-variant/40 bg-surface-container-lowest p-6 text-center text-sm text-on-surface-variant">
                    لا توجد قرى مرتبطة بهذا المركز حتى الآن.
                  </div>
                ) : (
                  centerNode.villages.map(({ record: village, associations }) => (
                    <div
                      key={village.id}
                      className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/50 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold text-on-surface">
                              {village.name}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(village.status)}`}
                            >
                              {village.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-on-surface-variant">
                            الجمعيات التابعة: {associations.length}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              openCreateModal({
                                kind: "association",
                                centerName: centerNode.name,
                                villageName: village.name,
                              })
                            }
                            className="rounded-2xl bg-tertiary px-4 py-2 text-sm font-bold text-white"
                          >
                            إضافة جمعية
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(village)}
                            className="rounded-2xl bg-error/10 px-4 py-2 text-sm font-bold text-error"
                          >
                            حذف القرية
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {associations.length === 0 ? (
                          <div className="rounded-2xl bg-white px-4 py-4 text-sm text-on-surface-variant">
                            لا توجد جمعيات تابعة لهذه القرية بعد.
                          </div>
                        ) : (
                          associations.map((association) => (
                            <div
                              key={association.id}
                              className="flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-on-surface">
                                    {association.name}
                                  </p>
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(association.status)}`}
                                  >
                                    {association.status}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-on-surface-variant">
                                  الجمعية مرتبطة بالقرية {village.name}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteLocation(association)}
                                className="self-start rounded-2xl bg-error/10 px-4 py-2 text-sm font-bold text-error sm:self-auto"
                              >
                                حذف الجمعية
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-on-surface">{modalTitle}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{modalHint}</p>
              </div>
              <button
                type="button"
                onClick={resetModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-on-surface">
                  الاسم
                </label>
                <input
                  required
                  type="text"
                  placeholder={
                    creationContext.kind === "center"
                      ? "اسم المركز"
                      : creationContext.kind === "village"
                        ? "اسم القرية"
                        : "اسم الجمعية"
                  }
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                  className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-on-surface">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({ ...formData, status: event.target.value })
                  }
                  className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="مفعل">مفعل</option>
                  <option value="موقوف">موقوف</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 rounded-2xl bg-surface-container-highest py-3 text-sm font-bold text-on-surface"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
