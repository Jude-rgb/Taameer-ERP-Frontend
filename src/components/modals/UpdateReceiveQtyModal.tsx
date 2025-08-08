import React, { useState, useEffect } from 'react';
import { Package, Save, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';
import { updateStock } from '@/services/purchaseOrder';

interface Product {
  id: number;
  product_code: number;
  product_name: string;
  unit_cost: number;
  purchase_quantity: number;
  sub_total: number;
  vat: number;
  total_quantity_received: number;
  balance_quantity: number;
}

interface Supplier {
  id: number;
  supplier_type: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  email?: string;
  address_line_1?: string;
  tax_number?: string;
  status?: string;
}

interface UpdateReceiveQtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: number;
  purchaseNo: string;
  purchaseDate: string;
  supplier: Supplier;
  products: Product[];
  onSuccess: () => void;
  onRefreshPurchaseOrder?: () => void; // New callback to refresh purchase order details
}

export const UpdateReceiveQtyModal = ({
  isOpen,
  onClose,
  purchaseId,
  purchaseNo,
  purchaseDate,
  supplier,
  products,
  onSuccess,
  onRefreshPurchaseOrder
}: UpdateReceiveQtyModalProps) => {
  const { toast } = useToast();
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen && products) {
      setUpdatedProducts([...products]);
      setErrors({});
    }
  }, [isOpen, products]);

  const getSupplierName = () => {
    try {
      if (supplier.supplier_type === 'business_type') {
        return supplier.business_name || 'N/A';
      } else {
        const firstName = supplier.first_name || '';
        const lastName = supplier.last_name || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      }
    } catch (error) {
      return 'N/A';
    }
  };

  const handleQuantityChange = (productId: number, newValue: string) => {
    const product = updatedProducts.find(p => p.id === productId);
    if (!product) return;

    const newReceivedQty = parseInt(newValue) || 0;
    const currentReceivedQty = product.total_quantity_received;
    const orderQty = product.purchase_quantity;

    // Validation
    let error = '';
    if (newReceivedQty < currentReceivedQty) {
      error = 'Cannot reduce received quantity';
    } else if (newReceivedQty > orderQty) {
      error = 'Cannot exceed order quantity';
    }

    setErrors(prev => ({
      ...prev,
      [productId]: error
    }));

    // Update the product
    setUpdatedProducts(prev => prev.map(p => 
      p.id === productId 
        ? { 
            ...p, 
            total_quantity_received: newReceivedQty,
            balance_quantity: orderQty - newReceivedQty
          }
        : p
    ));
  };

  const hasChanges = () => {
    return updatedProducts.some(product => {
      const originalProduct = products.find(p => p.id === product.id);
      return originalProduct && product.total_quantity_received !== originalProduct.total_quantity_received;
    });
  };

  const hasErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

  const handleSave = async () => {
         if (!hasChanges() || hasErrors()) {
       toast({
         title: "No Changes",
         description: "No valid changes to save",
         variant: "default"
       });
       return;
     }

    setIsLoading(true);
    try {
      // Get only products that have changes
      const changedProducts = updatedProducts.filter(product => {
        const originalProduct = products.find(p => p.id === product.id);
        return originalProduct && product.total_quantity_received !== originalProduct.total_quantity_received;
      });

             // Make API calls for each changed product
       const updatePromises = changedProducts.map(product => {
         const payload = {
           purchase_id: purchaseId,
           id: product.id,
           purchase_quantity: product.purchase_quantity,
           total_quantity_received: product.total_quantity_received,
           balance_quantity: product.balance_quantity,
         };

         return updateStock(payload);
       });

      await Promise.all(updatePromises);

      toast({
        title: "Success",
        description: "Received quantities updated successfully",
        variant: "success",
      });

      // Refresh purchase order details if callback is provided
      if (onRefreshPurchaseOrder) {
        onRefreshPurchaseOrder();
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating received quantities:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update received quantities",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Update Received Quantities
          </DialogTitle>
          <DialogDescription>
            {purchaseNo} - {getSupplierName()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
                     {/* Header Info */}
           <Card className="border-0 bg-card">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Package className="w-5 h-5" />
                 Purchase Information
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <Label className="text-sm font-medium text-muted-foreground">Purchase No</Label>
                   <p className="text-sm font-medium">{purchaseNo}</p>
                 </div>
                 <div>
                   <Label className="text-sm font-medium text-muted-foreground">Purchase Date</Label>
                   <p className="text-sm font-medium">{formatDate(purchaseDate)}</p>
                 </div>
                 <div>
                   <Label className="text-sm font-medium text-muted-foreground">Supplier</Label>
                   <p className="text-sm font-medium">{getSupplierName()}</p>
                 </div>
               </div>
             </CardContent>
           </Card>

                     {/* Products Table */}
           <Card className="border-0 bg-card">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                 <Edit3 className="w-5 h-5" />
                 Product Quantities
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {updatedProducts.map((product) => {
                   const isFullyReceived = product.purchase_quantity === product.total_quantity_received;
                   const isDisabled = isFullyReceived;
                   
                   return (
                     <div key={product.id} className="border rounded-lg p-4 bg-background/50 hover:bg-background/80 transition-colors">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex-1">
                           <h4 className="font-medium text-foreground">{product.product_name}</h4>
                           <p className="text-sm text-muted-foreground">Code: {product.product_code}</p>
                         </div>
                         {isFullyReceived && (
                           <Badge className="bg-green-500 text-white">
                             Fully Received
                           </Badge>
                         )}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div>
                           <Label className="text-sm font-medium text-muted-foreground">Order Qty</Label>
                           <p className="text-sm font-medium text-foreground">{product.purchase_quantity}</p>
                         </div>
                         
                         <div>
                           <Label className="text-sm font-medium text-muted-foreground">
                             Received Qty
                           
                           </Label>
                           <Input
                             type="number"
                             value={product.total_quantity_received}
                             onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                             disabled={isDisabled}
                             min={product.total_quantity_received}
                             max={product.purchase_quantity}
                             className={`${errors[product.id] ? 'border-red-500' : ''} ${isDisabled ? 'bg-muted/50' : ''}`}
                           />
                           {errors[product.id] && (
                             <p className="text-xs text-red-500 mt-1">{errors[product.id]}</p>
                           )}
                         </div>
                         
                         <div>
                           <Label className="text-sm font-medium text-muted-foreground">Balance Qty</Label>
                           <p className="text-sm font-medium text-foreground">{product.balance_quantity}</p>
                         </div>
                         
                         <div>
                           <Label className="text-sm font-medium text-muted-foreground">Unit Cost</Label>
                           <p className="text-sm font-medium text-foreground">OMR {product.unit_cost.toFixed(3)}</p>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </CardContent>
           </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !hasChanges() || hasErrors()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
