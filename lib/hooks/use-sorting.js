"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function useSorting(initialSortField = '', initialSortDirection = 'asc') {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize from URL query parameters
  useEffect(() => {
    const sortParam = searchParams.get('sort');
    const directionParam = searchParams.get('direction');
    
    if (sortParam) {
      setSortField(sortParam);
    }
    
    if (directionParam && ['asc', 'desc'].includes(directionParam)) {
      setSortDirection(directionParam);
    }
  }, [searchParams]);

  // Update URL when sort parameters change
  const updateURL = useCallback((newSortField, newSortDirection) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSortField) {
      params.set('sort', newSortField);
      params.set('direction', newSortDirection);
    } else {
      params.delete('sort');
      params.delete('direction');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Handle sort change
  const onSortChange = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    updateURL(field, direction);
  }, [updateURL]);

  // Toggle sort direction for a field
  const toggleSort = useCallback((field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  }, [sortField, sortDirection, onSortChange]);

  return {
    sortField,
    sortDirection,
    onSortChange,
    toggleSort,
    sortOptions: {
      sortField,
      sortDirection,
    },
  };
}