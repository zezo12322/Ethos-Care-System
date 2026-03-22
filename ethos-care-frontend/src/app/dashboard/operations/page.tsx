"use client";

import React, { useState, useEffect } from "react";
import { operationsService } from "@/services/operations.service";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [operations, setOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const data = await operationsService.getAll();
        setOperations(data);
      } catch (error) {
        console.error("Failed to fetch operations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOperations();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "جاري": return "bg-blue-100 text-blue-800 border-blue-200";
      case "مكتمل": return "bg-green-100 text-green-800 border-green-200";
      case "تجهيز": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">العمليات والحملات</h1>
          <p className="text-on-surface-variant mt-1 text-sm">إدارة الحملات التطوعية، قوافل الخير، وعمليات التوزيع</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold text-sm transition-all shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">add</span>
          إنشاء عملية جديدة
        </button>
      </div>

      <div className="flex gap-2 border-b border-outline-variant/30 pb-px">
        <button onClick={() => setActiveTab("all")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>كل العمليات</button>
        <button onClick={() => setActiveTab("active")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>الجارية</button>
        <button onClick={() => setActiveTab("completed")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>المكتملة</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant">جارٍ تحميل البيانات...</div>
        ) : operations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-on-surface-variant">لا توجد عمليات مسجلة</div>
        ) : (
          operations.filter(op => activeTab === 'all' || (activeTab === 'active' && op.status !== 'مكتمل') || (activeTab === 'completed' && op.status === 'مكتمل')).map((op) => (
          <div key={op.id} className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-[0px_4px_16px_-4px_rgba(0,40,38,0.04)] hover:shadow-lg transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(op.status)}`}>
                {op.status}
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                {op.type.includes('توزيع') && <span className="material-symbols-outlined">inventory_2</span>}
                {op.type.includes('تعليم') && <span className="material-symbols-outlined">school</span>}
                {op.type.includes('صحي') && <span className="material-symbols-outlined">medical_services</span>}
                {op.type.includes('اجتماعي') && <span className="material-symbols-outlined">volunteer_activism</span>}
              </div>
            </div>
            
            <h3 className="text-xl font-bold font-headline mb-1 text-on-surface">{op.name}</h3>
            <p className="text-sm text-on-surface-variant mb-6">{op.type} • التنفيذ: {op.date}</p>
            
            <div className="mt-auto space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">نسبة الإنجاز</span>
                  <span className="text-primary">{op.progress}%</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${op.progress}%` }}></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-outline-variant/20">
                <div>
                  <p className="text-xs text-on-surface-variant">المستهدف</p>
                  <p className="font-bold text-lg"><span className="text-primary">{op.achieved}</span> / {op.target}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">فريق التطوع</p>
                  <p className="font-bold text-lg">{op.volunteers} متطوع</p>
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
