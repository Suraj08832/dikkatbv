import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { File, Music, Video, Image, Clock, Fan, Download, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

export function FilesTab() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Fetch storage stats
  const { data: storageStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/storage"],
    retry: false,
  });

  // Fetch download requests (completed files)
  const { data: downloads, isLoading: filesLoading } = useQuery({
    queryKey: ["/api/download-requests"],
    retry: false,
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'm4a':
        return <Music className="h-6 w-6 text-red-600" />;
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
        return <Video className="h-6 w-6 text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-6 w-6 text-green-600" />;
      default:
        return <File className="h-6 w-6 text-slate-600" />;
    }
  };

  const getFileTypeBadge = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    if (['mp3', 'wav', 'flac', 'm4a'].includes(extension || '')) {
      return <Badge className="bg-red-100 text-red-800">Audio {extension?.toUpperCase()}</Badge>;
    }
    if (['mp4', 'avi', 'mkv', 'mov'].includes(extension || '')) {
      return <Badge className="bg-blue-100 text-blue-800">Video {extension?.toUpperCase()}</Badge>;
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Badge className="bg-green-100 text-green-800">Image {extension?.toUpperCase()}</Badge>;
    }
    return <Badge variant="secondary">{extension?.toUpperCase() || 'Unknown'}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatStorageSize = (bytes: number) => {
    if (!bytes) return "0 GB";
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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

  if (statsLoading || filesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedFiles = downloads?.filter((download: any) => download.status === "completed") || [];
  
  const filteredFiles = completedFiles.filter((file: any) => {
    if (typeFilter === "all") return true;
    
    const extension = file.fileName?.split('.').pop()?.toLowerCase();
    switch (typeFilter) {
      case "audio":
        return ['mp3', 'wav', 'flac', 'm4a'].includes(extension || '');
      case "video":
        return ['mp4', 'avi', 'mkv', 'mov'].includes(extension || '');
      case "image":
        return ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '');
      default:
        return true;
    }
  });

  const storageUsedGB = storageStats?.totalSize ? storageStats.totalSize / (1024 * 1024 * 1024) : 0;
  const storageLimitGB = 70; // Assuming 70GB limit
  const storagePercentage = (storageUsedGB / storageLimitGB) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">File Management</h3>
          <p className="text-slate-600">Manage downloaded files and storage usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            data-testid="button-cleanup-files"
          >
            <Fan className="h-4 w-4 mr-2" />
            Cleanup Old Files
          </Button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">Total Storage Used</p>
              </div>
              <p className="text-2xl font-semibold text-slate-900" data-testid="text-storage-used">
                {formatStorageSize(storageStats?.totalSize || 0)}
              </p>
              <div className="space-y-2">
                <Progress value={storagePercentage} className="h-2" />
                <p className="text-xs text-slate-500">
                  {storagePercentage.toFixed(1)}% of {storageLimitGB} GB limit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Files Count</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-file-count">
                  {storageStats?.totalFiles || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <File className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Cleanup Eligible</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-cleanup-eligible">
                  {storageStats?.cleanupEligible || 0}
                </p>
                <p className="text-xs text-slate-500">Files older than 30 days</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>File Storage</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="size">Sort by Size</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No files found</p>
              <p className="text-sm text-slate-500">Completed downloads will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file: any) => (
                  <TableRow key={file.id} data-testid={`row-file-${file.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.fileName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {file.fileName || "Unknown file"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {file.filePath || "/downloads/"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getFileTypeBadge(file.fileName)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">{file.userEmail || "Unknown"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">1</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900">
                        {formatTimeAgo(file.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-download-file-${file.id}`}
                        >
                          <Download className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-file-${file.id}`}
                        >
                          <Eye className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-delete-file-${file.id}`}
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
