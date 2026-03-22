const fs = require('fs');

let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/cases/cases.service.ts', 'utf8');
content = content.replace(/familyId: data\.familyId \|\| null,\n        familyId: data\.familyId \|\| null,/g, 'familyId: data.familyId || null,');

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/cases/cases.service.ts', content);
