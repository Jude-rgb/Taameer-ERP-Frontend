import React, { useEffect, useState } from 'react';
import { Filter, Check, Clock, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface InvoiceFilters {
  paymentStatus: 'pending' | 'partially' | 'done' | null;
  deliveryStatus: 'created' | 'pending' | null;
  fromDate: string | null;
  toDate: string | null;
}

interface InvoiceFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: InvoiceFilters;
  onApplyFilters: (filters: InvoiceFilters) => void;
  onClearFilters: () => void;
}

const statusColor = {
  pending: 'text-warning',
  partially: 'text-orange-500',
  done: 'text-green-600',
} as const;

const deliveryColor = {
  created: 'text-green-600',
  completed: 'text-green-600',
  pending: 'text-warning',
} as const;

const PaymentStatusList: Array<{ value: NonNullable<InvoiceFilters['paymentStatus']> | 'all'; label: string; icon: any; color: string; }> = [
  { value: 'all', label: 'All Payment Status', icon: Filter, color: 'text-muted-foreground' },
  { value: 'pending', label: 'Pending', icon: Clock, color: statusColor.pending },
  { value: 'partially', label: 'Partially Paid', icon: Check, color: statusColor.partially },
  { value: 'done', label: 'Paid', icon: Check, color: statusColor.done },
];

const DeliveryStatusList: Array<{ value: NonNullable<InvoiceFilters['deliveryStatus']> | 'all'; label: string; icon: any; color: string; }> = [
  { value: 'all', label: 'All Delivery Status', icon: Filter, color: 'text-muted-foreground' },
  { value: 'created', label: 'Created', icon: PackageCheck, color: deliveryColor.created },
  { value: 'pending', label: 'Pending', icon: Clock, color: deliveryColor.pending },
];

export const InvoiceFilter: React.FC<InvoiceFilterProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<InvoiceFilters>({
    paymentStatus: filters.paymentStatus ?? null,
    deliveryStatus: filters.deliveryStatus ?? null,
    fromDate: filters.fromDate ?? null,
    toDate: filters.toDate ?? null,
  });

  useEffect(() => {
    setLocalFilters({
      paymentStatus: filters.paymentStatus ?? null,
      deliveryStatus: filters.deliveryStatus ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
    });
  }, [filters]);

  const handlePaymentChange = (value: InvoiceFilters['paymentStatus'] | 'all') => {
    setLocalFilters((prev) => ({ ...prev, paymentStatus: value === 'all' ? null : (value as NonNullable<InvoiceFilters['paymentStatus']>) }));
  };

  const handleDeliveryChange = (value: InvoiceFilters['deliveryStatus'] | 'all') => {
    setLocalFilters((prev) => ({ ...prev, deliveryStatus: value === 'all' ? null : (value as NonNullable<InvoiceFilters['deliveryStatus']>) }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({ paymentStatus: null, deliveryStatus: null, fromDate: null, toDate: null });
    onClearFilters();
  };

  const handleCancel = () => {
    setLocalFilters({
      paymentStatus: filters.paymentStatus ?? null,
      deliveryStatus: filters.deliveryStatus ?? null,
      fromDate: filters.fromDate ?? null,
      toDate: filters.toDate ?? null,
    });
    onClose();
  };

  const hasActive = !!(localFilters.paymentStatus || localFilters.deliveryStatus || localFilters.fromDate || localFilters.toDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Invoices
          </DialogTitle>
          <DialogDescription>Refine your invoices by payment, delivery status and date range</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Status</label>
            <div className="grid grid-cols-1 gap-2">
              {PaymentStatusList.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.paymentStatus === option.value || (option.value === 'all' && !localFilters.paymentStatus);
                return (
                  <button
                    key={option.label}
                    onClick={() => handlePaymentChange(option.value as any)}
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

          {/* Delivery Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Delivery Status</label>
            <div className="grid grid-cols-1 gap-2">
              {DeliveryStatusList.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.deliveryStatus === option.value || (option.value === 'all' && !localFilters.deliveryStatus);
                return (
                  <button
                    key={option.label}
                    onClick={() => handleDeliveryChange(option.value as any)}
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

          {/* Active Filters Display */}
          {hasActive && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-sm font-medium">Active Filters</label>
                <div className="flex flex-wrap gap-2">
                  {localFilters.paymentStatus && <Badge variant="secondary">Payment: {localFilters.paymentStatus}</Badge>}
                  {localFilters.deliveryStatus && <Badge variant="secondary">Delivery: {localFilters.deliveryStatus}</Badge>}
                  {(localFilters.fromDate || localFilters.toDate) && (
                    <Badge variant="secondary">Date: {localFilters.fromDate || 'Any'} - {localFilters.toDate || 'Any'}</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
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

export default InvoiceFilter;


