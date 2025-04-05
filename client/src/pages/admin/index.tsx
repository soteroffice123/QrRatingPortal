import { useState } from "react";
import Dashboard from "./dashboard";
import BusinessInfo from "./business-info";
import QrCode from "./qr-code";
import Links from "./links";
import Analytics from "./analytics";
import Users from "./users";
import { SidebarNav, TabName } from "@/components/sidebar-nav";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { logoutMutation, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isAdmin = user?.isAdmin || false;

  const renderTabContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {(() => {
            switch (activeTab) {
              case "dashboard":
                return <Dashboard />;
              case "business":
                return <BusinessInfo />;
              case "qrcode":
                return <QrCode />;
              case "links":
                return <Links />;
              case "analytics":
                return <Analytics />;
              case "users":
                return isAdmin ? <Users /> : <Dashboard />;
              default:
                return <Dashboard />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <SidebarNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {renderTabContent()}
      </main>
    </div>
  );
}
