const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!code.includes('operationId')) {
  code = code.replace(
      /familyId\s+String\?\n\s+assignedToId\s+String\?/g,
      'familyId                String?\n  assignedToId            String?\n  operationId             String?'
  );
  code = code.replace(
      /family\s+Family\?\s+@relation\(fields: \[familyId\], references: \[id\]\)/g,
      'family                  Family?      @relation(fields: [familyId], references: [id])\n  operation               Operation?   @relation(fields: [operationId], references: [id])'
  );
  
  code = code.replace(
      /updatedAt\s+DateTime @updatedAt\n}/g,
      'updatedAt  DateTime @updatedAt\n  cases      Case[]\n}'
  );
  
  fs.writeFileSync('prisma/schema.prisma', code);
  console.log("Schema updated.");
} else {
  console.log("Already updated");
}
