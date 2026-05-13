const fs = require('fs');
const file = '/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/families/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import React, { useState, useEffect } from "react";',
  'import React, { useState, useEffect, use } from "react";'
);

content = content.replace(
  'export default function FamilyDetailsPage({ params }: { params: { id: string } }) {',
  'export default function FamilyDetailsPage({ params }: { params: Promise<{ id: string }> }) {'
);

content = content.replace(
  'const familyId = params.id;',
  'const { id: familyId } = use(params);'
);

fs.writeFileSync(file, content);
