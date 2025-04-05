'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';

/**
 * Komponen search bar yang dapat dikustomisasi
 * 
 * @param {string} placeholder - Placeholder untuk input pencarian
 * @param {function} onSearch - Callback yang dipanggil saat pencarian dilakukan
 * @param {function} onClear - Callback yang dipanggil saat pencarian dibersihkan
 * @param {string} initialValue - Nilai awal untuk input pencarian
 * @param {boolean} autoFocus - Apakah input otomatis mendapatkan focus (default: false)
 * @param {object} filters - Objek konfigurasi untuk filter tambahan (opsional)
 * @param {function} onFilterChange - Callback saat filter berubah (opsional)
 * @param {object} className - Class tambahan untuk container
 */
export default function SearchBar({
  placeholder = 'Cari...',
  onSearch,
  onClear,
  initialValue = '',
  autoFocus = false,
  filters,
  onFilterChange,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [activeFilters, setActiveFilters] = useState({});
  const inputRef = useRef(null);
  const hasFilters = filters && Object.keys(filters).length > 0;

  // Set initial filters
  useEffect(() => {
    if (filters) {
      const initialFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key].default !== undefined) {
          initialFilters[key] = filters[key].default;
        }
      });
      setActiveFilters(initialFilters);
    }
  }, [filters]);

  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (onSearch) {
      onSearch(searchTerm, activeFilters);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-8"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button onClick={handleSearch} size="sm">
        <Search className="h-4 w-4 mr-2" />
        Cari
      </Button>

      {hasFilters && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Pencarian</h4>
              <div className="space-y-3">
                {Object.keys(filters).map((key) => (
                  <div key={key} className="space-y-1">
                    <label htmlFor={`filter-${key}`} className="text-sm font-medium">
                      {filters[key].label}
                    </label>
                    {filters[key].type === 'select' && (
                      <select
                        id={`filter-${key}`}
                        value={activeFilters[key] || ''}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      >
                        {filters[key].options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {filters[key].type === 'checkbox' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`filter-${key}`}
                          checked={!!activeFilters[key]}
                          onChange={(e) => handleFilterChange(key, e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor={`filter-${key}`} className="text-sm">
                          {filters[key].checkboxLabel || filters[key].label}
                        </label>
                      </div>
                    )}
                    {filters[key].type === 'date' && (
                      <input
                        type="date"
                        id={`filter-${key}`}
                        value={activeFilters[key] || ''}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    )}
                    {filters[key].type === 'radio' && (
                      <div className="space-y-1">
                        {filters[key].options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`filter-${key}-${option.value}`}
                              name={`filter-${key}`}
                              value={option.value}
                              checked={activeFilters[key] === option.value}
                              onChange={() => handleFilterChange(key, option.value)}
                            />
                            <label htmlFor={`filter-${key}-${option.value}`} className="text-sm">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActiveFilters({});
                    if (onFilterChange) onFilterChange({});
                  }}
                >
                  Reset
                </Button>
                <Button size="sm" onClick={handleSearch}>
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}