const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// find <section className="py-20 bg-white"> ... أخبار الفرع ... </section>
const newsRegex = /<section className="py-20 bg-white">[\s\S]*?أخبار الفرع[\s\S]*?<\/section>/;

if (newsRegex.test(pageContent)) {
  pageContent = pageContent.replace(newsRegex, '<DynamicNews />');
  console.log('Replaced news section.');
} else {
  console.log('News section not found.');
}

fs.writeFileSync('src/app/page.tsx', pageContent);
console.log('Done!');
