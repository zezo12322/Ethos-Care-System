const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Insert import
if (!content.includes('DonateSection')) {
    content = content.replace(
        /import DynamicPartners from "@\/components\/DynamicPartners";/,
        'import DynamicPartners from "@/components/DynamicPartners";\nimport DonateSection from "@/components/DonateSection";'
    );

    // Insert component before closing main tag
    content = content.replace(
        /<\/main>/,
        '  <DonateSection />\n      </main>'
    );

    fs.writeFileSync('src/app/page.tsx', content);
    console.log('Inserted DonateSection');
} else {
    console.log('DonateSection already imported');
}
