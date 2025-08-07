import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Check, 
  Package, 
  CreditCard, 
  Calendar, 
  Building2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

const PurchaseOrderFilter = ({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters, 
  onClearFilters, 
  suppliers 
}) => {
  const [localFilters, setLocalFilters] = useState({
    supplier: '',
    dateRange: { from: '', to: '' },
    paymentStatus: null,
    purchaseStatus: null
  });

  // Update local filters when props change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        supplier: filters.supplier || '',
        dateRange: filters.dateRange || { from: '', to: '' },
        paymentStatus: filters.paymentStatus || null,
        purchaseStatus: filters.purchaseStatus || null
      });
    }
  }, [isOpen, filters]);

  const handleApply = () => {
    const newFilters = {
      supplier: localFilters.supplier || null,
      dateRange: (localFilters.dateRange.from || localFilters.dateRange.to) ? localFilters.dateRange : null,
      paymentStatus: localFilters.paymentStatus,
      purchaseStatus: localFilters.purchaseStatus
    };
    onApplyFilters(newFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({
      supplier: '',
      dateRange: { from: '', to: '' },
      paymentStatus: null,
      purchaseStatus: null
    });
    onClearFilters();
  };

  const handleCancel = () => {
    setLocalFilters({
      supplier: filters.supplier || '',
      dateRange: filters.dateRange || { from: '', to: '' },
      paymentStatus: filters.paymentStatus || null,
      purchaseStatus: filters.purchaseStatus || null
    });
    onClose();
  };

  const handleSupplierChange = (value) => {
    setLocalFilters(prev => ({ ...prev, supplier: value }));
  };

  const handleDateChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }));
  };

  const handlePaymentStatusChange = (value) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      paymentStatus: prev.paymentStatus === value ? null : value 
    }));
  };

  const handlePurchaseStatusChange = (value) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      purchaseStatus: prev.purchaseStatus === value ? null : value 
    }));
  };

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', icon: CreditCard, color: 'text-yellow-600' },
    { value: 'done', label: 'Paid', icon: CreditCard, color: 'text-green-600' }
  ];

  const purchaseStatusOptions = [
    { value: 'completed', label: 'Completed', icon: Package, color: 'text-green-600' },
    { value: 'ordered', label: 'Ordered', icon: Package, color: 'text-blue-600' },
    { value: 'partially', label: 'Partially', icon: Package, color: 'text-orange-600' }
  ];

  const getSupplierName = (supplier) => {
    if (supplier.supplier_type === 'business_type') {
      return supplier.business_name || 'N/A';
    } else {
      const firstName = supplier.first_name || '';
      const lastName = supplier.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    }
  };

  const hasActiveFilters = localFilters.supplier || localFilters.dateRange.from || localFilters.dateRange.to || localFilters.paymentStatus || localFilters.purchaseStatus;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Purchase Orders
          </DialogTitle>
          <DialogDescription>
            Refine your purchase orders by supplier, date range, payment status, and purchase status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Supplier Name</Label>
            <Input
              placeholder="Search suppliers..."
              value={localFilters.supplier}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="h-9"
            />
            {suppliers && suppliers.length > 0 && localFilters.supplier && (
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {suppliers
                  .filter(supplier => 
                    getSupplierName(supplier)
                      .toLowerCase()
                      .includes(localFilters.supplier.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((supplier) => (
                    <button
                      key={supplier.id}
                      onClick={() => handleSupplierChange(getSupplierName(supplier))}
                      className="w-full text-left p-2 rounded-md hover:bg-muted text-sm"
                    >
                      {getSupplierName(supplier)}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={localFilters.dateRange.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="h-9"
              />
              <Input
                type="date"
                value={localFilters.dateRange.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <Separator />

          {/* Payment Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Payment Status</Label>
            <div className="grid grid-cols-1 gap-2">
              {paymentStatusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.paymentStatus === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handlePaymentStatusChange(option.value)}
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

          {/* Purchase Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Purchase Status</Label>
            <div className="grid grid-cols-1 gap-2">
              {purchaseStatusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.purchaseStatus === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handlePurchaseStatusChange(option.value)}
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

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Active Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {localFilters.supplier && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Supplier: {localFilters.supplier}
                    </Badge>
                  )}
                  {(localFilters.dateRange.from || localFilters.dateRange.to) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date: {localFilters.dateRange.from || 'Any'} - {localFilters.dateRange.to || 'Any'}
                    </Badge>
                  )}
                  {localFilters.paymentStatus && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Payment: {paymentStatusOptions.find(opt => opt.value === localFilters.paymentStatus)?.label}
                    </Badge>
                  )}
                  {localFilters.purchaseStatus && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Purchase: {purchaseStatusOptions.find(opt => opt.value === localFilters.purchaseStatus)?.label}
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
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseOrderFilter;
