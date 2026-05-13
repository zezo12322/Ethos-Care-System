const fs = require('fs');

let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/cases/cases.service.ts', 'utf8');
content = content.replace('description: data.description || "",', 'description: data.description || "",\n        familyId: data.familyId || null,');

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/cases/cases.service.ts', content);
