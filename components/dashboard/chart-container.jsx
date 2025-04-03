"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ErrorMessage from "@/components/shared/error-message";

export default function ChartContainer({
  title,
  description,
  children,
  loading = false,
  error = null,
  timeRanges = ['7D', '30D', '3M', '1Y', 'ALL'],
  selectedRange = '30D',
  onRangeChange,
  downloadOptions,
  onDownload,
  className,
  cardClassName,
}) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="flex flex-col space-y-0 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        
        <div className="flex items-center gap-2 pt-4 sm:pt-0">
          {timeRanges && onRangeChange && (
            <div className="flex items-center gap-2">
              {timeRanges.map((range) => (
                <Button
                  key={range}
                  variant={selectedRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRangeChange(range)}
                  className="h-8 text-xs"
                >
                  {range}
                </Button>
              ))}
            </div>
          )}
          
          {downloadOptions && onDownload && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:text-xs">
                    Export
                  </span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {downloadOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onDownload(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={className}>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="py-10">
            <ErrorMessage 
              title="Gagal memuat data" 
              description={error} 
            />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}