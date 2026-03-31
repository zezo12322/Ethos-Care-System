"use client";

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
  const [news, setNews] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
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
  }, [reloadKey]);

  const refreshNews = () => setReloadKey((current) => current + 1);

  const handleCreateNewsItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await newsService.create({
        ...formData,
        image: formData.image.trim() || undefined,
      });
      setIsModalOpen(false);
      setFormData(emptyForm);
      refreshNews();
    } catch (createError) {
      console.error(createError);
      setError("تعذر إنشاء الخبر الآن.");
    }
  };

  const handleDeleteNewsItem = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا الخبر؟")) {
      return;
    }

    setError("");

    try {
      await newsService.remove(id);
      refreshNews();
    } catch (deleteError) {
      console.error(deleteError);
      setError("تعذر حذف الخبر الآن.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">إدارة الأخبار</h1>
          <p className="text-sm text-on-surface-variant mt-1">عرض كل الأخبار بما فيها المسودات الداخلية وربطها بحالة النشر الفعلية.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="font-bold text-lg">الأخبار المنشورة والمسودات</h2>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
            خبر جديد
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-sm font-bold">
              <tr>
                <th className="px-6 py-4">العنوان</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">التفاصيل</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-outline">جار التحميل...</td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-outline">لا توجد أخبار مسجلة</td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-bold">{item.title}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 text-on-surface-variant max-w-md">
                      <p className="line-clamp-2">{item.content}</p>
                      <p className="text-xs mt-2">{new Date(item.date).toLocaleDateString("ar-EG")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs leading-none font-bold ${item.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                        {item.published ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDeleteNewsItem(item.id)} className="w-8 h-8 rounded-full text-red-600 hover:bg-red-100">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl leading-relaxed text-right">
            <h3 className="text-xl font-bold mb-4">إضافة خبر جديد</h3>
            <form onSubmit={handleCreateNewsItem} className="space-y-4">
              <input
                required
                type="text"
                placeholder="عنوان الخبر"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="التصنيف"
                value={formData.category}
                onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <textarea
                required
                rows={5}
                placeholder="محتوى الخبر"
                value={formData.content}
                onChange={(event) => setFormData({ ...formData, content: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary resize-none"
              ></textarea>
              <input
                type="text"
                placeholder="رابط الصورة"
                value={formData.image}
                onChange={(event) => setFormData({ ...formData, image: event.target.value })}
                className="w-full border border-outline-variant/50 rounded-xl py-2 px-3 outline-none focus:border-primary"
              />
              <label className="flex items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(event) => setFormData({ ...formData, published: event.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                نشر الخبر مباشرة
              </label>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">
                  حفظ
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold">
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
