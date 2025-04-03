"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function useFiltering(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize from URL query parameters
  useEffect(() => {
    const newFilters = {};
    const searchParam = searchParams.get('search');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    // Extract filter parameters from URL
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page' && key !== 'pageSize' && key !== 'sort' && key !== 'direction' && key !== 'search') {
        // Handle array-like values (e.g., filter=value1,value2,value3)
        if (value && value.includes(',')) {
          newFilters[key] = value.split(',');
        } else {
          newFilters[key] = value;
        }
      }
    }
    
    setFilters(newFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters, newSearchQuery) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filter params first
    for (const [key, _] of searchParams.entries()) {
      if (key !== 'page' && key !== 'pageSize' && key !== 'sort' && key !== 'direction') {
        params.delete(key);
      }
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Add new search query if any
    if (newSearchQuery) {
      params.set('search', newSearchQuery);
    } else {
      params.delete('search');
    }
    
    // Add new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Handle filter change
  const onFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters };
    
    if (value === null || value === undefined || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    updateURL(newFilters, searchQuery);
  }, [filters, searchQuery, updateURL]);

  // Handle search query change
  const onSearchChange = useCallback((query) => {
    setSearchQuery(query);
    updateURL(filters, query);
  }, [filters, updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    updateURL({}, '');
  }, [updateURL]);

  return {
    filters,
    searchQuery,
    onFilterChange,
    onSearchChange,
    clearFilters,
    filterOptions: filters,
  };
}