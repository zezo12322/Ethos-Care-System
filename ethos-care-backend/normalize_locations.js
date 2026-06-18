/**
 * أداة توحيد المراكز — تثبّت المراكز السبعة الصحيحة وتعالج اختلاف الإملاء والتكرار.
 *
 * بتعمل:
 *  - تثبّت إملاء المراكز على القائمة الرسمية (الواسطى، بني سويف، ...).
 *  - تنقل القرى التابعة لمركز مكتوب بإملاء مختلف إلى المركز الصحيح (PATCH region).
 *  - تمسح المراكز المكرّرة (نفس الاسم بعد التطبيع).
 *  - تمسح القرى المكرّرة (نفس الاسم + المركز بعد التطبيع).
 *
 * التشغيل (PowerShell):
 *   $env:SEED_EMAIL="ceo@lifemakers-bns.com"
 *   $env:SEED_PASSWORD="********"
 *   node normalize_locations.js                 # عرض فقط (لا يغيّر شيئًا)
 *   $env:APPLY="1"; node normalize_locations.js  # تنفيذ فعلي
 */
const API_URL = (
  process.env.API_URL ||
  'https://lifemakers-g4d7gpa6f4g6egas.uaenorth-01.azurewebsites.net/api'
).replace(/\/+$/, '');
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;
const APPLY = process.env.APPLY === '1';
const DELAY_MS = Number(process.env.SEED_DELAY_MS || 2500);

// المراكز الرسمية (الإملاء المعتمد)
const CANON_CENTERS = ['بني سويف', 'الواسطى', 'ناصر', 'إهناسيا', 'ببا', 'سمسطا', 'الفشن'];

// تطبيع للمقارنة فقط (يوحّد ى/ي، الهمزات، التاء المربوطة، والمسافات)
const norm = (s) =>
  (s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');

const canonByNorm = new Map(CANON_CENTERS.map((c) => [norm(c), c]));
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

async function req(token, method, path, body) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.ok) return res.status === 204 ? null : res.json().catch(() => null);
    if (res.status === 429 && attempt < 5) {
      await sleep(65000);
      continue;
    }
    throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`);
  }
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ حدّد SEED_EMAIL و SEED_PASSWORD أولًا.');
    process.exit(1);
  }

  const token = await login();
  const rows = await req(token, 'GET', '/locations');
  const centers = rows.filter((r) => r.type === 'مركز');
  const villages = rows.filter((r) => r.type === 'قرية');

  // ── المراكز: اختيار ناجٍ واحد لكل مركز رسمي، وإعادة تسمية المتغيّر، وحذف المكرّر ──
  // ترتيب الأفضلية: مطابق للإملاء الرسمي، ثم region غير فارغ، ثم الأقدم
  centers.sort((a, b) => {
    const ax = a.name === canonByNorm.get(norm(a.name)) ? 0 : 1;
    const bx = b.name === canonByNorm.get(norm(b.name)) ? 0 : 1;
    if (ax !== bx) return ax - bx;
    const ar = a.region ? 0 : 1;
    const br = b.region ? 0 : 1;
    if (ar !== br) return ar - br;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const keptCenterByCanon = new Map();
  const centerRenames = [];
  const centersToDelete = [];

  for (const c of centers) {
    const canonName = canonByNorm.get(norm(c.name));
    if (!canonName) continue; // مركز غير معروف — لا نلمسه
    if (!keptCenterByCanon.has(canonName)) {
      keptCenterByCanon.set(canonName, c);
      if (c.name !== canonName) {
        centerRenames.push({ id: c.id, from: c.name, to: canonName });
      }
    } else {
      centersToDelete.push(c);
    }
  }

  // ── القرى: تطبيع region للمركز الرسمي + حذف المكرّر ──
  const regionPatches = [];
  const seenVillage = new Map();
  const villagesToDelete = [];

  for (const v of villages) {
    const newRegion = canonByNorm.get(norm(v.region)) || v.region;
    const key = `${norm(v.name)}|${norm(newRegion)}`;
    if (seenVillage.has(key)) {
      villagesToDelete.push(v);
      continue;
    }
    seenVillage.set(key, v);
    if (newRegion !== v.region) {
      regionPatches.push({ id: v.id, name: v.name, from: v.region, to: newRegion });
    }
  }

  // ── عرض الخطة ──
  console.log(`\n=== إعادة تسمية مراكز (${centerRenames.length}) ===`);
  centerRenames.forEach((r) => console.log(`  "${r.from}" → "${r.to}"`));
  console.log(`\n=== تعديل region لقرى (${regionPatches.length}) ===`);
  regionPatches.forEach((r) => console.log(`  "${r.name}": "${r.from}" → "${r.to}"`));
  console.log(`\n=== حذف مراكز مكرّرة (${centersToDelete.length}) ===`);
  centersToDelete.forEach((c) => console.log(`  "${c.name}" (region="${c.region}", id=${c.id.slice(0, 8)})`));
  console.log(`\n=== حذف قرى مكرّرة (${villagesToDelete.length}) ===`);
  villagesToDelete.forEach((v) => console.log(`  "${v.name}" (region="${v.region}", id=${v.id.slice(0, 8)})`));

  if (!APPLY) {
    console.log('\n(وضع العرض فقط — لم يتغيّر شيء). للتنفيذ: $env:APPLY="1" ثم أعد التشغيل.');
    return;
  }

  console.log('\n▶ التنفيذ...');
  const ops = [
    ...centerRenames.map((r) => ['PATCH', `/locations/${r.id}`, { name: r.to }, `rename ${r.from}→${r.to}`]),
    ...regionPatches.map((r) => ['PATCH', `/locations/${r.id}`, { region: r.to }, `region ${r.name}→${r.to}`]),
    ...villagesToDelete.map((v) => ['DELETE', `/locations/${v.id}`, null, `del village ${v.name}`]),
    ...centersToDelete.map((c) => ['DELETE', `/locations/${c.id}`, null, `del center ${c.name}`]),
  ];

  let done = 0;
  for (const [method, path, body, label] of ops) {
    await req(token, method, path, body);
    done += 1;
    console.log(`  ✓ ${done}/${ops.length}  ${label}`);
    if (done < ops.length) await sleep(DELAY_MS);
  }
  console.log('\n✅ تم التوحيد.');
}

main().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});
