const fs = require('fs');

const addressOld1 = 'بني سويف، شارع بورسعيد، بجوار المحافظة';
const addressOld2 = 'بني سويف، شارع بورسعيد، عمارة الأوقاف، بجوار مبنى المحافظة القديم، الدور الأول.';
const addressNew = 'حي الزهور الشارع المقابل لمسجد ثروت الدعوري  مركز بني سويف محافظة بني سويف';

const phoneOld1 = '19222 (الخط الساخن)';
const phoneOld2 = '010 1234 5678';
const phoneNew = '01020040935';

const facebookLink = 'https://Facebook.com/sonna3.bns?';

function processFile(file) {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    content = content.replace(addressOld1, addressNew);
    content = content.replace(addressOld2, addressNew);

    content = content.replace(phoneOld1, phoneNew);
    content = content.replace(phoneOld2, phoneNew);

    if (file.includes('PublicFooter.tsx')) {
        // Find the language icon link and replace it with a facebook link
        content = content.replace(/<a href="#" className="w-10 h-10 rounded-full[\s\S]*?<span className="material-symbols-outlined">[\s\n]*language<\/span>[\s\n]*<\/a>/m, 
`<a href="${facebookLink}" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors" title="فيسبوك">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
            </a>`);
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
}

['src/components/layout/PublicFooter.tsx', 'src/app/contact/page.tsx'].forEach(processFile);

console.log('Address and phone replacements done');
