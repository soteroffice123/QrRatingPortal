import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  QrCode, 
  Link, 
  ChartBar, 
  LogOut,
  Menu 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarNavProps {
  onLogout: () => void;
}

export function SidebarNav({ onLogout }: SidebarNavProps) {
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const tabs = [
    {
      name: "Dashboard",
      hash: "dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      name: "Business Info",
      hash: "business",
      icon: <Briefcase className="h-5 w-5 mr-2" />,
    },
    {
      name: "QR Code",
      hash: "qrcode",
      icon: <QrCode className="h-5 w-5 mr-2" />,
    },
    {
      name: "Links",
      hash: "links",
      icon: <Link className="h-5 w-5 mr-2" />,
    },
    {
      name: "Analytics",
      hash: "analytics",
      icon: <ChartBar className="h-5 w-5 mr-2" />,
    },
  ];
  
  const activeTab = location.includes("#") 
    ? location.split("#")[1] 
    : "dashboard";
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <aside className="w-full md:w-64 bg-gray-800 text-white md:min-h-screen relative">
      <div className="p-4 flex justify-between items-center md:block">
        <h1 className="text-xl font-bold">Feedback QR</h1>
        <button 
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <nav className={cn(
        "mt-5 md:block",
        showMobileMenu ? "block" : "hidden"
      )}>
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.hash}>
              <a 
                href={`#${tab.hash}`}
                className={cn(
                  "flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700",
                  activeTab === tab.hash ? "bg-gray-700" : ""
                )}
                onClick={() => setShowMobileMenu(false)}
              >
                {tab.icon}
                {tab.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={cn(
        "mt-auto p-4 border-t border-gray-700 md:absolute md:bottom-0 md:w-64",
        showMobileMenu ? "block" : "hidden md:block"
      )}>
        <Button 
          variant="ghost"
          className="flex items-center text-gray-300 hover:text-white w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
