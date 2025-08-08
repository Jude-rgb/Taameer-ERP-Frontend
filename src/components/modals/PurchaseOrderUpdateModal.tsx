import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Package, 
  Calendar, 
  FileText, 
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProductStore } from '@/store/useProductStore';
import { useSupplierStore } from '@/store/useSupplierStore';
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { formatDate } from '@/utils/formatters';

// Interfaces
interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  product_name: string;
  product_code: string;
  unit_price_customer: number;
}

interface ProductEntry {
  product_name: string;
  product_code: string;
  qty: string;
  unit_price: string;
  subtotal: string;
}

interface FormData {
  supplier: string;
  purchaseDate: string;
  quotation_ref: string;
  currency: string;
  products: ProductEntry[];
  note: string;
}

interface FormErrors {
  supplier?: string;
  purchaseDate?: string;
  quotation_ref?: string;
  currency?: string;
  products?: string;
}

interface PurchaseOrderUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: any; // The purchase order to update
  onSuccess?: () => void;
}

const CURRENCY_OPTIONS = [
  { value: 'OMR', label: 'OMR' },
  { value: 'AED', label: 'AED' },
  { value: 'USD', label: 'USD' },
  { value: 'CNY', label: 'CNY' },
  { value: 'TRY', label: 'TRY' }
];

const VAT_RATE = 5; // 5% VAT

