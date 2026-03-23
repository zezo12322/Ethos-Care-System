const fs = require('fs');

const schemaPath = '/home/techno/Downloads/stitch/ethos-care-backend/prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// Add familyMembers relation to Family model
if (!schema.includes('familyMembers  FamilyMember[]')) {
    schema = schema.replace(
        /cases\s+Case\[\]/g,
        'cases          Case[]\n  familyMembers  FamilyMember[]'
    );
}

// Add FamilyMember model
if (!schema.includes('model FamilyMember')) {
    schema += `

model FamilyMember {
  id             String   @id @default(uuid())
  name           String
  relation       String   @default("ابن/ة")
  age            String?
  education      String?  @default("لا يدرس")
  familyId       String
  family         Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
`;
}

fs.writeFileSync(schemaPath, schema);
console.log("Schema updated");
