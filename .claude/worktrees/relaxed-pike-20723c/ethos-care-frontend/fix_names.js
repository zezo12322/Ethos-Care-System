const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;
    
    // Replacements
    content = content.replace(/مؤسسة صناع الحياة فرع بني سويف/g, 'جمعية أجيال صناع الحياة ببني سويف');
    content = content.replace(/جمعية صناع الحياة مصر - فرع بني سويف/g, 'جمعية أجيال صناع الحياة ببني سويف');
    content = content.replace(/جمعية صناع الحياة مصر، مؤسسة أهلية وطنية/g, 'جمعية أجيال صناع الحياة، مؤسسة أهلية وطنية');

    // Sidebar:
    content = content.replace(/<span className="font-headline font-bold text-xl leading-none text-primary">صناع الحياة<\/span>[\s\n]*<span className="text-\[10px\] text-on-surface-variant font-bold">بني سويف<\/span>/g, '<span className="font-headline font-bold text-xl leading-none text-primary">أجيال صناع الحياة</span>\n            <span className="text-[10px] text-on-surface-variant font-bold">ببني سويف</span>');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
console.log('Name replacement done');
