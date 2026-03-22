"use client";

import React, { useState } from "react";

const users = [
  { id: 1, name: "أحمد محمد", role: "مسؤول النظام", email: "admin@lifemakers.org", status: "نشط" },
  { id: 2, name: "سارة محمود", role: "باحث اجتماعي", email: "s.mahmoud@lifemakers.org", status: "نشط" },
  { id: 3, name: "كريم حسن", role: "متطوع (قائد فريق)", email: "k.hassan@lifemakers.org", status: "غير نشط" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">الإدارة والتحكم</h1>
          <p className="text-on-surface-variant mt-1 text-sm">إدارة حسابات المستخدمين والصلاحيات وإعدادات النظام الأساسية</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-outline-variant/30 pb-px">
        <button onClick={() => setActiveTab("users")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>المستخدمين</button>
        <button onClick={() => setActiveTab("roles")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>الصلاحيات</button>
        <button onClick={() => setActiveTab("settings")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>إعدادات النظام</button>
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-[0px_8px_24px_-8px_rgba(0,40,38,0.04)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="font-bold text-lg">قائمة المستخدمين</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              مستخدم جديد
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-sm font-bold">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">الدور</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest/50">
                    <td className="px-6 py-4 font-bold">{user.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant" dir="ltr">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-surface-container-high rounded text-xs font-bold">{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="w-8 h-8 rounded-full hover:bg-primary/10 text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30">
            <h3 className="font-bold text-lg mb-4">إعدادات المنظمة الأساسية</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold mb-2">اسم المنظمة / الفرع</label>
                  <input type="text" defaultValue="جمعية صناع الحياة مصر - فرع بني سويف" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2.5 px-3 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-2">الشعار</label>
                  <input type="file" className="w-full text-sm" />
               </div>
               <button className="w-full py-2 bg-primary text-white rounded-xl font-bold">حفظ التعديلات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
