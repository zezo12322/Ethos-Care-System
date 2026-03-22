const fs = require('fs');
const file = '/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace the filter
content = content.replace(
  'if (filterStatus !== "الكل" && c.status !== filterStatus) return false;',
  'if (filterStatus !== "الكل" && c.lifecycleStatus !== filterStatus) return false;'
);

// replace export
content = content.replace(
  '\\${c.id},\\${c.name},\\${c.type},\\${c.status},\\${c.priority},\\${c.date},\\${c.location}',
  '\\${c.id},\\${c.name},\\${c.type},\\${c.lifecycleStatus},\\${c.priority},\\${c.date},\\${c.location}'
);

const lifecycleMapCode = `
  const lifecycleMap: any = {
    DRAFT: { label: "مسودة", color: "bg-surface-container text-on-surface" },
    INTAKE_REVIEW: { label: "مراجعة مبدئية", color: "bg-warning/20 text-warning-dark" },
    FIELD_VERIFICATION: { label: "تحقق ميداني", color: "bg-warning/30 text-warning-dark" },
    COMMITTEE_REVIEW: { label: "مراجعة اللجنة", color: "bg-tertiary/20 text-tertiary" },
    APPROVED: { label: "تمت الموافقة", color: "bg-success/20 text-success" },
    IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-primary/20 text-primary" },
    COMPLETED: { label: "مكتملة", color: "bg-success text-on-success" },
    REJECTED: { label: "مرفوضة", color: "bg-error/20 text-error" },
    ON_HOLD: { label: "معلقة", color: "bg-surface-variant text-on-surface-variant" },
    ARCHIVED: { label: "مؤرشفة", color: "bg-outline text-surface" },
  };
`;

// Insert lifecycleMap right after const filteredCases...
content = content.replace(
  '  const filteredCases = cases.filter(c => {',
  lifecycleMapCode + '\n  const filteredCases = cases.filter(c => {'
);


// replace table cell
const tableCellOld = `<span className={\`inline-flex px-2.5 py-1 rounded-full text-xs font-bold \${
                      c.status === "نشط" ? "bg-blue-100 text-blue-800" :
                      c.status === "مكتمل" ? "bg-green-100 text-green-800" :
                      c.status === "مرفوض" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }\`}>
                      {c.status}
                    </span>`;

const tableCellNew = `<span className={\`inline-flex px-2.5 py-1 rounded-full text-xs font-bold \${
                      lifecycleMap[c.lifecycleStatus]?.color || "bg-surface-container text-on-surface"
                    }\`}>
                      {lifecycleMap[c.lifecycleStatus]?.label || c.lifecycleStatus}
                    </span>`;

content = content.replace(tableCellOld, tableCellNew);

fs.writeFileSync(file, content);
