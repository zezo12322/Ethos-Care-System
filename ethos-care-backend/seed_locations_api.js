/**
 * Locations Seed (عبر الـ API المنشور) — مراكز وقرى محافظة بني سويف.
 *
 * يسجّل الدخول بحساب (CEO/ADMIN/MANAGER) ثم يضيف المواقع عبر POST /locations
 * على سيرفر الباك إند (Azure App Service) — السيرفر هو من يكتب في قاعدة
 * بيانات Azure، فلا حاجة لفتح firewall قاعدة البيانات لجهازك.
 *
 * التشغيل (PowerShell):
 *   $env:SEED_EMAIL="ceo@lifemakers-bns.com"
 *   $env:SEED_PASSWORD="********"
 *   node seed_locations_api.js
 *
 * متغيّرات اختيارية:
 *   API_URL  (افتراضي: https://lifemakers-g4d7gpa6f4g6egas.uaenorth-01.azurewebsites.net/api)
 *
 * - آمن لإعادة التشغيل: يجلب المواقع الموجودة أولًا ولا يضيف المكرر.
 * - يتطلب Node 18+ (يستخدم fetch المدمج).
 */
const { buildLocations } = require('./beni_suef_locations');

const API_URL = (
  process.env.API_URL ||
  'https://lifemakers-g4d7gpa6f4g6egas.uaenorth-01.azurewebsites.net/api'
).replace(/\/+$/, '');
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

// تباطؤ بين الطلبات للبقاء تحت حد المعدّل (rate limit ~30 طلب/دقيقة)
const DELAY_MS = Number(process.env.SEED_DELAY_MS || 2500);
// مدة الانتظار عند الاصطدام بحد المعدّل (429) قبل إعادة المحاولة
const RATE_LIMIT_WAIT_MS = Number(process.env.SEED_RATE_WAIT_MS || 65000);
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`فشل تسجيل الدخول (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  const token = data.access_token || data.accessToken;
  if (!token) {
    throw new Error('لم يُرجِع تسجيل الدخول access_token.');
  }
  return token;
}

async function fetchExisting(token) {
  const res = await fetch(`${API_URL}/locations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`تعذّر جلب المواقع الحالية (${res.status}).`);
  }
  const rows = await res.json();
  return new Set(rows.map((l) => `${l.type}|${l.name}|${l.region}`));
}

async function createLocation(token, location) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(location),
    });

    if (res.ok) return;

    // عند تجاوز حد المعدّل: انتظر ثم أعد المحاولة
    if (res.status === 429 && attempt < MAX_RETRIES) {
      console.log(
        `    ⏳ حد المعدّل (429) — انتظار ${Math.round(RATE_LIMIT_WAIT_MS / 1000)} ثانية ثم إعادة المحاولة...`,
      );
      await sleep(RATE_LIMIT_WAIT_MS);
      continue;
    }

    throw new Error(
      `فشل إضافة "${location.name}" (${res.status}): ${await res.text()}`,
    );
  }
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error(
      '❌ من فضلك حدّد بيانات الدخول:\n' +
        '   $env:SEED_EMAIL="ceo@lifemakers-bns.com"\n' +
        '   $env:SEED_PASSWORD="********"',
    );
    process.exit(1);
  }

  console.log(`🌱 Seeding عبر الـ API: ${API_URL}\n`);

  const token = await login();
  console.log('  ✓ تم تسجيل الدخول.');

  const seen = await fetchExisting(token);
  const toCreate = buildLocations().filter(
    (l) => !seen.has(`${l.type}|${l.name}|${l.region}`),
  );

  if (toCreate.length === 0) {
    console.log('  ✓ لا توجد مواقع جديدة لإضافتها (كلها موجودة بالفعل).');
    console.log('\n✅ Locations seed completed!');
    return;
  }

  const etaMin = Math.ceil((toCreate.length * DELAY_MS) / 60000);
  console.log(
    `  • سيتم إضافة ${toCreate.length} موقعًا (بمعدّل آمن — حوالي ${etaMin} دقيقة)...`,
  );
  let done = 0;
  for (const location of toCreate) {
    await createLocation(token, location);
    done += 1;
    if (done % 25 === 0 || done === toCreate.length) {
      console.log(`    … ${done}/${toCreate.length}`);
    }
    if (done < toCreate.length) {
      await sleep(DELAY_MS);
    }
  }

  const centers = toCreate.filter((l) => l.type === 'مركز').length;
  const villages = toCreate.filter((l) => l.type === 'قرية').length;
  console.log(
    `  ✓ تمت إضافة ${toCreate.length} موقعًا (${centers} مركز، ${villages} قرية).`,
  );
  console.log('\n✅ Locations seed completed!');
}

main().catch((error) => {
  console.error('❌ Seed failed:', error.message || error);
  process.exit(1);
});
