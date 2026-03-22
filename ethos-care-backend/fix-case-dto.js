const fs = require('fs');
let content = fs.readFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/cases/dto/create-case.dto.ts', 'utf8');

content = content.replace('description?: string;', 'description?: string;\n\n  @IsString()\n  @IsOptional()\n  familyId?: string;');

fs.writeFileSync('/home/techno/Downloads/stitch/ethos-care-backend/src/cases/dto/create-case.dto.ts', content);
