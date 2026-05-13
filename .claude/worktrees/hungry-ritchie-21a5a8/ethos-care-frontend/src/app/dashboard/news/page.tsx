"use client";

import { useAuth } from "@/contexts/AuthContext";
import { newsService } from "@/services/news.service";
import { NewsRecord } from "@/types/api";
import { FormEvent, useEffect, useState } from "react";

const emptyForm = {
  title: "",
  category: "فعاليات",
  content: "",
  image: "",
  published: true,
};

export default function NewsPage() {
  const { user, loading: authLoading } = useAuth();
  const canManageNews = user?.role === "ADMIN" || user?.role === "CEO";

  const [news, setNews] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (authLoading || !canManageNews) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadNews = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await newsService.getAllForAdmin();
        if (active) {
          setNews(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setError("تعذر تحميل الأخبار الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadNews();

    return () => {
      active = false;
    };
  }, [authLoading, canManageNews, reloadKey]);

  const refreshNews = () => setReloadKey((current) => current + 1);

  const resetModal = () => {
    setEditingNewsId(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setError("");
    setFeedback("");
    setEditingNewsId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsRecord) => {
    setError("");
    setFeedback("");
    setEditingNewsId(item.id);
    setFormData({
      title: item.title,
      category: item.category || "فعاليات",
      content: item.content,
      image: item.image || "",
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFeedback("");

    const payload = {
      ...formData,
      image: formData.image.trim() || undefined,
    };

    try {
      if (editingNewsId) {
        await newsService.update(editingNewsId, payload);
        setFeedback("تم تحديث الخبر بنجاح.");
      } else {
        await newsService.create(payload);
        setFeedback("تم إنشاء الخبر بنجاح.");
      }

      resetModal();
      refreshNews();
    } catch (submitError) {
      console.error(submitError);
      setError(
        editingNewsId ? "تعذر تحديث الخبر الآن." : "تعذر إنشاء الخبر الآن.",
      );
    }
  };

  const handleDeleteNewsItem = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا الخبر؟")) {
      return;
    }

    setError("");
    setFeedback("");

    try {
      await newsService.remove(id);
      setFeedback("تم حذف الخبر بنجاح.");
      refreshNews();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف الخبر الآن.");
    }
  };

  const handleTogglePublish = async (item: NewsRecord) => {
    setError("");
    setFeedback("");

    try {
      await newsService.update(item.id, {
        title: item.title,
        content: item.content,
        category: item.category,
        image: item.image || undefined,
        published: !item.published,
      });
      setFeedback(item.published ? "تم تحويل الخبر إلى مسودة." : "تم نشر الخبر.");
      refreshNews();
    } catch (toggleError) {
      console.error(toggleError);
      setError("تعذر تحديث حالة النشر الآن.");
    }
  };

  if (authLoading) {
    return <div className="text-sm text-on-surface-variant">جارٍ التحقق من الصلاحيات...</div>;
  }

  if (!canManageNews) {
    return (
      <div className="rounded-3xl border border-outline-variant/30 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-on-surface">إدارة الأخبار</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          هذه الصفحة متاحة فقط لمدير النظام والمدير التنفيذي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            إدارة الأخبار
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            صلاحية تنفيذية مباشرة لكتابة الأخبار، تعديلها، ونشرها أو إبقائها كمسودة.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          خبر جديد
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
          <div className="text-sm text-on-surface-variant">إجمالي الأخبار</div>
          <div className="mt-2 text-3xl font-bold text-on-surface">{news.length}</div>
        </div>
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">المنشور</div>
          <div className="mt-2 text-3xl font-bold text-success">
            {news.filter((item) => item.published).length}
          </div>
        </div>
        <div className="rounded-3xl border border-outline-variant/20 bg-white p-5">
          <div className="text-sm text-on-surface-variant">المسودات</div>
          <div className="mt-2 text-3xl font-bold text-warning">
            {news.filter((item) => !item.published).length}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white">
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
          <h2 className="text-lg font-bold text-on-surface">الأخبار والمسودات</h2>
          <button
            onClick={refreshNews}
            className="rounded-2xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface"
          >
            تحديث
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-surface-container-lowest text-sm font-bold text-on-surface-variant">
              <tr>
                <th className="px-6 py-4">العنوان</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    جار التحميل...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    لا توجد أخبار مسجلة.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-bold text-on-surface">{item.title}</td>
                    <td className="px-6 py-4 text-on-surface">{item.category}</td>
                    <td className="max-w-md px-6 py-4 text-on-surface-variant">
                      <p className="line-clamp-2">{item.content}</p>
                      <p className="mt-2 text-xs">
                        {new Date(item.date).toLocaleDateString("ar-EG")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.published
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className="inline-flex h-9 items-center justify-center rounded-2xl bg-surface-container-low px-3 text-xs font-bold text-on-surface"
                        >
                          {item.published ? "إلغاء النشر" : "نشر"}
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-tertiary hover:bg-tertiary/10"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNewsItem(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-error hover:bg-error/10"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-on-surface">
                {editingNewsId ? "تعديل الخبر" : "إضافة خبر جديد"}
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
              <input
                required
                type="text"
                placeholder="عنوان الخبر"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="التصنيف"
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <textarea
                required
                rows={6}
                placeholder="محتوى الخبر"
                value={formData.content}
                onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                className="w-full resize-none rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="رابط الصورة"
                value={formData.image}
                onChange={(event) => setFormData({ ...formData, image: event.target.value })}
                className="w-full rounded-2xl border border-outline-variant/50 px-4 py-3 outline-none focus:border-primary"
              />
              <label className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(event) =>
                    setFormData({ ...formData, published: event.target.checked })
                  }
                  className="h-4 w-4 accent-primary"
                />
                نشر الخبر مباشرة
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white"
                >
                  {editingNewsId ? "حفظ التعديلات" : "حفظ الخبر"}
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
