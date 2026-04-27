"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  usersService,
  type UpdateUserPayload,
} from "@/services/users.service";
import { APP_ROLES, AppRole, AppUser } from "@/types/api";
import { FormEvent, useEffect, useMemo, useState } from "react";

const roleLabels: Record<AppRole, string> = {
  ADMIN: "مدير النظام",
  CEO: "المدير التنفيذي",
  MANAGER: "مسؤول إدارة الحالة",
  CASE_WORKER: "باحث اجتماعي",
  DATA_ENTRY: "مدخل بيانات",
  EXECUTION_OFFICER: "مسؤول التنفيذ",
  CALL_CENTER: "موظف كول سنتر",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "CASE_WORKER" as AppRole,
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const canOpenAdminPage = user?.role === "ADMIN" || user?.role === "CEO";
  const canManageAdmins = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (authLoading || !canOpenAdminPage) {
      setLoading(false);
      return;
    }

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
  }, [authLoading, canOpenAdminPage, reloadKey]);

  const refreshUsers = () => setReloadKey((current) => current + 1);

  const availableRoles = useMemo(
    () => APP_ROLES.filter((role) => canManageAdmins || role !== "ADMIN"),
    [canManageAdmins],
  );

  const resetModal = () => {
    setEditingUserId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setError("");
    setFeedback("");
    setEditingUserId(null);
    setFormData({
      ...emptyForm,
      role: availableRoles.includes("CASE_WORKER")
        ? "CASE_WORKER"
        : (availableRoles[0] ?? "CASE_WORKER"),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (selectedUser: AppUser) => {
    setError("");
    setFeedback("");
    setEditingUserId(selectedUser.id);
    setFormData({
      name: selectedUser.name,
      email: selectedUser.email,
      password: "",
      role:
        canManageAdmins || selectedUser.role !== "ADMIN"
          ? selectedUser.role
          : "CEO",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    try {
      if (editingUserId) {
        const payload: UpdateUserPayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        await usersService.update(editingUserId, payload);
        setFeedback("تم تحديث المستخدم بنجاح.");
      } else {
        await usersService.create(formData);
        setFeedback("تم إنشاء المستخدم بنجاح.");
      }

      resetModal();
      refreshUsers();
    } catch (submitError) {
      console.error(submitError);
      setError(
        editingUserId
          ? "تعذر تحديث المستخدم الآن."
          : "حدث خطأ أثناء إضافة المستخدم.",
      );
    }
  };

  const handleDeleteUser = async (selectedUser: AppUser) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      return;
    }

    setError("");
    setFeedback("");

    try {
      await usersService.remove(selectedUser.id);
      setFeedback("تم حذف المستخدم بنجاح.");
      refreshUsers();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف المستخدم الآن.");
    }
  };

  const canEditUser = (selectedUser: AppUser) => {
    if (!user) {
      return false;
    }

    if (selectedUser.id === user.id) {
      return false;
    }

    if (canManageAdmins) {
      return true;
    }

    return selectedUser.role !== "ADMIN";
  };

  if (authLoading) {
    return <div className="text-sm text-on-surface-variant">جارٍ التحقق من الصلاحيات...</div>;
  }

  if (!canOpenAdminPage) {
    return (
      <div className="rounded-3xl border border-outline-variant/30 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-on-surface">الإدارة والتحكم</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          هذه الصفحة متاحة فقط لمدير النظام والمدير التنفيذي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            {user?.role === "CEO" ? "الإدارة التنفيذية" : "الإدارة والتحكم"}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {user?.role === "CEO"
              ? "إدارة تنفيذية للحسابات غير الإدارية مع صلاحيات مباشرة على المحتوى والشركاء."
              : "إدارة كاملة للحسابات والأدوار والإعدادات الداخلية."}
          </p>
        </div>
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

      <div className="flex gap-2 border-b border-outline-variant/30 pb-px">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 text-sm font-bold transition-colors ${
            activeTab === "users"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          المستخدمون
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-6 py-3 text-sm font-bold transition-colors ${
            activeTab === "roles"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          الأدوار
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 text-sm font-bold transition-colors ${
            activeTab === "settings"
              ? "border-b-2 border-primary text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          الإعدادات
        </button>
      </div>

      {activeTab === "users" ? (
        <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white">
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">قائمة المستخدمين</h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                {canManageAdmins
                  ? "يمكنك إدارة جميع الحسابات."
                  : "يمكنك إدارة كل الحسابات ما عدا مدير النظام."}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white"
            >
              مستخدم جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-surface-container-lowest text-sm font-bold text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">الدور</th>
                  <th className="px-6 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      جارٍ التحميل...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                      لا يوجد مستخدمون.
                    </td>
                  </tr>
                ) : (
                  users.map((listedUser) => {
                    const editable = canEditUser(listedUser);

                    return (
                      <tr key={listedUser.id}>
                        <td className="px-6 py-4 font-bold text-on-surface">
                          {listedUser.name}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant" dir="ltr">
                          {listedUser.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface">
                            {roleLabels[listedUser.role] || listedUser.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {editable ? (
                              <>
                                <button
                                  onClick={() => openEditModal(listedUser)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-tertiary hover:bg-tertiary/10"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(listedUser)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-error hover:bg-error/10"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    delete
                                  </span>
                                </button>
                              </>
                            ) : (
                              <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-bold text-on-surface-variant">
                                للعرض فقط
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "roles" ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {APP_ROLES.map((role) => (
            <div
              key={role}
              className="rounded-3xl border border-outline-variant/30 bg-white p-6"
            >
              <p className="mb-2 text-xs text-on-surface-variant">{role}</p>
              <h3 className="mb-3 text-xl font-bold font-headline text-on-surface">
                {roleLabels[role]}
              </h3>
              <p className="text-sm leading-7 text-on-surface-variant">
                {role === "CEO"
                  ? "يملك صلاحيات تنفيذية على الشركاء، الأخبار، واعتماد الحالات، إضافة إلى إدارة الحسابات غير الإدارية."
                  : role === "ADMIN"
                    ? "صلاحية شاملة على جميع الوحدات والحسابات والإعدادات."
                    : "صلاحية تشغيلية مرتبطة بالدور الفعلي داخل النظام."}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-outline-variant/30 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-on-surface">
              إعدادات النظام الأساسية
            </h3>
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
                <p className="mb-1 text-on-surface-variant">اسم الفرع</p>
                <p className="font-bold text-on-surface">
                  جمعية أجيال صناع الحياة ببني سويف
                </p>
              </div>
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4">
                <p className="mb-1 text-on-surface-variant">سياسة الإدارة التنفيذية</p>
                <p className="font-bold text-on-surface">
                  المدير التنفيذي يدير المحتوى والشركاء والحسابات التشغيلية، بينما يبقى
                  إنشاء ومدّ صلاحية مدير النظام بيد `ADMIN` فقط.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-on-surface">
                {editingUserId ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </h3>
              <button
                type="button"
                onClick={resetModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-on-surface">
                  الاسم بالكامل
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-on-surface">
                  البريد الإلكتروني
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 text-left outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-on-surface">
                  كلمة المرور
                </label>
                <input
                  required={!editingUserId}
                  minLength={6}
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData({ ...formData, password: event.target.value })
                  }
                  placeholder={editingUserId ? "اتركها فارغة إن لم تتغير" : ""}
                  className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 text-left outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-on-surface">
                  الدور / الصلاحية
                </label>
                <select
                  value={formData.role}
                  onChange={(event) =>
                    setFormData({ ...formData, role: event.target.value as AppRole })
                  }
                  className="w-full rounded-2xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white"
                >
                  {editingUserId ? "حفظ التعديلات" : "حفظ المستخدم"}
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
