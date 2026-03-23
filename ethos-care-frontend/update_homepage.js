const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// replace standard imports
if (!pageContent.includes('import DynamicNews')) {
  pageContent = pageContent.replace('import DynamicStats from "@/components/DynamicStats";', 'import DynamicStats from "@/components/DynamicStats";\nimport DynamicNews from "@/components/DynamicNews";\nimport DynamicPartners from "@/components/DynamicPartners";');
}

// remove const news = [ ... ]
pageContent = pageContent.replace(/const news = \[[\s\S]*?\];/, '');
pageContent = pageContent.replace(/const partners = \[[\s\S]*?\];/, '');

// replace <section className="py-20 bg-white"> ... </section> for news
const newsSectionRegex = /<section className="py-20 bg-white">[\s\S]*?أخبار الفرع[\s\S]*?<\/section>/;
pageContent = pageContent.replace(newsSectionRegex, '<DynamicNews />');

// replace partners section
const partnersSectionRegex = /<section className="py-20 bg-surface-container-low">[\s\S]*?شركاء النجاح[\s\S]*?<\/section>/;
pageContent = pageContent.replace(partnersSectionRegex, '<DynamicPartners />');

fs.writeFileSync('src/app/page.tsx', pageContent);
console.log('Homepage updated successfully!');
