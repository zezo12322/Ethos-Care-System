/**
 * أداة تنظيف — تحذف المواقع المكرّرة (نفس الاسم + النوع + المنطقة)
 * وتُبقي نسخة واحدة فقط من كل موقع.
 *
 * التشغيل (PowerShell):
 *   $env:SEED_EMAIL="ceo@lifemakers-bns.com"
 *   $env:SEED_PASSWORD="********"
 *   node dedupe_locations.js          # عرض فقط (dry-run) — لا يحذف
 *   $env:APPLY="1"; node dedupe_locations.js   # تنفيذ الحذف فعليًا
 */
const API_URL = (
  process.env.API_URL ||
  'https://lifemakers-g4d7gpa6f4g6egas.uaenorth-01.azurewebsites.net/api'
).replace(/\/+$/, '');
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;
const APPLY = process.env.APPLY === '1';
const DELAY_MS = Number(process.env.SEED_DELAY_MS || 2500);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`فشل تسجيل الدخول (${res.status})`);
  return (await res.json()).access_token;
}

async function remove(token, id, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const res = await fetch(`${API_URL}/locations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return;
    if (res.status === 429 && attempt < retries) {
      await sleep(65000);
      continue;
    }
    throw new Error(`فشل حذف ${id} (${res.status})`);
  }
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ حدّد SEED_EMAIL و SEED_PASSWORD أولًا.');
    process.exit(1);
  }

  const token = await login();
  const rows = await (
    await fetch(`${API_URL}/locations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();

  // تجميع حسب (النوع|الاسم|المنطقة) مع إبقاء أقدم نسخة
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.type}|${r.name}|${r.region}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  const toDelete = [];
  for (const [key, items] of groups) {
    if (items.length <= 1) continue;
    // رتّب بالأقدم أولًا، واحذف الباقي
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const [keep, ...extras] = items;
    console.log(`  ${items.length}× ${key}  →  حذف ${extras.length} (إبقاء ${keep.id.slice(0, 8)})`);
    toDelete.push(...extras);
  }

  console.log(`\nإجمالي النُسخ الزيادة المطلوب حذفها: ${toDelete.length}`);

  if (!APPLY) {
    console.log('\n(وضع العرض فقط — لم يُحذف شيء). للتنفيذ: $env:APPLY="1" ثم أعد التشغيل.');
    return;
  }

  let done = 0;
  for (const r of toDelete) {
    await remove(token, r.id);
    done += 1;
    if (done % 10 === 0 || done === toDelete.length) {
      console.log(`  … حُذف ${done}/${toDelete.length}`);
    }
    if (done < toDelete.length) await sleep(DELAY_MS);
  }
  console.log(`\n✅ تم حذف ${toDelete.length} نسخة مكرّرة.`);
}

main().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});
