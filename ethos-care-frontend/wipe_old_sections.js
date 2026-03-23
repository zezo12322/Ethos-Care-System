const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// There's a big news section with <section className="py-20 bg-surface-container-lowest"> 
// Let's find index
const startIndex = content.indexOf('<section className="py-20 bg-surface-container-lowest">');
const endIndex = content.indexOf('</section>', startIndex) + 10;
if (startIndex !== -1 && content.slice(startIndex, startIndex+200).includes('أخبار الفرع')) {
  console.log("Found OLD news section!");
  content = content.slice(0, startIndex) + content.slice(endIndex);
}

// And Support and Partners section
const startIndex2 = content.indexOf('<section className="py-16 bg-white border-t border-outline-variant/10">');
if (startIndex2 !== -1 && content.slice(startIndex2, startIndex2+200).includes('شركاء النجاح والداعمين')) {
  const endIndex2 = content.indexOf('</section>', startIndex2) + 10;
  console.log("Found OLD partners section!");
  content = content.slice(0, startIndex2) + content.slice(endIndex2);
}

fs.writeFileSync('src/app/page.tsx', content);
