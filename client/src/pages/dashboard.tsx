import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { UsersTab } from "@/components/dashboard/users-tab";
import { DownloadsTab } from "@/components/dashboard/downloads-tab";
import { FilesTab } from "@/components/dashboard/files-tab";
import { LogsTab } from "@/components/dashboard/logs-tab";
import { SettingsTab } from "@/components/dashboard/settings-tab";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

type TabType = "users" | "downloads" | "files" | "logs" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "users":
        return <UsersTab />;
      case "downloads":
        return <DownloadsTab />;
      case "files":
        return <FilesTab />;
      case "logs":
        return <LogsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <UsersTab />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header activeTab={activeTab} />
        
        <main className="flex-1 p-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
