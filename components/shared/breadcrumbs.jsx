// components/shared/breadcrumbs.jsx
"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items = [], className = "" }) {
  return (
    <nav className={`mb-6 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.href || item.link}-${index}`} className="flex items-center">
            {index !== 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
            {index === 0 && <Home className="mr-2 h-4 w-4" />}
            {item.current ? (
              <span className="font-medium text-foreground">{item.label || item.title}</span>
            ) : (
              <Link
                href={item.href || item.link || "#"}
                className="hover:text-foreground transition-colors"
              >
                {item.label || item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}