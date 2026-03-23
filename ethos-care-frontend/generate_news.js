const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/partners/page.tsx", "utf8");
content = content.replace(/Partners/g, "News").replace(/partners/g, "news").replace(/Partner/g, "NewsItem").replace(/partner/g, "newsItem").replace(/الشركاء/g, "الأخبار").replace(/شريك/g, "خبر").replace(/name/g, "title").replace(/مؤسسة مانحة/g, "فعاليات").replace(/contact/g, "content").replace(/email/g, "image").replace(/type/g, "category");
fs.mkdirSync("src/app/dashboard/news", { recursive: true });
fs.writeFileSync("src/app/dashboard/news/page.tsx", content);

