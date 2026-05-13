const fs = require('fs');

const servicePath = '/home/techno/Downloads/stitch/ethos-care-backend/src/families/families.service.ts';
let code = fs.readFileSync(servicePath, 'utf8');

// Update findOne to include familyMembers
const findOneSearch = `
  async findOne(id: string) {
    return this.prisma.family.findUnique({ 
      where: { id },
      include: {
        cases: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }`;

const findOneReplace = `
  async findOne(id: string) {
    return this.prisma.family.findUnique({ 
      where: { id },
      include: {
        familyMembers: true,
        cases: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }`;

if (code.includes(findOneSearch)) {
    code = code.replace(findOneSearch, findOneReplace);
}

// Update create to map members details if they exist in data.membersDetails
const createSearch = `
  async create(data: any) {
    const lifecycleStatus = 'DRAFT';
    const decisionStatus = 'PENDING_DECISION';
    const completenessStatus = data.nationalId ? 'COMPLETE' : 'MISSING_NATIONAL_ID';

    return this.prisma.family.create({
      data: {
        headName: data.headName || "بدون اسم",
`;

const createReplace = `
  async create(data: any) {
    const lifecycleStatus = 'DRAFT';
    const decisionStatus = 'PENDING_DECISION';
    const completenessStatus = data.nationalId ? 'COMPLETE' : 'MISSING_NATIONAL_ID';

    const familyMembersData = data.membersDetails && data.membersDetails.length > 0 
      ? {
          create: data.membersDetails.map(member => ({
            name: member.name,
            age: member.age,
            relation: member.relation,
            education: member.education
          }))
        }
      : undefined;

    return this.prisma.family.create({
      data: {
        headName: data.headName || "بدون اسم",
        familyMembers: familyMembersData,
`;

if (code.includes('async create(data: any) {')) {
    code = code.replace(
        /async create\(data: any\) \{[\s\S]*?headName: data\.headName \|\| "بدون اسم",/,
        createReplace.trim()
    );
}

fs.writeFileSync(servicePath, code);
console.log("Service updated");
