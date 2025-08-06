import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, TrendingDown, Wifi, WifiOff, Edit, Trash2, Weight, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActionButton } from '@/components/ui/action-button';

interface Product {
  id: number;
  product_code: string;
  product_brand: string;
  product_name: string;
  description: string;
  product_image?: string;
  total_stock: number;
  warehouse_stock: number;
  sold_stock: number;
  unit_price_shop: number;
  unit_price_customer: number;
  product_weight: string;
  product_unit: string;
  cost_price: number | null;
  first_stock_updated_date: string | null;
  updated_at: string;
  created_at: string;
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const ProductDetailsModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onEdit, 
  onDelete 
}: ProductDetailsModalProps) => {
  const [isOnline, setIsOnline] = useState(true);

  if (!product) return null;

  const getStockStatus = (stock: number) => {
    if (stock > 0) {
      return { label: 'In Stock', className: 'bg-green-500 text-white' };
    } else {
      return { label: 'Out of Stock', className: 'bg-red-500 text-white' };
    }
  };

  const getStockDuration = (updatedAt: string, warehouseStock: number) => {
    if (!updatedAt || Number(warehouseStock) <= 0) return '-';
    
    const updatedDate = new Date(updatedAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - updatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const formatCurrency = (amount: number) => {
    return `OMR ${Number(amount || 0).toFixed(3)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const stockStatus = getStockStatus(product.warehouse_stock);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            {product.product_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-4"
          >
            <Avatar className="h-20 w-20 rounded-lg flex-shrink-0">
              <AvatarImage 
                src={product.product_image} 
                alt={product.product_name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg">
                <Package className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold">
                {product.product_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {product.product_brand}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {product.product_code}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={stockStatus.className}>
                {stockStatus.label}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch
                  checked={isOnline}
                  onCheckedChange={setIsOnline}
                  className="data-[state=checked]:bg-green-500"
                />
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Description */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-medium">Description</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </motion.div>
          )}

          <Separator />

          {/* Product Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Weight className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Unit</span>
                </div>
                <p className="text-lg font-bold">
                  {product.product_weight} {product.product_unit}
                </p>
              </CardContent>
            </Card>

            {product.cost_price && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Cost Price</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(product.cost_price)}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Stock Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Stock</span>
                </div>
                <p className="text-2xl font-bold">
                  {product.total_stock || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Warehouse Stock</span>
                </div>
                <p className="text-2xl font-bold">
                  {product.warehouse_stock || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Sold Stock</span>
                </div>
                <p className="text-2xl font-bold">
                  {product.sold_stock || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Shop Price</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(product.unit_price_shop)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Customer Price</span>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(product.unit_price_customer)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Product Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Brand:</span>
                  <span className="text-sm font-medium">
                    {product.product_brand}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Product Code:</span>
                  <span className="text-sm font-mono">
                    {product.product_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit:</span>
                  <span className="text-sm">
                    {product.product_weight} {product.product_unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock Duration:</span>
                  <span className="text-sm">
                    {getStockDuration(product.updated_at, product.warehouse_stock)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Timestamps</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">
                    {formatDate(product.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="text-sm">
                    {formatDate(product.updated_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">First Stock Update:</span>
                  <span className="text-sm">
                    {formatDate(product.first_stock_updated_date)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product Variations Section - Placeholder for future implementation */}
          {/* 
          <Separator />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium">Product Variations</h4>
            <p className="text-sm text-muted-foreground">
              No variations available for this product.
            </p>
          </motion.div>
          */}

          <Separator />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex justify-end gap-3"
          >
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {onEdit && (
              <ActionButton
                icon={Edit}
                tooltip="Edit Product"
                color="blue"
                onClick={() => onEdit(product)}
              />
            )}
            {onDelete && (
              <ActionButton
                icon={Trash2}
                tooltip="Delete Product"
                color="red"
                onClick={() => onDelete(product)}
              />
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 