import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./layout";
import Dashboard from "./dashboard";
import BusinessInfo from "./business-info";
import QrCode from "./qr-code";
import Links from "./links";
import Analytics from "./analytics";

type TabName = "dashboard" | "business" | "qrcode" | "links" | "analytics";

export default function AdminDashboard() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");
  
  // Extract tab from URL hash if present
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["dashboard", "business", "qrcode", "links", "analytics"].includes(hash)) {
      setActiveTab(hash as TabName);
    }
  }, [location]);
  
  // Update URL hash when tab changes
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  const renderTabContent = () => {
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout>
      {renderTabContent()}
    </AdminLayout>
  );
}
