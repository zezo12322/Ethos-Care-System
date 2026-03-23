const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const sIdx = content.indexOf('{/* News Section */}');
if (sIdx !== -1) {
  const eIdx = content.indexOf('</section>', sIdx) + 10;
  content = content.slice(0, sIdx) + '{/* News Section */}\n        <DynamicNews />\n' + content.slice(eIdx);
}

const sIdx2 = content.indexOf('{/* Support and Partners Section */}');
if (sIdx2 !== -1) {
  const eIdx2 = content.indexOf('</section>', sIdx2) + 10;
  content = content.slice(0, sIdx2) + '{/* Support and Partners Section */}\n        <DynamicPartners />\n' + content.slice(eIdx2);
}

fs.writeFileSync('src/app/page.tsx', content);
console.log('done!');
