"use client";

import { Fragment } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, Filter, Check, Calendar 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TableFilters({ 
  filters, 
  activeFilters = {}, 
  onFilterChange 
}) {
  // Calculate active filter count
  const activeFilterCount = Object.keys(activeFilters).length;

  // Render different filter types
  const renderFilterContent = (filter) => {
    switch (filter.type) {
      case "select":
        return renderSelectFilter(filter);
      case "multiselect":
        return renderMultiselectFilter(filter);
      case "boolean":
        return renderBooleanFilter(filter);
      case "date":
        return renderDateFilter(filter);
      case "dateRange":
        return renderDateRangeFilter(filter);
      case "text":
        return renderTextFilter(filter);
      default:
        return null;
    }
  };

  // Render select filter
  const renderSelectFilter = (filter) => {
    const currentValue = activeFilters[filter.field] || "";

    return (
      <DropdownMenuRadioGroup
        value={currentValue}
        onValueChange={(value) => onFilterChange(filter.field, value)}
      >
        {filter.options.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            className={cn(
              option.value === currentValue && "font-medium"
            )}
          >
            {option.label}
          </DropdownMenuRadioItem>
        ))}
        {currentValue && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onFilterChange(filter.field, "")}
              className="text-muted-foreground"
            >
              Reset filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuRadioGroup>
    );
  };

  // Render multiselect filter
  const renderMultiselectFilter = (filter) => {
    const currentValues = activeFilters[filter.field] || [];
    const isArray = Array.isArray(currentValues);
    const values = isArray ? currentValues : [currentValues];

    return (
      <>
        {filter.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                // Add to selection
                const newValues = isArray 
                  ? [...values, option.value]
                  : [option.value];
                onFilterChange(filter.field, newValues);
              } else {
                // Remove from selection
                const newValues = values.filter(v => v !== option.value);
                onFilterChange(filter.field, newValues.length > 0 ? newValues : null);
              }
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {values.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onFilterChange(filter.field, null)}
              className="text-muted-foreground"
            >
              Reset filter
            </DropdownMenuItem>
          </>
        )}
      </>
    );
  };

  // Render boolean filter
  const renderBooleanFilter = (filter) => {
    const currentValue = activeFilters[filter.field];
    
    return (
      <DropdownMenuRadioGroup
        value={currentValue !== undefined ? String(currentValue) : ""}
        onValueChange={(value) => {
          if (value === "") {
            onFilterChange(filter.field, null);
          } else {
            onFilterChange(filter.field, value === "true");
          }
        }}
      >
        <DropdownMenuRadioItem value="true">
          {filter.trueLabel || "Ya"}
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="false">
          {filter.falseLabel || "Tidak"}
        </DropdownMenuRadioItem>
        {currentValue !== undefined && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onFilterChange(filter.field, null)}
              className="text-muted-foreground"
            >
              Reset filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuRadioGroup>
    );
  };

  // Render date filter
  const renderDateFilter = (filter) => {
    const currentValue = activeFilters[filter.field] || "";
    
    return (
      <div className="p-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => onFilterChange(filter.field, e.target.value)}
            className="h-8 w-full"
          />
        </div>
        {currentValue && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => onFilterChange(filter.field, null)}
            >
              Reset filter
            </Button>
          </>
        )}
      </div>
    );
  };

  // Render date range filter
  const renderDateRangeFilter = (filter) => {
    const startValue = activeFilters[`${filter.field}Start`] || "";
    const endValue = activeFilters[`${filter.field}End`] || "";
    
    return (
      <div className="p-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Dari:</span>
            <Input
              type="date"
              value={startValue}
              onChange={(e) => onFilterChange(`${filter.field}Start`, e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sampai:</span>
            <Input
              type="date"
              value={endValue}
              onChange={(e) => onFilterChange(`${filter.field}End`, e.target.value)}
              className="h-8"
            />
          </div>
        </div>
        {(startValue || endValue) && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => {
                onFilterChange(`${filter.field}Start`, null);
                onFilterChange(`${filter.field}End`, null);
              }}
            >
              Reset filter
            </Button>
          </>
        )}
      </div>
    );
  };

  // Render text filter
  const renderTextFilter = (filter) => {
    const currentValue = activeFilters[filter.field] || "";
    
    return (
      <div className="p-2">
        <Input
          type="text"
          placeholder={filter.placeholder || "Filter..."}
          value={currentValue}
          onChange={(e) => onFilterChange(filter.field, e.target.value)}
          className="h-8"
        />
        {currentValue && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => onFilterChange(filter.field, null)}
            >
              Reset filter
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative h-9">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {filters.map((filter, index) => (
          <Fragment key={filter.field}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
            {renderFilterContent(filter)}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}