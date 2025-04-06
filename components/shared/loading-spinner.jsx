// components/shared/loading-spinner.jsx
"use client";

import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} 
      />
    </div>
  );
}
