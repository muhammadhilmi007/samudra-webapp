"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize from URL query parameters
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    
    if (pageParam && !isNaN(parseInt(pageParam))) {
      setPage(parseInt(pageParam));
    }
    
    if (pageSizeParam && !isNaN(parseInt(pageSizeParam))) {
      setPageSize(parseInt(pageSizeParam));
    }
  }, [searchParams]);

  // Update total pages when total items or page size changes
  useEffect(() => {
    setTotalPages(Math.ceil(totalItems / pageSize) || 1);
  }, [totalItems, pageSize]);

  // Ensure page is within valid range
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    } else if (page < 1) {
      setPage(1);
    }
  }, [page, totalPages]);

  // Update URL when page or pageSize changes
  const updateURL = useCallback((newPage, newPageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.set('page', newPage.toString());
    params.set('pageSize', newPageSize.toString());
    
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Handle page change
  const onPageChange = useCallback((newPage) => {
    setPage(newPage);
    updateURL(newPage, pageSize);
  }, [pageSize, updateURL]);

  // Handle page size change
  const onPageSizeChange = useCallback((newPageSize) => {
    // When changing page size, go back to first page
    setPageSize(newPageSize);
    setPage(1);
    updateURL(1, newPageSize);
  }, [updateURL]);

  return {
    page,
    setPage: onPageChange,
    pageSize,
    setPageSize: onPageSizeChange,
    totalItems,
    setTotalItems,
    totalPages,
    pagination: {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages,
    },
    paginationControls: {
      onPageChange,
      onPageSizeChange,
    },
  };
}