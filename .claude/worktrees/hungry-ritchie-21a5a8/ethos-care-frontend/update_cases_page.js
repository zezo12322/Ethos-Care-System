const fs = require('fs');
const path = '/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/page.tsx';

let content = fs.readFileSync(path, 'utf8');

const statusOptionsMap = {
  "الكل": "الكل",
  "DRAFT": "مسودة",
  "INTAKE_REVIEW": "مراجعة مبدئية",
  "FIELD_VERIFICATION": "تحقق ميداني",
  "COMMITTEE_REVIEW": "مراجعة اللجنة",
  "APPROVED": "تمت الموافقة",
  "IN_PROGRESS": "قيد التنفيذ",
  "COMPLETED": "مكتملة",
  "REJECTED": "مرفوضة",
  "ON_HOLD": "معلقة",
  "ARCHIVED": "مؤرشفة"
};

// 1. Update filter option dropdown
content = content.replace(
  /<select value=\{filterStatus\} onChange=\{\(e\) => setFilterStatus\(e\.target\.value\)\} className="bg-surface-container-lowest border border-outline-variant\/50 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">[\s\S]*?<\/select>/,
  `<select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-surface-container-lowest border border-outline-variant/50 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
              <option value="الكل">جميع الحالات</option>
              <option value="DRAFT">مسودة</option>
              <option value="INTAKE_REVIEW">مراجعة مبدئية</option>
              <option value="FIELD_VERIFICATION">تحقق ميداني</option>
              <option value="COMMITTEE_REVIEW">مراجعة اللجنة</option>
              <option value="APPROVED">تمت الموافقة</option>
              <option value="IN_PROGRESS">قيد التنفيذ</option>
              <option value="COMPLETED">مكتملة</option>
              <option value="REJECTED">مرفوضة</option>
              <option value="ON_HOLD">معلقة</option>
              <option value="ARCHIVED">مؤرشفة</option>
            </select>`
);

// 2. Map data
content = content.replace(
  /id: caseItem\.id,[\s\S]*?status: caseItem\.lifecycleStatus \|\| caseItem\.status,/,
  `id: caseItem.id,
        name: caseItem.applicantName,
        type: caseItem.caseType,
        date: new Date(caseItem.createdAt).toLocaleDateString("ar-EG"),
        priority: caseItem.priority === 'URGENT' ? 'عاجل' : (caseItem.priority === 'HIGH' ? 'عالي' : (caseItem.priority === 'NORMAL' ? 'تلقائي' : caseItem.priority)),
        location: caseItem.location,
        status: caseItem.lifecycleStatus || caseItem.status,`
);

// 3. Status Badge Label
content = content.replace(
  /<span className={`px-3 py-1 rounded-full text-xs font-bold \$\{.*?\}`}>[\s\S]*?\{c\.status\}[\s\S]*?<\/span>/,
  `{(() => {
                        const lifecycleMap: any = {
                          DRAFT: { label: "مسودة", color: "bg-surface-container text-on-surface" },
                          INTAKE_REVIEW: { label: "مراجعة مبدئية", color: "bg-warning/20 text-warning" },
                          FIELD_VERIFICATION: { label: "تحقق ميداني", color: "bg-warning/30 text-warning-dark" },
                          COMMITTEE_REVIEW: { label: "مراجعة اللجنة", color: "bg-tertiary/20 text-tertiary" },
                          APPROVED: { label: "تمت الموافقة", color: "bg-success/20 text-success" },
                          IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-primary/20 text-primary" },
                          COMPLETED: { label: "مكتملة", color: "bg-success text-on-success" },
                          REJECTED: { label: "مرفوضة", color: "bg-error/20 text-error" },
                          ON_HOLD: { label: "معلقة", color: "bg-surface-variant text-on-surface-variant" },
                          ARCHIVED: { label: "مؤرشفة", color: "bg-outline text-surface" },
                        };
                        const active = lifecycleMap[c.status];
                        const label = active ? active.label : c.status;
                        const color = active ? active.color : (c.status === "نشط" || c.status === "مكتمل" ? "bg-success/20 text-success" : "bg-warning/20 text-warning");
                        return (
                          <span className={\`px-3 py-1 rounded-full text-xs font-bold \${color}\`}>
                            {label}
                          </span>
                        );
                      })()}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("updated");
