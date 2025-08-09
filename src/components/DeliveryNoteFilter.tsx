import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface DeliveryNoteFilters {
  status: 'delivered' | 'pending' | null;
  fromDate: string | null;
  toDate: string | null;
}

interface DeliveryNoteFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DeliveryNoteFilters;
  onApplyFilters: (filters: DeliveryNoteFilters) => void;
  onClearFilters: () => void;
}

export const DeliveryNoteFilter: React.FC<DeliveryNoteFilterProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<DeliveryNoteFilters>({
    status: filters.status ?? null,
    fromDate: filters.fromDate ?? null,
    toDate: filters.toDate ?? null,
  });

  useEffect(() => {
    setLocalFilters({
      status: filters.status ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
    });
  }, [filters]);

  const handleStatusChange = (status: DeliveryNoteFilters['status'] | 'all') => {
    setLocalFilters(prev => ({
      ...prev,
      status: status === 'all' ? null : (status as DeliveryNoteFilters['status'])
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({ status: null, fromDate: null, toDate: null });
    onClearFilters();
  };

  const handleCancel = () => {
    setLocalFilters({
      status: filters.status ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
    });
    onClose();
  };

  const hasActiveFilters = !!(localFilters.status || localFilters.fromDate || localFilters.toDate);

  const statusOptions: Array<{ value: 'all' | NonNullable<DeliveryNoteFilters['status']>; label: string; icon: any; color: string; }>= [
    { value: 'all', label: 'All Status', icon: Filter, color: 'text-muted-foreground' },
    { value: 'delivered', label: 'Delivered', icon: Check, color: 'text-green-600' },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-warning' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Delivery Notes
          </DialogTitle>
          <DialogDescription>
            Refine your delivery notes by status and date range
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Status</label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.status === option.value || (option.value === 'all' && !localFilters.status);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value as any)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-primary'
                        : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-sm font-medium">
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 ml-auto text-primary" />
                    )}
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
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, fromDate: e.target.value || null }))}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">To</span>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={localFilters.toDate || ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, toDate: e.target.value || null }))}
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-sm font-medium">Active Filters</label>
                <div className="flex flex-wrap gap-2">
                  {localFilters.status && (
                    <Badge variant="secondary">
                      Status: {localFilters.status.replace('_', ' ')}
                    </Badge>
                  )}
                  {(localFilters.fromDate || localFilters.toDate) && (
                    <Badge variant="secondary">
                      Date: {localFilters.fromDate || 'Any'} - {localFilters.toDate || 'Any'}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
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

export default DeliveryNoteFilter;


