import { useAuth } from "@/hooks/use-auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { useLocation } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
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
