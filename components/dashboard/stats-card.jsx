"use client";

import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatsCard({
  title,
  value,
  previousValue,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
  valueClassName,
  iconClassName,
}) {
  
  // Calculate trend if not provided but have previous value
  const calculatedTrend = trend || (() => {
    if (!previousValue || !value) return null;
    if (value > previousValue) return "up";
    if (value < previousValue) return "down";
    return "neutral";
  })();
  
  // Calculate trend value if not provided
  const calculatedTrendValue = trendValue || (() => {
    if (!previousValue || !value) return null;
    if (previousValue === 0) return 100;
    
    const percentageChange = ((value - previousValue) / Math.abs(previousValue)) * 100;
    return Math.abs(parseFloat(percentageChange.toFixed(1)));
  })();
  
  // Trend color 
  const trendColorClass = {
    up: "text-emerald-500",
    down: "text-rose-500",
    neutral: "text-slate-500",
  };
  
  // Trend icon
  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[calculatedTrend];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2 truncate" title={value}>
          {value}
        </div>
        
        {(calculatedTrend && calculatedTrendValue !== null) && (
          <div className="flex items-center text-xs">
            <TrendIcon className={cn("mr-1 h-3 w-3", trendColorClass[calculatedTrend])} />
            <span className={cn("font-medium", trendColorClass[calculatedTrend])}>
              {calculatedTrendValue}%
            </span>
            <span className="ml-1 text-muted-foreground">{description}</span>
          </div>
        )}
        
        {(!calculatedTrend || calculatedTrendValue === null) && description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}