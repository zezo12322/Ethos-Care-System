const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// The news section starts with <section className="py-20 bg-surface-container-lowest"> and ends with </section> where comment before is {/* News Section */}

const newsRegex = /\{\/\*\s*News Section\s*\*\/\}[\s\S]*?<\/section>/;
if (newsRegex.test(pageContent)) {
  pageContent = pageContent.replace(newsRegex, '{/* News Section */}\n        <DynamicNews />');
  console.log('Replaced news section.');
} else {
  console.log('News section not found.');
}

const partnersRegex = /\{\/\*\s*Support and Partners Section\s*\*\/\}[\s\S]*?<\/section>/;
if (partnersRegex.test(pageContent)) {
  pageContent = pageContent.replace(partnersRegex, '{/* Support and Partners Section */}\n        <DynamicPartners />');
  console.log('Replaced partners section.');
} else {
  console.log('Partners section not found.');
}

if (!pageContent.includes('import DynamicNews')) {
  let lines = pageContent.split('\n');
  let importIndex = lines.findIndex(l => l.includes('import DynamicStats'));
  if (importIndex !== -1) {
      lines.splice(importIndex + 1, 0, 'import DynamicNews from "@/components/DynamicNews";\nimport DynamicPartners from "@/components/DynamicPartners";');
      pageContent = lines.join('\n');
  }
}

fs.writeFileSync('src/app/page.tsx', pageContent);
console.log('Done!');
