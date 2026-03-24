const fs = require('fs');

const filesToUpdate = [
    'src/components/layout/PublicFooter.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/app/request-aid/page.tsx',
    'src/app/layout.tsx',
    'src/components/DynamicNews.tsx',
    'src/app/volunteer/page.tsx',
    'src/app/contact/page.tsx'
];

filesToUpdate.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf-8');
        content = content.replace(/>صناع الحياة</g, '>أجيال صناع الحياة<');
        content = content.replace(/صناع الحياة - نظام إدارة الحالات/g, 'أجيال صناع الحياة - نظام إدارة الحالات');
        content = content.replace(/جمعية صناع الحياة/g, 'جمعية أجيال صناع الحياة');
        content = content.replace(/صناع الحياة في محافظة بني سويف/g, 'أجيال صناع الحياة في محافظة بني سويف');
        content = content.replace(/في صناع الحياة\./g, 'في أجيال صناع الحياة.');
        content = content.replace(/فريق صناع الحياة بفرع بني سويف/g, 'فريق أجيال صناع الحياة ببني سويف');
        fs.writeFileSync(file, content);
    } catch(e) {}
});

console.log('Other names replaced');
