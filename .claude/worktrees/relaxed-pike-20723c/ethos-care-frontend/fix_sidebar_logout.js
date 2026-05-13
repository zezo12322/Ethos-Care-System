const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const logoutBtn = `      {/* Logout button */}
      <div className="mt-4 pt-4 border-t border-emerald-800/50">
        <button
          onClick={() => {
            import("js-cookie").then((Cookies) => {
              Cookies.default.remove("access_token");
              window.location.href = "/login";
            });
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors hover:bg-red-900/20 rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>تسجيل خروج</span>
        </button>
      </div>
      {/* Bottom version badge inside sidebar */}`;

if (!content.includes('تسجيل خروج')) {
  content = content.replace('{/* Bottom version badge inside sidebar */}', logoutBtn);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
  console.log('Logout button added to Sidebar');
}
