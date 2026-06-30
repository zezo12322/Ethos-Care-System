"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  volunteersService,
  CreateVolunteerDto,
  AssignVolunteerDto,
} from "@/services/volunteers.service";
import { operationsService } from "@/services/operations.service";
import { VolunteerRecord, OperationRecord } from "@/types/api";
import { useToast } from "@/components/ui/Toast";

const STATUS_META: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "قيد المراجعة", badge: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "نشط", badge: "bg-emerald-100 text-emerald-700" },
  INACTIVE: { label: "موقوف", badge: "bg-slate-200 text-slate-600" },
  REJECTED: { label: "مرفوض", badge: "bg-red-100 text-red-700" },
};

const STATUS_FILTERS = [
  { value: "", label: "كل الحالات" },
  { value: "PENDING", label: "قيد المراجعة" },
  { value: "ACTIVE", label: "نشط" },
  { value: "INACTIVE", label: "موقوف" },
  { value: "REJECTED", label: "مرفوض" },
];

interface VolunteerFormState {
  id?: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  preferredArea: string;
  skills: string;
  status: string;
  notes: string;
}

const emptyForm: VolunteerFormState = {
  name: "",
  phone: "",
  email: "",
  age: "",
  preferredArea: "",
  skills: "",
  status: "PENDING",
  notes: "",
};

interface AssignFormState {
  operationId: string;
  role: string;
  hours: string;
  attended: boolean;
  notes: string;
}

const emptyAssign: AssignFormState = {
  operationId: "",
  role: "",
  hours: "0",
  attended: false,
  notes: "",
};

const inputClass =
  "w-full rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary";

