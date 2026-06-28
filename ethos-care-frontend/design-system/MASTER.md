# Design System — نظام إدارة الحالات (صناع الحياة)

> مرجع التصميم الموحّد. الأساس: **Material 3** + **RTL عربي**. التقنية: **Next.js + Tailwind v4** (التوكنز معرّفة في `src/app/globals.css` عبر `@theme inline`).
> عند بناء/تعديل أي صفحة: التزم بالتوكنز دي ولا تستخدم ألوان أو مقاسات خارجها.

## 1. النمط (Style)
- **Data-Dense Dashboard / Admin** — كثافة بيانات عالية، كروت KPI، جداول، فورمات طويلة.
- مظهر: كروت بحواف دائرية كبيرة (`rounded-[28px]`)، ظلال خفيفة، أسطح متدرّجة (surface containers).
- **تجنّب:** الزخرفة الزائدة، الإيموجي كأيقونات، الجداول/الفورمات بدون فلترة أو تجميع.

## 2. الألوان (Semantic Tokens)
استخدم التوكنز فقط (مثال: `bg-primary`, `text-on-surface`) — **ممنوع** الـ hex المباشر في المكوّنات.

| الدور | التوكن | القيمة |
|------|--------|--------|
| Primary (أساسي) | `--color-primary` | `#014976` |
| On Primary | `--color-on-primary` | `#ffffff` |
| Secondary (مميّز) | `--color-secondary` | `#F8AD44` |
| Error | `--color-error` | `#ba1a1a` |
| Background / Surface | `--color-surface` | `#f7faf8` |
| On Surface (نص) | `--color-on-surface` | `#181c1c` |
| On Surface Variant (نص ثانوي) | `--color-on-surface-variant` | `#3e4947` |
| Outline / Outline Variant | `--color-outline(-variant)` | `#6e7977` / `#bdc9c6` |
| Surface containers | `--color-surface-container[-low/high/...]` | سلّم رمادي فاتح |

**قواعد لون:**
- `secondary (#F8AD44)` أصفر فاتح → **لا يُستخدم كنص على خلفية بيضاء** (تباين ضعيف). استخدمه كخلفية أزرار مع `on-secondary` أبيض، أو كـ accent.
- اللون لا يكون الدلالة الوحيدة — أضِف أيقونة/نص (خطأ/نجاح).
- تباين النص ≥ 4.5:1 (نص عادي)، ≥ 3:1 (نص كبير/أيقونات).

## 3. الخطوط (Typography)
- الخط الأساسي: **DIN Next LT Arabic** (محلي) عبر `--font-headline / --font-body / --font-label`.
- خطوط محمّلة احتياطية: Cairo، Plus Jakarta Sans.
- العناوين سيّالة (`clamp`): h1 `1.75→3rem`, h2 `1.375→2rem`, h3 `1.125→1.5rem`.
- جسم النص ≥ 16px، line-height ≈ 1.5–1.6، أوزان: عناوين 600–700، نص 400، تسميات 500.
- أرقام البيانات/الأسعار: يُفضّل أرقام جدولية (tabular) لتفادي اهتزاز التخطيط.

## 4. الأيقونات
- **Material Symbols Outlined** فقط (font icon)، ممنوع الإيموجي.
- كل أيقونة زخرفية تأخذ `aria-hidden="true"`، والأزرار الأيقونية فقط تأخذ `aria-label`.
- مقاس موحّد (افتراضي 24px).

## 5. المسافات والحواف والطبقات
- **سلّم مسافات 4/8px** (Tailwind: `gap-2/3/4/5/6/8`).
- الحواف: `--radius-lg .5rem`, `--radius-xl .75rem`, `--radius-full`; الكروت غالباً `rounded-[28px]`.
- `z-index`: overlay `z-40`، sidebar `z-50`، الأشرطة اللاصقة (sticky) `z-20`.
- عرض المحتوى على الديسктоп: حافظ على `max-width` ثابت للأقسام.

## 6. الحركة (Motion)
- مدة التفاعلات الدقيقة 150–300ms، `ease-out` للدخول.
- `animate-slide-up` متاح للظهور.
- **يُحترم `prefers-reduced-motion`** عالمياً (معرّف في globals.css) — لا تعطّله.

## 7. الإتاحة (Accessibility) — إلزامي
- **focus ring** ظاهر لكل عنصر تفاعلي (معرّف عالمياً `:focus-visible`) — لا تشيله.
- `cursor: pointer` للأزرار والعناصر التفاعلية (معرّف عالمياً).
- مساحات اللمس ≥ 44×44px.
- الحقول لها `label` ظاهرة + `aria-required` للمطلوب + علامة `*`.
- الأخطاء جنب الحقل + `aria-live`/`role="alert"` عند الإمكان.
- ترتيب التركيز يطابق الترتيب البصري (RTL).
- `aria-current="page"` للرابط الحالي في القائمة.

## 8. التنقّل (Navigation)
- Sidebar ثابت يمين (RTL)، يظهر/يختفي على الموبايل بـ overlay.
- الرابط الحالي **مميّز بصرياً** (`bg-white/15` + `font-semibold` + `aria-current`).
- العناصر التفاعلية في القائمة: أيقونة + نص دائماً (مش أيقونة لوحدها).
- الإجراءات الخطرة (تسجيل خروج) **مفصولة بصرياً** بلون تحذيري وحدّ فاصل.

## 9. الفورمات
- تسمية ظاهرة لكل حقل (مش placeholder بس).
- مؤشّر المطلوب: `*` بلون `text-error` + `aria-required`.
- حالة التحميل على زر الحفظ + تعطيله أثناء الإرسال.
- الكشف التدريجي: الخانات الفرعية تظهر حسب الاختيار (مثل نوع الدعم → أقسامه فقط).

## 10. المرجعية
- التوكنز: `src/app/globals.css`
- الخطوط/RTL: `src/app/layout.tsx` (`<html lang="ar" dir="rtl">`)
- القائمة: `src/components/layout/Sidebar.tsx`
- مكوّنات UI مشتركة: `src/components/ui/` (Toast, ConfirmDialog, Breadcrumbs)

> هذا الملف هو **المصدر الموحّد**. التعديلات الخاصة بصفحة معيّنة تُوضع في `design-system/pages/<page>.md` وتتقدّم على هذا الملف عند بناء تلك الصفحة فقط.
