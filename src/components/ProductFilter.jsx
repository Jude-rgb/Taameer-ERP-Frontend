import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Check, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ProductFilter = ({ isOpen, onClose, filters, onApplyFilters, onClearFilters, availableBrands }) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || null,
    brand: filters.brand || null
  });

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters({
      status: filters.status || null,
      brand: filters.brand || null
    });
  }, [filters]);

  const handleStatusChange = (status) => {
    setLocalFilters(prev => ({
      ...prev,
      status: status === 'all' ? null : status
    }));
  };

  const handleBrandChange = (brand) => {
    setLocalFilters(prev => ({
      ...prev,
      brand: brand === 'all' ? null : brand
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({ status: null, brand: null });
    onClearFilters();
  };

  const handleCancel = () => {
    setLocalFilters({
      status: filters.status || null,
      brand: filters.brand || null
    });
    onClose();
  };

  const hasActiveFilters = localFilters.status || localFilters.brand;

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Package, color: 'text-muted-foreground' },
    { value: 'in_stock', label: 'In Stock', icon: Check, color: 'text-green-600' },
    { value: 'out_of_stock', label: 'Out of Stock', icon: AlertCircle, color: 'text-red-600' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Products
          </DialogTitle>
          <DialogDescription>
            Refine your product list by status and brand
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Stock Status</label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.status === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
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

          {/* Brand Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Brand</label>
            <Select
              value={localFilters.brand || 'all'}
              onValueChange={handleBrandChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  {localFilters.brand && (
                    <Badge variant="secondary">
                      Brand: {localFilters.brand}
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

export default ProductFilter; 