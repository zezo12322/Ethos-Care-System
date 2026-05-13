const fs = require('fs');
const path = '/home/techno/Downloads/stitch/ethos-care-frontend/src/components/dashboard/ImmediateSearch.tsx';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /setResult\(res\.data\);/,
  `const foundClasses = res.data.families?.length > 0 || res.data.cases?.length > 0;
      setResult({
        found: foundClasses,
        family: res.data.families?.[0] || null,
        cases: res.data.cases || []
      });`
);

content = content.replace(
  /result\.family\.name/g,
  `result.family.headName`
);

content = content.replace(
  /c\.name/g,
  `c.applicantName`
);

content = content.replace(
  /c\.type/g,
  `c.caseType`
);

content = content.replace(
  /c\.status/g,
  `c.lifecycleStatus`
);

fs.writeFileSync(path, content, 'utf8');
