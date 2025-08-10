import React, { useEffect, useState } from 'react';
import { Filter, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface QuotationFilters {
  invoiceStatus: 'pending' | 'done' | null;
  quotationType: 'Customer' | 'Shop' | null;
  fromDate: string | null;
  toDate: string | null;
}

interface QuotationFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: QuotationFilters;
  onApplyFilters: (filters: QuotationFilters) => void;
  onClearFilters: () => void;
}

const statusColor = {
  pending: 'text-warning',
  done: 'text-green-600',
} as const;

const InvoiceStatusList: Array<{ value: NonNullable<QuotationFilters['invoiceStatus']> | 'all'; label: string; icon: any; color: string; }> = [
  { value: 'all', label: 'All Invoice Status', icon: Filter, color: 'text-muted-foreground' },
  { value: 'done', label: 'Created', icon: Check, color: statusColor.done },
  { value: 'pending', label: 'Pending', icon: Clock, color: statusColor.pending },
];

const QuotationTypeList: Array<{ value: NonNullable<QuotationFilters['quotationType']> | 'all'; label: string; }> = [
  { value: 'all', label: 'All Types' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Shop', label: 'Shop' },
];

export const QuotationFilter: React.FC<QuotationFilterProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<QuotationFilters>({
    invoiceStatus: filters.invoiceStatus ?? null,
    quotationType: filters.quotationType ?? null,
    fromDate: filters.fromDate ?? null,
    toDate: filters.toDate ?? null,
  });

  useEffect(() => {
    setLocalFilters({
      invoiceStatus: filters.invoiceStatus ?? null,
      quotationType: filters.quotationType ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
    });
  }, [filters]);

  const handleStatusChange = (value: QuotationFilters['invoiceStatus'] | 'all') => {
    setLocalFilters((prev) => ({ ...prev, invoiceStatus: value === 'all' ? null : (value as NonNullable<QuotationFilters['invoiceStatus']>) }));
  };

  const handleTypeChange = (value: QuotationFilters['quotationType'] | 'all') => {
    setLocalFilters((prev) => ({ ...prev, quotationType: value === 'all' ? null : (value as NonNullable<QuotationFilters['quotationType']>) }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({ invoiceStatus: null, quotationType: null, fromDate: null, toDate: null });
    onClearFilters();
  };

  const handleCancel = () => {
    setLocalFilters({
      invoiceStatus: filters.invoiceStatus ?? null,
      quotationType: filters.quotationType ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
    });
    onClose();
  };

  const hasActive = !!(localFilters.invoiceStatus || localFilters.quotationType || localFilters.fromDate || localFilters.toDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Quotations
          </DialogTitle>
          <DialogDescription>Refine your quotations by invoice status, type and date range</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Invoice Status</label>
            <div className="grid grid-cols-1 gap-2">
              {InvoiceStatusList.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.invoiceStatus === option.value || (option.value === 'all' && !localFilters.invoiceStatus);
                return (
                  <button
                    key={option.label}
                    onClick={() => handleStatusChange(option.value as any)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      isSelected ? 'bg-primary/10 border-primary/50 text-primary' : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-sm font-medium">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Quotation Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quotation Type</label>
            <div className="grid grid-cols-1 gap-2">
              {QuotationTypeList.map((option) => {
                const isSelected = localFilters.quotationType === option.value || (option.value === 'all' && !localFilters.quotationType);
                return (
                  <button
                    key={option.label}
                    onClick={() => handleTypeChange(option.value as any)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      isSelected ? 'bg-primary/10 border-primary/50 text-primary' : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">From</span>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={localFilters.fromDate || ''}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, fromDate: e.target.value || null }))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">To</span>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={localFilters.toDate || ''}
                  onChange={(e) => setLocalFilters((prev) => ({ ...prev, toDate: e.target.value || null }))}
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActive && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-sm font-medium">Active Filters</label>
                <div className="flex flex-wrap gap-2">
                  {localFilters.invoiceStatus && <Badge variant="secondary">Invoice: {localFilters.invoiceStatus}</Badge>}
                  {localFilters.quotationType && <Badge variant="secondary">Type: {localFilters.quotationType}</Badge>}
                  {(localFilters.fromDate || localFilters.toDate) && (
                    <Badge variant="secondary">Date: {localFilters.fromDate || 'Any'} - {localFilters.toDate || 'Any'}</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationFilter;


