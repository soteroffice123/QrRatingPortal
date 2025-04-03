import { SidebarNav } from "@/components/sidebar-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Since we no longer have login functionality, provide an empty function
  const handleLogout = () => {
    // This function now does nothing
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <SidebarNav onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
