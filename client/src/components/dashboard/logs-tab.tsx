import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, List, AlertCircle, AlertTriangle, BarChart3 } from "lucide-react";

export function LogsTab() {
  const [levelFilter, setLevelFilter] = useState("all");

  // Fetch logs
  const { data: logs, isLoading: logsLoading, refetch } = useQuery({
    queryKey: ["/api/logs"],
    retry: false,
  });

  const getLogBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return <Badge variant="destructive">ERROR</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      case "info":
        return <Badge className="bg-green-100 text-green-800">INFO</Badge>;
      case "debug":
        return <Badge variant="secondary">DEBUG</Badge>;
      default:
        return <Badge variant="secondary">{level.toUpperCase()}</Badge>;
    }
  };

  const getLogColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "bg-red-50 border-l-red-500";
      case "warning":
        return "bg-yellow-50 border-l-yellow-500";
      case "info":
        return "bg-green-50 border-l-green-500";
      case "debug":
        return "bg-slate-50 border-l-slate-500";
      default:
        return "bg-slate-50 border-l-slate-500";
    }
  };

  const getLogIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-green-500";
      case "debug":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' UTC';
  };

  if (logsLoading) {
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

  const filteredLogs = logs?.filter((log: any) => {
    return levelFilter === "all" || log.level.toLowerCase() === levelFilter;
  }) || [];

  // Calculate log stats
  const logStats = logs?.reduce((acc: any, log: any) => {
    acc.total++;
    acc[log.level.toLowerCase()] = (acc[log.level.toLowerCase()] || 0) + 1;
    return acc;
  }, { total: 0, error: 0, warning: 0, info: 0, debug: 0 }) || { total: 0, error: 0, warning: 0, info: 0, debug: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">System Logs</h3>
          <p className="text-slate-600">Monitor system activity and troubleshoot issues</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-refresh-logs"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Logs Today</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-total-logs">
                  {logStats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <List className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Errors</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-errors">
                  {logStats.error}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Warnings</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-warnings">
                  {logStats.warning}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">API Calls</p>
                <p className="text-2xl font-semibold text-slate-900" data-testid="text-api-calls">
                  {logStats.info}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <List className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No logs found</p>
              <p className="text-sm text-slate-500">System logs will appear here as activity occurs</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLogs.map((log: any) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${getLogColor(log.level)}`}
                  data-testid={`log-entry-${log.id}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getLogIcon(log.level)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{log.message}</p>
                      {getLogBadge(log.level)}
                    </div>
                    <div className="mt-1">
                      {log.details && (
                        <p className="text-sm text-slate-600">{log.details}</p>
                      )}
                      {log.userEmail && (
                        <p className="text-sm text-slate-600">User: {log.userEmail}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
