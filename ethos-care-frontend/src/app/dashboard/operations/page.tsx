"use client";

import { CreateOperationDto, operationsService } from "@/services/operations.service";
import { OperationRecord } from "@/types/api";
import { FormEvent, useEffect, useState } from "react";

const initialFormData: CreateOperationDto = {
  name: "",
  type: "حملة توزيع إطعام",
  target: 100,
  volunteers: 10,
  executionDate: new Date().toISOString().slice(0, 10),
};

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateOperationDto>(initialFormData);

  useEffect(() => {
    let active = true;

    const loadOperations = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await operationsService.getAll();
        if (active) {
          setOperations(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("تعذر تحميل العمليات الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOperations();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refreshOperations = () => setReloadKey((current) => current + 1);

  const handleCreateOperation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await operationsService.create(formData);
      setIsModalOpen(false);
      setFormData(initialFormData);
      refreshOperations();
    } catch (createError) {
      console.error(createError);
      setError("حدث خطأ أثناء إنشاء العملية.");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">العمليات والحملات</h1>
          <p className="text-on-surface-variant mt-1 text-sm">إدارة الحملات التطوعية، قوافل الخير، وعمليات التوزيع</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">add</span>
          إنشاء عملية جديدة
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-outline-variant/30 pb-px">
        <button onClick={() => setActiveTab("all")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>كل العمليات</button>
        <button onClick={() => setActiveTab("active")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "active" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>الجارية</button>
        <button onClick={() => setActiveTab("completed")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "completed" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>المكتملة</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant">جارٍ تحميل البيانات...</div>
        ) : filteredOperations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant">لا توجد عمليات مسجلة</div>
        ) : (
          filteredOperations.map((operation) => (
            <div key={operation.id} className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-[0px_4px_16px_-4px_rgba(0,40,38,0.04)] hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(operation.status)}`}>
                  {operation.status}
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  {operation.type?.includes("توزيع") && <span className="material-symbols-outlined">inventory_2</span>}
                  {operation.type?.includes("تعليم") && <span className="material-symbols-outlined">school</span>}
                  {operation.type?.includes("صحي") && <span className="material-symbols-outlined">medical_services</span>}
                  {!operation.type?.includes("توزيع") && !operation.type?.includes("تعليم") && !operation.type?.includes("صحي") && (
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold font-headline mb-1 text-on-surface">{operation.name}</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                {operation.type} • التنفيذ: {new Date(operation.date).toLocaleDateString("ar-EG")}
              </p>

              <div className="mt-auto space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-on-surface-variant">نسبة الإنجاز</span>
                    <span className="text-primary">{operation.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${operation.progress || 0}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant/20">
                  <div>
                    <p className="text-xs text-on-surface-variant">المستهدف</p>
                    <p className="font-bold text-lg"><span className="text-primary">{operation.achieved || 0}</span> / {operation.target}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">فريق التطوع</p>
                    <p className="font-bold text-lg">{operation.volunteers || 0} متطوع</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl leading-relaxed text-right">
            <h3 className="text-xl font-bold mb-4">إنشاء عملية/حملة جديدة</h3>
            <form onSubmit={handleCreateOperation} className="space-y-4">
              <input
                required
                type="text"
                placeholder="اسم العملية أو الحملة"
                value={formData.name || ""}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <select
                value={formData.type || ""}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              >
                <option value="حملة توزيع إطعام">حملة توزيع إطعام</option>
                <option value="قافلة طبية">قافلة طبية</option>
                <option value="سكن كريم">سكن كريم</option>
                <option value="تدخل تعليمي">تدخل تعليمي</option>
              </select>
              <input
                type="date"
                value={formData.executionDate || ""}
                onChange={(event) => setFormData({ ...formData, executionDate: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  placeholder="المستهدف"
                  value={formData.target || 0}
                  onChange={(event) => setFormData({ ...formData, target: Number(event.target.value) || 0 })}
                  className="w-1/2 border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
                />
                <input
                  required
                  type="number"
                  placeholder="عدد المتطوعين"
                  value={formData.volunteers || 0}
                  onChange={(event) => setFormData({ ...formData, volunteers: Number(event.target.value) || 0 })}
                  className="w-1/2 border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
