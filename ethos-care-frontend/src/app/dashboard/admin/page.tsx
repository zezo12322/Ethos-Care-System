"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CASE_WORKER', status: 'نشط' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(res => {
      setUsers(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'CASE_WORKER', status: 'نشط' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة المستخدم");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

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
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-container transition-colors">
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
                  <th className="px-6 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
                {loading ? (
                  <tr><td colSpan={4} className="p-6 text-center text-outline">جارٍ التحميل...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-outline">لا يوجد مستخدمون</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-lowest/50">
                      <td className="px-6 py-4 font-bold">{user.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant" dir="ltr">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-surface-container-high rounded text-xs font-bold">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 text-center flex justify-center gap-2">
                        <button onClick={() => handleDeleteUser(user.id)} className="w-8 h-8 rounded-full hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl leading-relaxed">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">إضافة مستخدم جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">الاسم بالكامل</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none text-left focus:border-primary" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">كلمة المرور</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none text-left focus:border-primary" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">الدور / الصلاحية</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary">
                  <option value="SYSTEM_ADMIN">مسؤول النظام</option>
                  <option value="SUPERVISOR">مشرف</option>
                  <option value="CASE_WORKER">باحث اجتماعي</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">حفظ المستخدم</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold hover:bg-surface-container-high transition-colors">إلغاء</button>
              </div>
            </form>
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
                  <input type="text" defaultValue="جمعية أجيال صناع الحياة ببني سويف" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2.5 px-3 outline-none" />
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
