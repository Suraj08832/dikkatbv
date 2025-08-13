import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, LoaderPinwheel, CheckCircle, XCircle, RefreshCw, Play, Square, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DownloadsTab() {
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch download stats
  const { data: downloadStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/downloads"],
    retry: false,
  });

  // Fetch download requests
  const { data: downloads, isLoading: downloadsLoading, refetch } = useQuery({
    queryKey: ["/api/download-requests"],
    retry: false,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <LoaderPinwheel className="h-3 w-3 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return "🔴"; // YouTube red
      case "spotify":
        return "🟢"; // Spotify green  
      case "instagram":
        return "🟣"; // Instagram purple
      default:
        return "📁";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (statsLoading || downloadsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredDownloads = downloads?.filter((download: any) => {
    const platformMatch = platformFilter === "all" || download.platform === platformFilter;
    const statusMatch = statusFilter === "all" || download.status === statusFilter;
    return platformMatch && statusMatch;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Download Requests</h3>
          <p className="text-slate-600">Monitor and manage download requests across all platforms</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-refresh-downloads"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Download Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Downloads</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-total-downloads">
                  {downloadStats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">In Progress</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-in-progress">
                  {downloadStats?.inProgress || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LoaderPinwheel className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Completed Today</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-completed-today">
                  {downloadStats?.completedToday || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Failed</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-failed">
                  {downloadStats?.failed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Downloads</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDownloads.length === 0 ? (
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No download requests found</p>
              <p className="text-sm text-slate-500">Download requests will appear here when users make requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.map((download: any) => (
                  <TableRow key={download.id} data-testid={`row-download-${download.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-lg">
                          {getPlatformIcon(download.platform)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {download.title || "Untitled"}
                          </p>
                          <p className="text-sm text-slate-600 truncate max-w-xs">
                            {download.url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-900 capitalize">
                          {download.platform}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">{download.userEmail || "Unknown"}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(download.status)}
                    </TableCell>
                    <TableCell>
                      {download.status === "in_progress" ? (
                        <div className="space-y-1">
                          <Progress value={download.progress || 0} className="w-20" />
                          <p className="text-xs text-slate-500">{download.progress || 0}%</p>
                        </div>
                      ) : download.status === "completed" ? (
                        <div className="space-y-1">
                          <Progress value={100} className="w-20" />
                          <p className="text-xs text-slate-500">100%</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">
                        {formatFileSize(download.fileSize)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">
                        {formatTimeAgo(download.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {download.status === "in_progress" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-stop-${download.id}`}
                          >
                            <Square className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        {download.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid={`button-download-${download.id}`}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-${download.id}`}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-delete-${download.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
