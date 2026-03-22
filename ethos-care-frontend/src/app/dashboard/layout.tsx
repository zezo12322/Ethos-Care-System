import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="mr-64 flex-1 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
