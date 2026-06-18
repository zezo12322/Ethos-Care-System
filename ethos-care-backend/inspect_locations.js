/**
 * أداة تشخيص — تعرض آخر المواقع المضافة وتكتشف التكرار.
 * بتساعد نعرف مصدر "القرى الجديدة" اللي بتزيد في صفحة النطاق الجغرافي.
 *
 * التشغيل (PowerShell):
 *   $env:SEED_EMAIL="ceo@lifemakers-bns.com"
 *   $env:SEED_PASSWORD="********"
 *   node inspect_locations.js
 */
const API_URL = (
  process.env.API_URL ||
  'https://lifemakers-g4d7gpa6f4g6egas.uaenorth-01.azurewebsites.net/api'
).replace(/\/+$/, '');
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ حدّد SEED_EMAIL و SEED_PASSWORD أولًا.');
    process.exit(1);
  }

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!loginRes.ok) {
    throw new Error(`فشل تسجيل الدخول (${loginRes.status})`);
  }
  const { access_token: token } = await loginRes.json();

  const res = await fetch(`${API_URL}/locations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const rows = await res.json();

  const byType = rows.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  console.log('\n=== الإجمالي حسب النوع ===');
  console.log(byType);

  // اكتشاف التكرار (نفس الاسم + النوع + المنطقة)
  const counts = new Map();
  for (const r of rows) {
    const key = `${r.type}|${r.name}|${r.region}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const dups = [...counts.entries()].filter(([, c]) => c > 1);
  console.log(`\n=== المكرّرات (نفس الاسم/النوع/المنطقة): ${dups.length} ===`);
  dups.slice(0, 30).forEach(([key, c]) => console.log(`  ${c}×  ${key}`));

  // آخر 25 موقع مضاف (findAll بيرتّب createdAt تنازلي)
  console.log('\n=== آخر 25 موقع مضاف ===');
  rows.slice(0, 25).forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. [${r.type}] "${r.name}" | region="${r.region}" | ${r.createdAt}`,
    );
  });
}

main().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});
