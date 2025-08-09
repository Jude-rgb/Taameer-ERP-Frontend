import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useThemeStore } from '@/store/useThemeStore';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onRowSelect?: (selectedIds: Set<number | string>) => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  idKey?: keyof T;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  onRowSelect,
  onRowClick,
  loading = false,
  emptyMessage = "No data available.",
  className = "",
  idKey = 'id' as keyof T
}: DataTableProps<T>) {
  const { theme } = useThemeStore();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchKey) return data;
    
    return data.filter(item => {
      const value = item[searchKey];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchQuery);
      }
      return false;
    });
  }, [data, searchQuery, searchKey]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Row selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedData.forEach(item => newSelected.add(item[idKey]));
      setSelectedRows(newSelected);
      onRowSelect?.(newSelected);
    } else {
      setSelectedRows(new Set());
      onRowSelect?.(new Set());
    }
  };

  const handleSelectRow = (itemId: number | string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedRows(newSelected);
    onRowSelect?.(newSelected);
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedRows.has(item[idKey]));
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < paginatedData.length;

  // Reset pagination when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset pagination when page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Selection Info */}
      <div className="flex items-center justify-between gap-4">
        {searchKey && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRows(new Set());
                onRowSelect?.(new Set());
              }}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-muted/30'}`}>
              {onRowSelect && (
                <TableHead className="font-semibold text-base w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={`font-semibold text-base ${column.width ? column.width : ''}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  {onRowSelect && (
                    <TableCell>
                      <div className="w-4 h-4 bg-muted rounded" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <div className="h-4 bg-muted rounded w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              paginatedData.map((item, index) => (
                <motion.tr
                  key={item[idKey]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`hover:bg-muted/20 transition-colors ${onRowClick ? 'cursor-pointer' : 'cursor-default'} ${
                    index % 2 === 0 
                      ? theme === 'dark' ? 'bg-gray-900' : 'bg-muted/10'
                      : theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } ${selectedRows.has(item[idKey]) ? 'bg-primary/5' : ''}`}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {onRowSelect && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(item[idKey])}
                        onCheckedChange={(checked) => 
                          handleSelectRow(item[idKey], checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {!loading && filteredData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          {searchQuery ? 'No items found matching your search.' : emptyMessage}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} items
            </span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 