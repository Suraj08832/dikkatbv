import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Youtube, Music, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface SystemSettings {
  rateLimit?: number;
  maxFileSize?: string;
  downloadTimeout?: number;
  enableAuth?: boolean;
  cleanupDays?: number;
  maxStorage?: number;
  autoCleanup?: boolean;
  youtubeEnabled?: boolean;
  spotifyEnabled?: boolean;
  instagramEnabled?: boolean;
}

export function SettingsTab() {
  const [settings, setSettings] = useState<SystemSettings>({
    rateLimit: 60,
    maxFileSize: "100MB",
    downloadTimeout: 300,
    enableAuth: true,
    cleanupDays: 30,
    maxStorage: 70,
    autoCleanup: true,
    youtubeEnabled: true,
    spotifyEnabled: true,
    instagramEnabled: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    retry: false,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingData: { key: string; value: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/settings", settingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = async () => {
    const settingsToSave = [
      { key: "rateLimit", value: settings.rateLimit?.toString() || "60", description: "API rate limit per minute" },
      { key: "maxFileSize", value: settings.maxFileSize || "100MB", description: "Maximum file size for downloads" },
      { key: "downloadTimeout", value: settings.downloadTimeout?.toString() || "300", description: "Download timeout in seconds" },
      { key: "enableAuth", value: settings.enableAuth?.toString() || "true", description: "Enable API authentication" },
      { key: "cleanupDays", value: settings.cleanupDays?.toString() || "30", description: "Days before files are eligible for cleanup" },
      { key: "maxStorage", value: settings.maxStorage?.toString() || "70", description: "Maximum storage in GB" },
      { key: "autoCleanup", value: settings.autoCleanup?.toString() || "true", description: "Automatically cleanup old files" },
      { key: "youtubeEnabled", value: settings.youtubeEnabled?.toString() || "true", description: "Enable YouTube downloads" },
      { key: "spotifyEnabled", value: settings.spotifyEnabled?.toString() || "true", description: "Enable Spotify downloads" },
      { key: "instagramEnabled", value: settings.instagramEnabled?.toString() || "true", description: "Enable Instagram downloads" },
    ];

    for (const setting of settingsToSave) {
      updateSettingsMutation.mutate(setting);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">System Settings</h3>
          <p className="text-slate-600">Configure system parameters and API integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rateLimit" className="text-sm font-medium text-slate-700">
                Rate Limit (requests/minute)
              </Label>
              <Input
                id="rateLimit"
                type="number"
                value={settings.rateLimit}
                onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) || 60 })}
                className="mt-1"
                data-testid="input-rate-limit"
              />
            </div>
            <div>
              <Label htmlFor="maxFileSize" className="text-sm font-medium text-slate-700">
                Max File Size
              </Label>
              <Select
                value={settings.maxFileSize}
                onValueChange={(value) => setSettings({ ...settings, maxFileSize: value })}
              >
                <SelectTrigger className="mt-1" data-testid="select-max-file-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100MB">100 MB</SelectItem>
                  <SelectItem value="250MB">250 MB</SelectItem>
                  <SelectItem value="500MB">500 MB</SelectItem>
                  <SelectItem value="1GB">1 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="downloadTimeout" className="text-sm font-medium text-slate-700">
                Download Timeout (seconds)
              </Label>
              <Input
                id="downloadTimeout"
                type="number"
                value={settings.downloadTimeout}
                onChange={(e) => setSettings({ ...settings, downloadTimeout: parseInt(e.target.value) || 300 })}
                className="mt-1"
                data-testid="input-download-timeout"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="enableAuth"
                checked={settings.enableAuth}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAuth: checked })}
                data-testid="switch-enable-auth"
              />
              <Label htmlFor="enableAuth" className="text-sm text-slate-700">
                Enable API Authentication
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Youtube className="h-5 w-5 text-red-500" />
                <span className="font-medium text-slate-900">YouTube</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
                <Switch
                  checked={settings.youtubeEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, youtubeEnabled: checked })}
                  data-testid="switch-youtube-enabled"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Music className="h-5 w-5 text-green-500" />
                <span className="font-medium text-slate-900">Spotify</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-yellow-600">Limited</span>
                <Switch
                  checked={settings.spotifyEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, spotifyEnabled: checked })}
                  data-testid="switch-spotify-enabled"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Instagram className="h-5 w-5 text-pink-500" />
                <span className="font-medium text-slate-900">Instagram</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">Connected</span>
                <Switch
                  checked={settings.instagramEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, instagramEnabled: checked })}
                  data-testid="switch-instagram-enabled"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cleanupDays" className="text-sm font-medium text-slate-700">
                Storage Cleanup (days)
              </Label>
              <Input
                id="cleanupDays"
                type="number"
                value={settings.cleanupDays}
                onChange={(e) => setSettings({ ...settings, cleanupDays: parseInt(e.target.value) || 30 })}
                className="mt-1"
                data-testid="input-cleanup-days"
              />
              <p className="text-xs text-slate-500 mt-1">Files older than this will be eligible for cleanup</p>
            </div>
            <div>
              <Label htmlFor="maxStorage" className="text-sm font-medium text-slate-700">
                Max Storage (GB)
              </Label>
              <Input
                id="maxStorage"
                type="number"
                value={settings.maxStorage}
                onChange={(e) => setSettings({ ...settings, maxStorage: parseInt(e.target.value) || 70 })}
                className="mt-1"
                data-testid="input-max-storage"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoCleanup"
                checked={settings.autoCleanup}
                onCheckedChange={(checked) => setSettings({ ...settings, autoCleanup: checked })}
                data-testid="switch-auto-cleanup"
              />
              <Label htmlFor="autoCleanup" className="text-sm text-slate-700">
                Auto cleanup old files
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Version</span>
              <span className="font-medium" data-testid="text-system-version">v2.1.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Uptime</span>
              <span className="font-medium" data-testid="text-system-uptime">7 days, 14 hours</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">CPU Usage</span>
              <span className="font-medium" data-testid="text-cpu-usage">23%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Memory Usage</span>
              <span className="font-medium" data-testid="text-memory-usage">1.2 GB / 4 GB</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Database Size</span>
              <span className="font-medium" data-testid="text-database-size">245 MB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
          data-testid="button-save-settings"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
