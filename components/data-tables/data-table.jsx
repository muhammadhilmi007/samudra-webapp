"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Filter, ArrowUp, ArrowDown } from "lucide-react";
import TablePagination from "./table-pagination";
import TableFilters from "./table-filters";
import TableActions from "./table-actions";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  error = null,
  pagination = null,
  filters = [],
  searchPlaceholder = "Cari...",
  searchFields = [],
  actions = null,
  rowActions = null,
  emptyMessage = "Tidak ada data",
  searchValue = "",
  onSearchChange = () => {},
  onFilterChange = () => {},
  onPageChange = () => {},
  onRowClick = null,
  onSortChange = () => {},
  sortField = null,
  sortDirection = "asc",
  actionsPosition = "top",
  containerClassName = "",
  tableClassName = "",
  selectedRows = [],
  onRowSelect = null,
  isSelectable = false,
  handleBulkAction = null,
  bulkActions = [],
}) {
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const [activeFilters, setActiveFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Update internal search state when prop changes
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue]);

  // Handle local search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  // Handle local filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters };

    if (value === null || value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    setActiveFilters(newFilters);
    setHasActiveFilters(Object.keys(newFilters).length > 0);
    onFilterChange(newFilters);
  };

  // Handle sorting
  const handleSort = (columnKey) => {
    const direction =
      sortField === columnKey && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(columnKey, direction);
  };

  // Handle filter clearing
  const clearFilters = () => {
    setActiveFilters({});
    setHasActiveFilters(false);
    setSearchQuery("");
    onSearchChange("");
    onFilterChange({});
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination) return null;

    return (
      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={onPageChange}
      />
    );
  };

  // Render table header
  const renderTableHeader = () => {
    return (
      <TableHeader>
        <TableRow>
          {isSelectable && (
            <TableHead className="w-10">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    // Select all rows
                    onRowSelect(data.map((row) => row.id || row._id));
                  } else {
                    // Deselect all rows
                    onRowSelect([]);
                  }
                }}
                checked={
                  selectedRows.length > 0 && selectedRows.length === data.length
                }
              />
            </TableHead>
          )}

          {columns.map((column) => (
            <TableHead
              key={column.accessorKey || column.id}
              className={cn(
                column.className,
                column.sortable && "cursor-pointer hover:text-foreground"
              )}
              onClick={() => column.sortable && handleSort(column.accessorKey || column.id)}
            >
              <div className="flex items-center">
                {column.header}
                {column.sortable &&
                  sortField === column.field &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-1 h-4 w-4" />
                  ))}
              </div>
            </TableHead>
          ))}

          {rowActions && <TableHead className="text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
    );
  };

  // Render table rows
  const renderTableRows = () => {
    // Show loading state
    if (loading) {
      return (
        <TableRow key="loading-state">
          <TableCell
            colSpan={
              columns.length + (rowActions ? 1 : 0) + (isSelectable ? 1 : 0)
            }
            className="h-40 text-center"
          >
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    // Show error state
    if (error) {
      return (
        <TableRow key="error-state">
          <TableCell
            colSpan={
              columns.length + (rowActions ? 1 : 0) + (isSelectable ? 1 : 0)
            }
            className="h-40 text-center text-red-500"
          >
            <div>Error: {error}</div>
          </TableCell>
        </TableRow>
      );
    }

    // Show empty state
    if (!data || data.length === 0) {
      return (
        <TableRow key="empty-state">
          <TableCell
            colSpan={
              columns.length + (rowActions ? 1 : 0) + (isSelectable ? 1 : 0)
            }
            className="h-40 text-center text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      );
    }

    // Render data rows
    return data.map((row, rowIndex) => (
      <TableRow
        key={row.id || row._id || rowIndex}
        className={cn(
          onRowClick && "cursor-pointer hover:bg-muted/40",
          selectedRows.includes(row.id || row._id) && "bg-blue-50"
        )}
        onClick={() => onRowClick && onRowClick(row)}
      >
        {isSelectable && (
          <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={selectedRows.includes(row.id || row._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onRowSelect([...selectedRows, row.id || row._id]);
                } else {
                  onRowSelect(
                    selectedRows.filter((id) => id !== (row.id || row._id))
                  );
                }
              }}
            />
          </TableCell>
        )}

        {columns.map((column) => (
          <TableCell key={column.accessorKey || column.id} className={column.cellClassName}>
            {column.render ? column.render(row, rowIndex) : row[column.accessorKey]}
          </TableCell>
        ))}

        {rowActions && (
          <TableCell
            className="text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <TableActions actions={rowActions} row={row} rowIndex={rowIndex} />
          </TableCell>
        )}
      </TableRow>
    ));
  };

  // Render table controls (search, filters, actions)
  const renderTableControls = () => {
    const hasControls =
      searchFields.length > 0 || filters.length > 0 || actions;
    if (!hasControls) return null;

    return (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          {searchFields.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full pl-9 sm:w-[260px]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchQuery("");
                    onSearchChange("");
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <TableFilters
              filters={filters}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Clear filters button */}
          {(hasActiveFilters || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>

        {/* Table actions */}
        {actionsPosition === "top" && actions && (
          <div className="flex flex-wrap items-center gap-2">
            {Array.isArray(actions)
              ? actions.map((action, i) => (
                  <Button
                    key={i}
                    variant={action.variant || "default"}
                    size={action.size || "default"}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={action.className}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                ))
              : actions}
          </div>
        )}

        {/* Bulk actions */}
        {isSelectable && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} item dipilih
            </span>
            {bulkActions &&
              bulkActions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={() => handleBulkAction(action.value, selectedRows)}
                >
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={containerClassName}>
      {/* Table controls */}
      {renderTableControls()}

      {/* Table */}
      <div className="bg-white rounded-md border shadow-sm">
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            {renderTableHeader()}
            <TableBody>{renderTableRows()}</TableBody>
          </Table>
        </div>
      </div>

      {/* Bottom pagination */}
      {renderPagination()}

      {/* Bottom actions */}
      {actionsPosition === "bottom" && actions && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {Array.isArray(actions)
            ? actions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant || "default"}
                  size={action.size || "default"}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={action.className}
                >
                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              ))
            : actions}
        </div>
      )}
    </div>
  );
}
