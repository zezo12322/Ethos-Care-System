/**
 * أداة عرض — تسرد كل المراكز (نوع "مركز") وتوزيع القرى حسب المنطقة.
 * بتكشف اختلافات الإملاء (مثل "الواسطي" مقابل "الواسطى").
 *
 * التشغيل (PowerShell):
 *   $env:SEED_EMAIL="ceo@lifemakers-bns.com"
 *   $env:SEED_PASSWORD="********"
 *   node list_centers.js
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
  const { access_token: token } = await loginRes.json();
  const rows = await (
    await fetch(`${API_URL}/locations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();

  const centers = rows.filter((r) => r.type === 'مركز');
  const villages = rows.filter((r) => r.type === 'قرية');

  // عدد القرى حسب المنطقة (region = اسم المركز)
  const villagesByRegion = villages.reduce((acc, v) => {
    acc[v.region] = (acc[v.region] || 0) + 1;
    return acc;
  }, {});

  console.log(`\n=== كل المراكز (${centers.length}) ===`);
  centers
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    .forEach((c) => {
      console.log(
        `  id=${c.id.slice(0, 8)} | name="${c.name}" (len=${c.name.length}) | region="${c.region}" | قرى مرتبطة=${villagesByRegion[c.name] || 0}`,
      );
    });

  console.log(`\n=== توزيع القرى حسب المنطقة (region) ===`);
  Object.entries(villagesByRegion)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      console.log(`  "${region}" (len=${region.length})  →  ${count} قرية`);
    });
}

main().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});
