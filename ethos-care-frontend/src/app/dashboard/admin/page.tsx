"use client";

import { APP_ROLES, AppRole, AppUser } from "@/types/api";
import { usersService } from "@/services/users.service";
import { FormEvent, useEffect, useState } from "react";

const roleLabels: Record<AppRole, string> = {
  ADMIN: "مدير النظام",
  CEO: "المدير التنفيذي",
  MANAGER: "مدير البرامج",
  CASE_WORKER: "باحث اجتماعي",
  DATA_ENTRY: "مدخل بيانات",
  EXECUTION_OFFICER: "مسؤول التنفيذ",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "CASE_WORKER" as AppRole,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await usersService.getAll();
        if (active) {
          setUsers(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("تعذر تحميل المستخدمين الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const refreshUsers = () => setReloadKey((current) => current + 1);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    try {
      await usersService.create(formData);
      setIsModalOpen(false);
      setFormData(emptyForm);
      setFeedback("تم إنشاء المستخدم بنجاح.");
      refreshUsers();
    } catch (createError) {
      console.error(createError);
      setError("حدث خطأ أثناء إضافة المستخدم.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      return;
    }

    setError("");
    setFeedback("");

    try {
      await usersService.remove(id);
      setFeedback("تم حذف المستخدم بنجاح.");
      refreshUsers();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف المستخدم الآن.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">الإدارة والتحكم</h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            إدارة حسابات المستخدمين وتوحيد الأدوار الداخلية حسب الصلاحيات الفعلية في النظام.
          </p>
        </div>
      </div>

      {(error || feedback) && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${error ? "border border-error/20 bg-error/5 text-error" : "border border-green-200 bg-green-50 text-green-800"}`}>
          {error || feedback}
        </div>
      )}

      <div className="flex gap-2 border-b border-outline-variant/30 pb-px">
        <button onClick={() => setActiveTab("users")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "users" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>المستخدمون</button>
        <button onClick={() => setActiveTab("roles")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "roles" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>الأدوار</button>
        <button onClick={() => setActiveTab("settings")} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>الإعدادات</button>
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-[0px_8px_24px_-8px_rgba(0,40,38,0.04)] overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="font-bold text-lg">قائمة المستخدمين</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-container transition-colors"
            >
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
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-outline">جارٍ التحميل...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-outline">لا يوجد مستخدمون</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-lowest/50">
                      <td className="px-6 py-4 font-bold">{user.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant" dir="ltr">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-surface-container-high rounded text-xs font-bold">
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {APP_ROLES.map((role) => (
            <div key={role} className="bg-white rounded-2xl border border-outline-variant/30 p-6">
              <p className="text-xs text-on-surface-variant mb-2">{role}</p>
              <h3 className="text-xl font-bold font-headline mb-3">{roleLabels[role]}</h3>
              <p className="text-sm text-on-surface-variant leading-7">
                هذا الدور متوافق الآن مع أدوار الباك إند والـ guards بدل المسميات القديمة غير المدعومة.
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30">
            <h3 className="font-bold text-lg mb-4">إعدادات النظام الأساسية</h3>
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4">
                <p className="text-on-surface-variant mb-1">اسم الفرع</p>
                <p className="font-bold">جمعية أجيال صناع الحياة ببني سويف</p>
              </div>
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4">
                <p className="text-on-surface-variant mb-1">ملاحظة</p>
                <p className="font-bold">
                  ما زالت إعدادات الهوية العامة غير مربوطة بواجهة حفظ مستقلة، لذلك تم تركها كعرض معلوماتي فقط.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl leading-relaxed">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">إضافة مستخدم جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">الاسم بالكامل</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none text-left focus:border-primary"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">كلمة المرور</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none text-left focus:border-primary"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">الدور / الصلاحية</label>
                <select
                  value={formData.role}
                  onChange={(event) => setFormData({ ...formData, role: event.target.value as AppRole })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
                >
                  {APP_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-container transition-colors">
                  حفظ المستخدم
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold hover:bg-surface-container-high transition-colors">
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
