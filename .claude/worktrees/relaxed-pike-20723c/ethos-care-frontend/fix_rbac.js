const fs = require('fs');
const file = '/home/techno/Downloads/stitch/ethos-care-frontend/src/app/dashboard/cases/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add currentRole state
content = content.replace(
  'const [actionLoading, setActionLoading] = useState(false);',
  'const [actionLoading, setActionLoading] = useState(false);\n  const [currentRole, setCurrentRole] = useState<"CASE_MANAGER" | "EXECUTIVE_DIRECTOR" | "EXECUTION_OFFICER" | "ADMIN">("ADMIN");'
);

// 2. Add Role switcher dropdown
const roleSwitcher = `
      {/* Role Switcher for Simulation */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-2 flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline">shield_person</span>
          <span className="text-sm font-bold opacity-70">محاكي الصلاحيات (RBAC)</span>
        </div>
        <select 
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value as any)}
          className="bg-surface-container-low border border-outline-variant/50 text-sm rounded-lg px-3 py-1 outline-none font-bold"
        >
          <option value="ADMIN">مسؤول النظام (Admin)</option>
          <option value="CASE_MANAGER">مدير الحالات (Case Manager)</option>
          <option value="EXECUTIVE_DIRECTOR">المدير التنفيذي (Executive Director)</option>
          <option value="EXECUTION_OFFICER">مسؤول التنفيذ (Execution Officer)</option>
        </select>
      </div>
      <header
`;
content = content.replace('      <header', roleSwitcher);

// 3. Define capability checks
const checks = `
  const isCaseManager = currentRole === "CASE_MANAGER" || currentRole === "ADMIN";
  const isExecDirector = currentRole === "EXECUTIVE_DIRECTOR" || currentRole === "ADMIN";
  const isExecOfficer = currentRole === "EXECUTION_OFFICER" || currentRole === "ADMIN";

  const lc = lifecycleMap[caseData.lifecycleStatus] || { label: caseData.lifecycleStatus, color: "bg-surface-container" };
`;
content = content.replace(
  '  const lc = lifecycleMap[caseData.lifecycleStatus]',
  checks
);

// 4. Wrap action blocks
// Since replacing large nested html blocks inside jsx is hard with replace string exactly, I'll use regex or split blocks.

// For CASE_MANAGER:
content = content.replace(
  `{caseData.lifecycleStatus === 'DRAFT' && (`,
  `{isCaseManager && caseData.lifecycleStatus === 'DRAFT' && (`
);
content = content.replace(
  `{caseData.lifecycleStatus === 'INTAKE_REVIEW' && (`,
  `{isCaseManager && caseData.lifecycleStatus === 'INTAKE_REVIEW' && (`
);
content = content.replace(
  `{caseData.lifecycleStatus === 'FIELD_VERIFICATION' && (`,
  `{isCaseManager && caseData.lifecycleStatus === 'FIELD_VERIFICATION' && (`
);

// For EXECUTIVE_DIRECTOR:
content = content.replace(
  `{caseData.lifecycleStatus === 'COMMITTEE_REVIEW' && (`,
  `{isExecDirector && caseData.lifecycleStatus === 'COMMITTEE_REVIEW' && (`
);

// For EXECUTION_OFFICER:
content = content.replace(
  `{caseData.lifecycleStatus === 'APPROVED' && (`,
  `{isExecOfficer && caseData.lifecycleStatus === 'APPROVED' && (`
);
content = content.replace(
  `{caseData.lifecycleStatus === 'IN_PROGRESS' && (`,
  `{isExecOfficer && caseData.lifecycleStatus === 'IN_PROGRESS' && (`
);

fs.writeFileSync(file, content);
console.log('RBAC applied');
