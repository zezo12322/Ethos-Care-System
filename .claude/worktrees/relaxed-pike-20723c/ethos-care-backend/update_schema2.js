const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

// I accidentally over-regexed and added `cases Case[]` to multiple models. Let's fix that.
code = code.replace(/updatedAt\s+DateTime @updatedAt\n\s+cases\s+Case\[\]/g, 'updatedAt  DateTime @updatedAt');

// Add manually to Operation only
code = code.replace(/model Operation \{[\s\S]*?updatedAt  DateTime @updatedAt\n\}/, (match) => {
    return match.replace(/updatedAt  DateTime @updatedAt\n\}/, 'updatedAt  DateTime @updatedAt\n  cases      Case[]\n}');
});

fs.writeFileSync('prisma/schema.prisma', code);
