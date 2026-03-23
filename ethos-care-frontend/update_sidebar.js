const fs = require('fs');

let pageContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Replace the string to add News
if (!pageContent.includes('{ name: "الأخبار", href: "/dashboard/news", icon: "newspaper" }')) {
  pageContent = pageContent.replace('{ name: "شركاء النجاح", href: "/dashboard/partners", icon: "handshake" },', '{ name: "شركاء النجاح", href: "/dashboard/partners", icon: "handshake" },\n    { name: "الأخبار", href: "/dashboard/news", icon: "newspaper" },');
  fs.writeFileSync('src/components/layout/Sidebar.tsx', pageContent);
  console.log("Updated sidebar");
} else {
  console.log("Already updated");
}

