import { useState } from "react";
import { cn } from "@/lib/utils";
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

export type TabName = "dashboard" | "business" | "qrcode" | "links" | "analytics";

interface SidebarNavProps {
  onLogout: () => void;
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
}

export function SidebarNav({ onLogout, activeTab, setActiveTab }: SidebarNavProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const tabs = [
    {
      name: "Dashboard",
      id: "dashboard" as TabName,
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      name: "Business Info",
      id: "business" as TabName,
      icon: <Briefcase className="h-5 w-5 mr-2" />,
    },
    {
      name: "QR Code",
      id: "qrcode" as TabName,
      icon: <QrCode className="h-5 w-5 mr-2" />,
    },
    {
      name: "Links",
      id: "links" as TabName,
      icon: <Link className="h-5 w-5 mr-2" />,
    },
    {
      name: "Analytics",
      id: "analytics" as TabName,
      icon: <ChartBar className="h-5 w-5 mr-2" />,
    },
  ];
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleTabClick = (tab: TabName) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
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
            <li key={tab.id}>
              <button 
                className={cn(
                  "flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700 w-full text-left",
                  activeTab === tab.id ? "bg-gray-700" : ""
                )}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.icon}
                {tab.name}
              </button>
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
