"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const DashboardStats = ({ title, value, description, status, icon, loading }) => {
  // Determine badge variant based on status
  const getBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
      case "active":
        return "success";
      case "warning":
      case "pending":
        return "warning";
      case "error":
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {status && (
        <CardFooter>
          <Badge variant={getBadgeVariant(status)}>{status}</Badge>
        </CardFooter>
      )}
    </Card>
  );
};

export default DashboardStats;