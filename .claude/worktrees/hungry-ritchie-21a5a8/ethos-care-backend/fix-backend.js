const fs = require('fs');

let service = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/families/families.service.ts', 'utf8');

service = service.replace(/data: \{([\s\S]*?)\}/, `data: {
        headName: data.headName || "بدون اسم",
        membersCount: parseInt(data.membersCount) || 1,
        income: data.income ? String(data.income) : "0",
        address: data.address || "غير محدد",
        phone: data.phone || "غير محدد",
        lastVisit: new Date(),
        status: "تحت التقييم",
        socialStatus: data.socialStatus || "متزوج/ة",
        job: data.job || null,
        city: data.city || "بني سويف - المركز",
        village: data.village || null,
        addressDetails: data.addressDetails || null,
        nationalId: data.nationalId || null,
        cases: {
          create: {
            applicantName: data.headName || "بدون اسم",
            nationalId: data.nationalId || null,
            caseType: data.caseType || "تمكين اقتصادي",
            priority: data.priority || "عادي",
            location: data.village ? \`\${data.village} - \${data.city}\` : "بني سويف",
            description: data.description || null
          }
        }
      }`);

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/families/families.service.ts', service);


let dto = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/families/dto/create-family.dto.ts', 'utf8');
const appendingStr = `
  @IsString()
  @IsOptional()
  caseType?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  description?: string;
`;
dto = dto.replace('status?: string;', 'status?: string;' + appendingStr);
fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/families/dto/create-family.dto.ts', dto);

console.log("Done");
