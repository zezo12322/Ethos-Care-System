"use client";

import {
  CreateOperationDto,
  operationsService,
} from "@/services/operations.service";
import { OperationRecord } from "@/types/api";
import {
  FormEvent,
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";

const initialFormData: CreateOperationDto = {
  name: "",
  type: "حملة توزيع إطعام",
  target: 100,
  volunteers: 10,
  executionDate: new Date().toISOString().slice(0, 10),
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ar-EG").format(value);

const sanitizeCsvCell = (value: string | number | null | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const getOperationIcon = (type: string) => {
  if (type.includes("توزيع")) return "inventory_2";
  if (type.includes("تعليم")) return "school";
  if (type.includes("طبية") || type.includes("صحي")) return "medical_services";
  if (type.includes("سكن")) return "home_repair_service";
  return "volunteer_activism";
};

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">(
    "all",
  );
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateOperationDto>(initialFormData);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await operationsService.getAll({
          search: deferredSearch || undefined,
          type: typeFilter === "ALL" ? undefined : typeFilter,
        });

        if (active) {
          setOperations(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setOperations([]);
          setError("تعذر تحميل العمليات الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, deferredSearch ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [deferredSearch, reloadKey, typeFilter]);

  const refreshOperations = () => setReloadKey((current) => current + 1);

  const handleCreateOperation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await operationsService.create(formData);
      setIsModalOpen(false);
      setFormData(initialFormData);
      refreshOperations();
    } catch (createError) {
      console.error(createError);
      setError("حدث خطأ أثناء إنشاء العملية.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteOperation = async (id: string) => {
    if (!confirm("هل أنت متأكد من إنهاء هذه العملية؟")) {
      return;
    }

    try {
      setCompletingId(id);
      await operationsService.complete(id);
      refreshOperations();
    } catch (completeError) {
      console.error(completeError);
      alert("تعذر إنهاء العملية الآن.");
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "جاري":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "مكتمل":
        return "bg-green-100 text-green-800 border-green-200";
      case "تجهيز":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredOperations = operations.filter((operation) => {
    if (activeTab === "active") {
      return operation.status !== "مكتمل";
    }

    if (activeTab === "completed") {
      return operation.status === "مكتمل";
    }

    return true;
  });

  const operationTypes = Array.from(
    new Set(operations.map((operation) => operation.type).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, "ar"));

  const totalTarget = filteredOperations.reduce(
    (total, operation) => total + (operation.target || 0),
    0,
  );
  const totalAchieved = filteredOperations.reduce(
    (total, operation) => total + (operation.achieved || 0),
    0,
  );
  const totalVolunteers = filteredOperations.reduce(
    (total, operation) => total + (operation.volunteers || 0),
    0,
  );

  const handleExport = () => {
    const rows = [
      [
        "رقم العملية",
        "اسم العملية",
        "النوع",
        "الحالة",
        "التاريخ",
        "المستهدف",
        "المنجز",
        "نسبة الإنجاز",
        "عدد المتطوعين",
      ],
      ...filteredOperations.map((operation) => [
        operation.id,
        operation.name,
        operation.type,
        operation.status,
        new Date(operation.date).toLocaleDateString("ar-EG"),
        operation.target,
        operation.achieved,
        `${operation.progress || 0}%`,
        operation.volunteers,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `operations_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            العمليات والحملات
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            متابعة أخف للعمليات الجارية والمكتملة مع بحث مباشر وإنهاء سريع للحملة.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void handleExport()}
            className="flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            تصدير
          </button>
          <button
            onClick={refreshOperations}
            className="flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            تحديث
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-container shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            إنشاء عملية جديدة
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "نتائج حالية",
            value: formatNumber(filteredOperations.length),
            icon: "view_list",
            tone: "text-primary bg-primary/10",
          },
          {
            label: "المستهدف",
            value: formatNumber(totalTarget),
            icon: "flag",
            tone: "text-violet-700 bg-violet-100",
          },
          {
            label: "المنجز",
            value: formatNumber(totalAchieved),
            icon: "task_alt",
            tone: "text-emerald-700 bg-emerald-100",
          },
          {
            label: "المتطوعون",
            value: formatNumber(totalVolunteers),
            icon: "groups",
            tone: "text-amber-700 bg-amber-100",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface-variant">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-bold font-headline text-on-surface">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {card.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-outline-variant/30 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface-container-lowest/50 p-4">
          <div className="flex w-full items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-3 py-2 transition-colors focus-within:border-primary md:w-96">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => {
                  setSearchInput(nextValue);
                });
              }}
              placeholder="بحث باسم العملية أو النوع أو رقم العملية..."
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-outline"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-outline-variant/50 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="ALL">كل أنواع العمليات</option>
              {operationTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-on-surface-variant">
              {loading ? "..." : `${formatNumber(filteredOperations.length)} نتيجة`}
            </span>
          </div>
        </div>

        <div className="flex gap-2 border-b border-outline-variant/30 px-4 pb-px pt-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            كل العمليات
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "active"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            الجارية
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            المكتملة
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-12 text-center text-on-surface-variant">
              جارٍ تحميل البيانات...
            </div>
          ) : filteredOperations.length === 0 ? (
            <div className="col-span-full py-12 text-center text-on-surface-variant">
              لا توجد عمليات مطابقة للفلاتر الحالية
            </div>
          ) : (
            filteredOperations.map((operation) => (
              <div
                key={operation.id}
                className="flex flex-col rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0px_4px_16px_-4px_rgba(0,40,38,0.04)] transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(operation.status)}`}
                  >
                    {operation.status}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary">
                    <span className="material-symbols-outlined">
                      {getOperationIcon(operation.type)}
                    </span>
                  </div>
                </div>

                <h3 className="mb-1 text-xl font-bold font-headline text-on-surface">
                  {operation.name}
                </h3>
                <p className="mb-2 text-sm text-on-surface-variant">
                  {operation.type} • التنفيذ:{" "}
                  {new Date(operation.date).toLocaleDateString("ar-EG")}
                </p>
                <p className="mb-6 text-xs text-on-surface-variant font-mono">
                  {operation.id.substring(0, 8).toUpperCase()}
                </p>

                <div className="mt-auto space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span className="text-on-surface-variant">نسبة الإنجاز</span>
                      <span className="text-primary">
                        {operation.progress || 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${operation.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-outline-variant/20 pt-4">
                    <div>
                      <p className="text-xs text-on-surface-variant">المستهدف</p>
                      <p className="text-lg font-bold">
                        <span className="text-primary">
                          {operation.achieved || 0}
                        </span>{" "}
                        / {operation.target}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">
                        فريق التطوع
                      </p>
                      <p className="text-lg font-bold">
                        {operation.volunteers || 0} متطوع
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {operation.status !== "مكتمل" && (
                      <button
                        onClick={() => void handleCompleteOperation(operation.id)}
                        className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        {completingId === operation.id ? "جارٍ الإنهاء..." : "إنهاء العملية"}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setSearchInput(operation.name)
                      }
                      className="rounded-xl bg-surface-container-high px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
                    >
                      تتبع
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-right leading-relaxed shadow-xl">
            <h3 className="mb-4 text-xl font-bold">إنشاء عملية/حملة جديدة</h3>
            <form onSubmit={handleCreateOperation} className="space-y-4">
              <input
                required
                type="text"
                placeholder="اسم العملية أو الحملة"
                value={formData.name || ""}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                className="w-full rounded-xl border border-outline-variant/50 px-3 py-2 outline-none focus:border-primary"
              />
              <select
                value={formData.type || ""}
                onChange={(event) =>
                  setFormData({ ...formData, type: event.target.value })
                }
                className="w-full rounded-xl border border-outline-variant/50 px-3 py-2 outline-none focus:border-primary"
              >
                <option value="حملة توزيع إطعام">حملة توزيع إطعام</option>
                <option value="قافلة طبية">قافلة طبية</option>
                <option value="سكن كريم">سكن كريم</option>
                <option value="تدخل تعليمي">تدخل تعليمي</option>
              </select>
              <input
                type="date"
                value={formData.executionDate || ""}
                onChange={(event) =>
                  setFormData({ ...formData, executionDate: event.target.value })
                }
                className="w-full rounded-xl border border-outline-variant/50 px-3 py-2 outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  placeholder="المستهدف"
                  value={formData.target || 0}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      target: Number(event.target.value) || 0,
                    })
                  }
                  className="w-1/2 rounded-xl border border-outline-variant/50 px-3 py-2 outline-none focus:border-primary"
                />
                <input
                  required
                  type="number"
                  placeholder="عدد المتطوعين"
                  value={formData.volunteers || 0}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      volunteers: Number(event.target.value) || 0,
                    })
                  }
                  className="w-1/2 rounded-xl border border-outline-variant/50 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "جارٍ الحفظ..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-surface-container-highest py-3 font-bold text-on-surface"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
