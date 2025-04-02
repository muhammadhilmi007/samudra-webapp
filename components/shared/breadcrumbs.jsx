"use client"

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Breadcrumbs({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)}>
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li className="flex items-center">
          <Link 
            href="/dashboard" 
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              
              {isLast || !item.link ? (
                <span 
                  className={cn(
                    "font-medium",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.title}
                </span>
              ) : (
                <Link 
                  href={item.link} 
                  className="hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}