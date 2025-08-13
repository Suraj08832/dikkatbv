import { Users, Download, Folder, List, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type TabType = "users" | "downloads" | "files" | "logs" | "settings";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();

  const navItems = [
    {
      id: "users" as TabType,
      label: "Users & API Keys",
      icon: Users,
    },
    {
      id: "downloads" as TabType,
      label: "Download Requests",
      icon: Download,
    },
    {
      id: "files" as TabType,
      label: "File Management",
      icon: Folder,
    },
    {
      id: "logs" as TabType,
      label: "System Logs",
      icon: List,
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-semibold" data-testid="text-app-title">Media DL Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Admin Dashboard</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                  data-testid={`button-nav-${item.id}`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
            alt="User Profile" 
            className="w-10 h-10 rounded-full object-cover"
            data-testid="img-user-avatar"
          />
          <div className="ml-3 min-w-0 flex-1">
            <p className="font-medium truncate" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'Admin User'
              }
            </p>
            <p className="text-slate-400 text-sm truncate" data-testid="text-user-email">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => window.location.href = '/api/logout'}
          className="w-full mt-3 text-sm text-slate-400 hover:text-white transition-colors text-left"
          data-testid="button-logout"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
