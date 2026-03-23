const fs = require('fs');

let pageContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const newsLink = `        <Link
          href="/dashboard/news"
          className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">newspaper</span>
          <span>الأخبار</span>
        </Link>`;

if (!pageContent.includes('href="/dashboard/news"')) {
  pageContent = pageContent.replace('<span>الشركاء</span>\n        </Link>', '<span>الشركاء</span>\n        </Link>\n' + newsLink);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', pageContent);
  console.log("Updated sidebar");
} else {
  console.log("Already updated");
}

