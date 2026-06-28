# Ethos Care System — الواجهة الأمامية (Frontend)

نظام إدارة حالات ودعم لـ **جمعية أجيال صناع الحياة — بني سويف**: تسجيل الأسر والحالات،
دراسة الاحتياج، اعتماد الدعم، والتنفيذ والمتابعة. هذا المستودع يحتوي واجهة الويب.

## التقنيات

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** — التوكنز الدلالية معرّفة في `src/app/globals.css` عبر `@theme`
- **TypeScript**، عربي **RTL** بالكامل
- اتصال بالـ API عبر **axios** (`src/lib/api.ts`)، مصادقة JWT عبر كوكي

## التشغيل محلياً

```bash
npm install
npm run dev      # http://localhost:3000
```

يحتاج الـ backend (NestJS) شغّالاً على `http://localhost:3001`.

## متغيرات البيئة

| المتغير | الوصف |
|--------|-------|
| `NEXT_PUBLIC_API_URL` | رابط الـ API الخلفي. محلياً: `http://localhost:3001/api`. في الإنتاج: رابط Azure (يوجد fallback في `src/lib/api.ts`). |

`.env.local` للتطوير المحلي فقط (غير مرفوع على git). في الإنتاج تُضبط المتغيرات من لوحة **Vercel**.

## البناء

```bash
npm run build
npm run start
```

## النشر

- **Frontend** → Vercel · **Backend** → Azure App Service · الدومين: `lifemakers-bns.com`

## التصميم والإتاحة

المصدر الموحّد للتصميم في [`design-system/MASTER.md`](design-system/MASTER.md):
Material 3 + RTL، توكنز دلالية (ممنوع الـ hex المباشر)، التزام **WCAG 2.1 AA**.