export default function VolunteersPage() {
  const { toast } = useToast();

  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<VolunteerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [assignFor, setAssignFor] = useState<VolunteerRecord | null>(null);
  const [assignForm, setAssignForm] = useState<AssignFormState>(emptyAssign);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await volunteersService.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setVolunteers(rows);
    } catch (error) {
      console.error(error);
      toast("تعذّر تحميل بيانات المتطوعين.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    operationsService
      .getAll()
      .then(setOperations)
      .catch((error) => console.error(error));
  }, []);

  const stats = useMemo(() => {
    const total = volunteers.length;
    const pending = volunteers.filter((v) => v.status === "PENDING").length;
    const active = volunteers.filter((v) => v.status === "ACTIVE").length;
    const hours = volunteers.reduce((sum, v) => sum + (v.totalHours ?? 0), 0);
    return { total, pending, active, hours };
  }, [volunteers]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (v: VolunteerRecord) => {
    setForm({
      id: v.id,
      name: v.name,
      phone: v.phone ?? "",
      email: v.email ?? "",
      age: v.age != null ? String(v.age) : "",
      preferredArea: v.preferredArea ?? "",
      skills: v.skills ?? "",
      status: v.status,
      notes: v.notes ?? "",
    });
    setFormOpen(true);
  };

  const saveVolunteer = async () => {
    if (!form.name.trim()) {
      toast("يرجى إدخال اسم المتطوع.", "warning");
      return;
    }
    const payload: CreateVolunteerDto = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      age: form.age ? Number(form.age) : undefined,
      preferredArea: form.preferredArea.trim() || undefined,
      skills: form.skills.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };
    try {
      setSaving(true);
      if (form.id) {
        await volunteersService.update(form.id, payload);
        toast("تم تحديث بيانات المتطوع.", "success");
      } else {
        await volunteersService.create(payload);
        toast("تمت إضافة المتطوع.", "success");
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      console.error(error);
      toast("تعذّر حفظ بيانات المتطوع.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (v: VolunteerRecord, status: string) => {
    try {
      await volunteersService.setStatus(v.id, status);
      toast("تم تحديث حالة المتطوع.", "success");
      await load();
    } catch (error) {
      console.error(error);
      toast("تعذّر تحديث الحالة.", "error");
    }
  };

  const removeVolunteer = async (v: VolunteerRecord) => {
    if (!confirm(`هل أنت متأكد من حذف المتطوع "${v.name}"؟`)) {
      return;
    }
    try {
      await volunteersService.remove(v.id);
      toast("تم حذف المتطوع.", "success");
      await load();
    } catch (error) {
      console.error(error);
      toast("تعذّر حذف المتطوع.", "error");
    }
  };

  const openAssign = (v: VolunteerRecord) => {
    setAssignForm(emptyAssign);
    setAssignFor(v);
  };

  const saveAssignment = async () => {
    if (!assignFor) return;
    if (!assignForm.operationId) {
      toast("يرجى اختيار النشاط / الحملة.", "warning");
      return;
    }
    const payload: AssignVolunteerDto = {
      operationId: assignForm.operationId,
      role: assignForm.role.trim() || undefined,
      attended: assignForm.attended,
      hours: assignForm.hours ? Number(assignForm.hours) : 0,
      notes: assignForm.notes.trim() || undefined,
    };
    try {
      await volunteersService.assign(assignFor.id, payload);
      toast("تم إسناد المتطوع للنشاط.", "success");
      setAssignFor(null);
      await load();
    } catch (error) {
      console.error(error);
      toast("تعذّر إسناد المتطوع.", "error");
    }
  };

  const toggleAttendance = async (
    assignmentId: string,
    attended: boolean,
  ) => {
    try {
      await volunteersService.updateAssignment(assignmentId, { attended });
      await load();
    } catch (error) {
      console.error(error);
      toast("تعذّر تحديث الحضور.", "error");
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      await volunteersService.removeAssignment(assignmentId);
      toast("تم إلغاء الإسناد.", "success");
      await load();
    } catch (error) {
      console.error(error);
      toast("تعذّر إلغاء الإسناد.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[28px] border border-outline-variant/30 bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">إدارة المتطوعين</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            مراجعة طلبات التطوع، اعتماد المتطوعين، وإسنادهم للأنشطة وتسجيل ساعات
            التطوع.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            person_add
          </span>
          إضافة متطوع
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "إجمالي المتطوعين", value: stats.total, icon: "groups" },
          { label: "قيد المراجعة", value: stats.pending, icon: "hourglass_top" },
          { label: "النشطون", value: stats.active, icon: "verified" },
          { label: "إجمالي ساعات التطوع", value: stats.hours, icon: "schedule" },
        ].map((card) => (
          <div
            key={card.label}
            className="flex items-center justify-between rounded-3xl border border-outline-variant/30 bg-white px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-xs text-on-surface-variant">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">
                {card.value}
              </p>
            </div>
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              {card.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-3xl border border-outline-variant/30 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو المجال أو المهارات..."
            className={`${inputClass} pr-11`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-outline-variant/50 bg-white py-3 px-4 text-sm outline-none focus:border-primary sm:w-52"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-on-surface-variant">
            جارٍ التحميل...
          </div>
        ) : volunteers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-on-surface-variant">
            لا يوجد متطوعون مطابقون.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {volunteers.map((v) => {
              const meta = STATUS_META[v.status] ?? {
                label: v.status,
                badge: "bg-slate-200 text-slate-600",
              };
              return (
                <div key={v.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-on-surface">
                          {v.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                        {v.source === "PUBLIC_FORM" ? (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            طلب من الموقع
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-surface-variant">
                        {v.phone ? <span>📞 {v.phone}</span> : null}
                        {v.preferredArea ? <span>المجال: {v.preferredArea}</span> : null}
                        {v.age ? <span>السن: {v.age}</span> : null}
                        <span>ساعات: {v.totalHours}</span>
                        <span>الأنشطة: {v.assignmentsCount}</span>
                      </div>
                      {v.skills ? (
                        <p className="mt-1 text-xs text-on-surface-variant">
                          المهارات: {v.skills}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {v.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => changeStatus(v, "ACTIVE")}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            قبول
                          </button>
                          <button
                            type="button"
                            onClick={() => changeStatus(v, "REJECTED")}
                            className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200"
                          >
                            رفض
                          </button>
                        </>
                      ) : v.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => changeStatus(v, "INACTIVE")}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                        >
                          إيقاف
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => changeStatus(v, "ACTIVE")}
                          className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
                        >
                          تفعيل
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openAssign(v)}
                        className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                      >
                        إسناد لنشاط
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        aria-label="تعديل"
                        className="rounded-xl bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVolunteer(v)}
                        aria-label="حذف"
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  {/* Assignments */}
                  {v.assignments.length > 0 ? (
                    <div className="mt-3 space-y-2 rounded-2xl bg-surface-container-lowest/60 p-3">
                      {v.assignments.map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-bold text-on-surface">
                              {a.operation?.name ?? "نشاط"}
                            </span>
                            {a.role ? (
                              <span className="text-on-surface-variant">
                                الدور: {a.role}
                              </span>
                            ) : null}
                            <span className="text-on-surface-variant">
                              {a.hours} ساعة
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs text-on-surface-variant">
                              <input
                                type="checkbox"
                                checked={a.attended}
                                onChange={(e) =>
                                  toggleAttendance(a.id, e.target.checked)
                                }
                                className="h-4 w-4 accent-primary"
                              />
                              حضر
                            </label>
                            <button
                              type="button"
                              onClick={() => removeAssignment(a.id)}
                              className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Volunteer form modal */}
      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-on-surface">
              {form.id ? "تعديل بيانات المتطوع" : "إضافة متطوع"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  الاسم *
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  رقم الهاتف
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  البريد الإلكتروني
                </span>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  السن
                </span>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  مجال التطوع المفضل
                </span>
                <input
                  value={form.preferredArea}
                  onChange={(e) =>
                    setForm({ ...form, preferredArea: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  المهارات / الاهتمامات
                </span>
                <input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  الحالة
                </span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass}
                >
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  ملاحظات
                </span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-2xl px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveVolunteer}
                className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Assignment modal */}
      {assignFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-xl font-bold text-on-surface">
              إسناد متطوع لنشاط
            </h2>
            <p className="mb-4 text-sm text-on-surface-variant">{assignFor.name}</p>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  النشاط / الحملة *
                </span>
                <select
                  value={assignForm.operationId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, operationId: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">اختر النشاط</option>
                  {operations.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  الدور
                </span>
                <input
                  value={assignForm.role}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, role: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-on-surface">
                  عدد الساعات
                </span>
                <input
                  type="number"
                  value={assignForm.hours}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, hours: e.target.value })
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
                <input
                  type="checkbox"
                  checked={assignForm.attended}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, attended: e.target.checked })
                  }
                  className="h-4 w-4 accent-primary"
                />
                حضر النشاط
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAssignFor(null)}
                className="rounded-2xl px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={saveAssignment}
                className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
              >
                إسناد
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
