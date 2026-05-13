const fs = require('fs');

let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', 'utf8');

content = content.replace('name: res.data.family.name', 'applicantName: res.data.family.name');

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/new/page.tsx', content);