export const PurchaseOrderUpdateModal = ({ 
  isOpen, 
  onClose, 
  purchaseOrder,
  onSuccess
}: PurchaseOrderUpdateModalProps) => {
  const { toast } = useToast();
  const { fetchAllProducts } = useProductStore();
  const { fetchAllSuppliers } = useSupplierStore();
  const { createPurchaseOrder } = usePurchaseOrderStore();
  
  const [formData, setFormData] = useState<FormData>({
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    quotation_ref: '',
    currency: 'OMR',
    products: [],
    note: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productEntry, setProductEntry] = useState<ProductEntry>({
    product_name: '',
    product_code: '',
    qty: '',
    unit_price: '',
    subtotal: ''
  });
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        supplier: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        quotation_ref: '',
        currency: 'OMR',
        products: [],
        note: ''
      });
      setErrors({});
      setProductEntry({
        product_name: '',
        product_code: '',
        qty: '',
        unit_price: '',
        subtotal: ''
      });
      setShowProductDropdown(false);
      loadSuppliers();
      loadProducts();
    }
  }, [isOpen]);

  const loadSuppliers = async () => {
    try {
      const result = await fetchAllSuppliers();
      if (result.success && result.data) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await fetchAllProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleProductEntryChange = (field: keyof ProductEntry, value: string) => {
    setProductEntry(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate subtotal when qty or unit_price changes
    if (field === 'qty' || field === 'unit_price') {
      const qty = field === 'qty' ? value : productEntry.qty;
      const price = field === 'unit_price' ? value : productEntry.unit_price;
      
      if (qty && price) {
        const subtotal = (parseFloat(qty) * parseFloat(price)).toFixed(3);
        setProductEntry(prev => ({
          ...prev,
          subtotal
        }));
      } else {
        setProductEntry(prev => ({
          ...prev,
          subtotal: ''
        }));
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    setProductEntry({
      product_name: product.product_name,
      product_code: product.product_code,
      qty: '',
      unit_price: product.unit_price_customer.toString(),
      subtotal: ''
    });
    setShowProductDropdown(false);
  };

  const handleProductSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  };

  const addProduct = () => {
    if (!productEntry.product_name || !productEntry.qty || !productEntry.unit_price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all product fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(productEntry.qty) <= 0 || parseFloat(productEntry.unit_price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity and unit price must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { ...productEntry }]
    }));

    setProductEntry({
      product_name: '',
      product_code: '',
      qty: '',
      unit_price: '',
      subtotal: ''
    });
    setShowProductDropdown(false);
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (!formData.quotation_ref) {
      newErrors.quotation_ref = 'Quotation reference is required';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getUserData = () => {
    const user_id = localStorage.getItem('user_id') || '1';
    const user_name = localStorage.getItem('full_name') || 'Developer';
    return { user_id: parseInt(user_id), user_name };
  };

  const calculateTotals = () => {
    const subtotal = formData.products.reduce((sum, product) => {
      return sum + (parseFloat(product.qty) * parseFloat(product.unit_price));
    }, 0);
    
    const vatAmount = subtotal * (VAT_RATE / 100);
    const grandTotal = subtotal + vatAmount;
    
    return {
      subtotal: subtotal.toFixed(3),
      vatAmount: vatAmount.toFixed(3),
      grandTotal: grandTotal.toFixed(3)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { user_id, user_name } = getUserData();
      const totals = calculateTotals();
      
      const payload = {
        supplier: parseInt(formData.supplier),
        purchaseDate: formData.purchaseDate,
        quotation_ref: formData.quotation_ref,
        currency: formData.currency,
        subTotal: parseFloat(totals.subtotal),
        vatAmount: parseFloat(totals.vatAmount),
        grandTotal: parseFloat(totals.grandTotal),
        productCount: formData.products.length,
        products: formData.products.map(product => ({
          name: product.product_name,
          code: product.product_code,
          quantity: product.qty,
          price: product.unit_price
        })),
        full_name: user_name,
        user_id: user_id,
        note: formData.note,
        status: "Ordered"
      };

      // Show alert for update functionality
      toast({
        title: "Update Feature",
        description: "Update purchase order feature will be available soon.",
        variant: "info",
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
      return `${formData.currency} ${numAmount.toFixed(3)}`;
    } catch (error) {
      return `${formData.currency} 0.000`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6 text-blue-500" />
            Update Purchase Order
          </DialogTitle>
          <DialogDescription className="text-base">
            Update purchase order details and products
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => handleInputChange('supplier', value)}
                  >
                    <SelectTrigger className={errors.supplier ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier && (
                    <p className="text-sm text-red-500">{errors.supplier}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className={errors.purchaseDate ? 'border-red-500' : ''}
                  />
                  {errors.purchaseDate && (
                    <p className="text-sm text-red-500">{errors.purchaseDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quotation_ref">Quotation Reference *</Label>
                  <Input
                    id="quotation_ref"
                    value={formData.quotation_ref}
                    onChange={(e) => handleInputChange('quotation_ref', e.target.value)}
                    placeholder="Enter quotation reference"
                    className={errors.quotation_ref ? 'border-red-500' : ''}
                  />
                  {errors.quotation_ref && (
                    <p className="text-sm text-red-500">{errors.quotation_ref}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-500">{errors.currency}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-green-500" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <div className="relative">
                    <Input
                      id="product_name"
                      value={productEntry.product_name}
                      onChange={(e) => {
                        handleProductEntryChange('product_name', e.target.value);
                        handleProductSearch(e.target.value);
                      }}
                      placeholder="Search or enter product name"
                      onFocus={() => {
                        if (productEntry.product_name) {
                          handleProductSearch(productEntry.product_name);
                        }
                      }}
                    />
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-gray-500">Code: {product.product_code}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_code">Product Code</Label>
                  <Input
                    id="product_code"
                    value={productEntry.product_code}
                    onChange={(e) => handleProductEntryChange('product_code', e.target.value)}
                    placeholder="Product code"
                    disabled={!!productEntry.product_name && products.some(p => p.product_name === productEntry.product_name)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.001"
                    value={productEntry.qty}
                    onChange={(e) => handleProductEntryChange('qty', e.target.value)}
                    placeholder="0.000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.001"
                    value={productEntry.unit_price}
                    onChange={(e) => handleProductEntryChange('unit_price', e.target.value)}
                    placeholder="0.000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input
                    value={productEntry.subtotal}
                    readOnly
                    placeholder="0.000"
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addProduct}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>

              {errors.products && (
                <p className="text-sm text-red-500">{errors.products}</p>
              )}
            </CardContent>
          </Card>

          {/* Products Table */}
          {formData.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-purple-500" />
                  Products ({formData.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">Code: {product.product_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{product.qty}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Unit Price</p>
                          <p className="font-medium">{formatCurrency(product.unit_price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <p className="font-medium">{formatCurrency(product.subtotal)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Items:</span>
                    <span className="font-medium">{formData.products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateTotals().subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT ({VAT_RATE}%):</span>
                    <span className="font-medium">{formatCurrency(calculateTotals().vatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-green-600">{formatCurrency(calculateTotals().grandTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="note">Special Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Enter any special notes or comments about this purchase order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating Purchase Order...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Purchase Order
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
