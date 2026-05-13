const fs = require('fs');
const file = '/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const lc = lifecycleMap\[caseData\.lifecycleStatus\][^;]*;/g, `const lc = lifecycleMap[caseData.lifecycleStatus] || { label: caseData.lifecycleStatus, color: "bg-surface-container" };`);
content = content.replace(/color: "bg-surface-container" \};\n color: "bg-surface-container" \};/g, "");

fs.writeFileSync(file, content);
