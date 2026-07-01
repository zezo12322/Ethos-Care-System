"use client";

import React, { useEffect, useState } from "react";
import { usersService } from "@/services/users.service";
import { AppUser } from "@/types/api";
import { useToast } from "@/components/ui/Toast";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير النظام",
  CEO: "المدير التنفيذي",
  MANAGER: "مسؤول إدارة الحالة",
  CASE_WORKER: "باحث",
  EXECUTION_OFFICER: "مسؤول التنفيذ",
  CALL_CENTER: "خدمة المستفيدين",
};

const inputClass =
  "w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary";

export default function ProfilePage() {
  const { toast } = useToast();
  const [me, setMe] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    usersService
      .getMe()
      .then((data) => {
        if (active) {
          setMe(data);
          setName(data.name);
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) toast("تعذّر تحميل بيانات الحساب.", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const saveName = async () => {
    if (!name.trim()) {
      toast("يرجى إدخال الاسم.", "warning");
      return;
    }
    try {
      setSavingName(true);
      const updated = await usersService.updateProfile({ name: name.trim() });
      setMe(updated);
      toast("تم تحديث الاسم. سيظهر بالكامل بعد إعادة تسجيل الدخول.", "success");
    } catch (error) {
      console.error(error);
      toast("تعذّر تحديث الاسم.", "error");
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast("يرجى إدخال كلمة المرور الحالية والجديدة.", "warning");
      return;
    }
    if (newPassword.length < 6) {
      toast("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("كلمة المرور الجديدة وتأكيدها غير متطابقين.", "warning");
      return;
    }
    try {
      setSavingPassword(true);
      await usersService.updateProfile({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("تم تغيير كلمة المرور بنجاح.", "success");
    } catch (error) {
      const message = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;
      toast(message ?? "تعذّر تغيير كلمة المرور.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-outline-variant/30 bg-white px-6 py-5 shadow-sm">
        <h1 className="text-3xl font-bold text-on-surface">الملف الشخصي</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          إدارة بياناتك الشخصية وكلمة المرور.
        </p>
      </div>

      {/* بطاقة الحساب */}
      <div className="flex items-center gap-4 rounded-3xl border border-outline-variant/30 bg-white px-6 py-5 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {me?.name?.trim()?.charAt(0) ?? "؟"}
        </div>
        <div>
          <p className="text-lg font-bold text-on-surface">{me?.name}</p>
          <p className="text-sm text-on-surface-variant" dir="ltr">
            {me?.email}
          </p>
          <span className="mt-1 inline-block rounded-full bg-surface-container px-3 py-0.5 text-xs font-bold text-on-surface-variant">
            {ROLE_LABELS[me?.role ?? ""] ?? me?.role}
          </span>
        </div>
      </div>

      {/* تعديل الاسم */}
      <div className="rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-on-surface">البيانات الأساسية</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-bold text-on-surface">الاسم</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-on-surface">
              البريد الإلكتروني
            </span>
            <input value={me?.email ?? ""} disabled dir="ltr" className={`${inputClass} bg-surface-container-low text-on-surface-variant`} />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveName}
            disabled={savingName}
            className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {savingName ? "جارٍ الحفظ..." : "حفظ الاسم"}
          </button>
        </div>
      </div>

      {/* تغيير كلمة المرور */}
      <div className="rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-on-surface">تغيير كلمة المرور</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="mb-1 block text-sm font-bold text-on-surface">الحالية</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-on-surface">الجديدة</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold text-on-surface">تأكيد الجديدة</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={savePassword}
            disabled={savingPassword}
            className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {savingPassword ? "جارٍ الحفظ..." : "تغيير كلمة المرور"}
          </button>
        </div>
      </div>
    </div>
  );
}
