import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Plus, 
  Trash2, 
  Package, 
  Calendar, 
  Building2,
  FileText,
  Save,
  Search,
  ChevronDown
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
import { productService } from '@/services/product.js';
import { getSuppliersForPurchase, createPurchaseOrder, getPurchaseOrderDetails } from '@/services/purchaseOrder.js';
import { processApiResponse, handleApiError } from '@/utils/apiUtils.js';

// Interfaces
interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  product_code: string;
  product_name: string;
  unit_price_customer: number | string | null | undefined;
}

interface PurchaseOrderProduct {
  name: string;
  code: string;
  quantity: string;
  price: string;
}

interface FormData {
  supplier: number | null;
  purchaseDate: string;
  quotation_ref: string;
  currency: string;
  status: string;
  products: PurchaseOrderProduct[];
  note: string;
}

interface FormErrors {
  supplier?: string;
  purchaseDate?: string;
  quotation_ref?: string;
  currency?: string;
  status?: string;
  products?: string;
}

interface PurchaseOrderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  purchaseOrder?: any; // For edit mode
  onSuccess?: () => void; // Callback for successful creation
}

const CURRENCY_OPTIONS = [
  { value: 'OMR', label: 'OMR - Omani Rial' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'TRY', label: 'TRY - Turkish Lira' }
];

const PURCHASE_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Ordered', label: 'Ordered' },
  { value: 'Received', label: 'Received' }
];

const VAT_RATE = 5.000; // Fixed 5% VAT

// Helper function to safely get product price
const getProductPrice = (product: Product): number => {
  if (typeof product.unit_price_customer === 'number') {
    return product.unit_price_customer;
  }
  if (typeof product.unit_price_customer === 'string') {
    const parsed = parseFloat(product.unit_price_customer);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to safely format price
const formatPrice = (price: number | string | null | undefined): string => {
  const numPrice = getProductPrice({ unit_price_customer: price } as Product);
  return numPrice.toFixed(3);
};

export const PurchaseOrderCreateModal = ({ 
  isOpen, 
  onClose, 
  mode, 
  purchaseOrder,
  onSuccess
}: PurchaseOrderCreateModalProps) => {
  const { toast } = useToast();
  
  const getInitialFormData = (): FormData => ({
    supplier: null,
    purchaseDate: new Date().toISOString().split('T')[0],
    quotation_ref: '',
    currency: 'OMR',
    status: 'Pending',
    products: [],
    note: ''
  });

  const [formData, setFormData] = useState<FormData>({
    ...getInitialFormData()
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Product entry form state
  const [productEntry, setProductEntry] = useState({
    name: '',
    code: '',
    quantity: '',
    price: ''
  });

  // Product selection UI state
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Load suppliers and products on modal open
  useEffect(() => {
    if (isOpen) {
      // Always start fresh when opening
      resetFormToInitial();

      loadSuppliers();
      loadProducts();
      
      // Only load purchase order details if we're in edit mode AND have a valid purchase order
      if (mode === 'edit' && purchaseOrder?.id) {
        loadPurchaseOrderDetails();
      }
    }
  }, [isOpen, mode, purchaseOrder?.id]); // Changed dependency to purchaseOrder?.id instead of purchaseOrder

  // Reset form when mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        // Ensure clean state for create mode - ignore any purchaseOrder data
        resetFormToInitial();
        // Force clear any existing purchase order data
        setFormData(getInitialFormData());
      }

    }
  }, [mode, isOpen]);

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      resetFormToInitial();
    }
  }, [isOpen]);

  // Additional safety check - ensure create mode never has purchase order data
  useEffect(() => {
    if (isOpen && mode === 'create') {
      // Double-check that we're in clean state for create mode
      const currentFormData = getInitialFormData();
      setFormData(currentFormData);
      setErrors({});
      setProductEntry({ name: '', code: '', quantity: '', price: '' });
      setShowProductSuggestions(false);
      setFilteredProducts([]);
      setSelectedProductIndex(-1);
      setIsProductDropdownOpen(false);
    }
  }, [isOpen, mode]);

  const resetFormToInitial = () => {
    setFormData(getInitialFormData());
    setErrors({});
    setProductEntry({ name: '', code: '', quantity: '', price: '' });
    setShowProductSuggestions(false);
    setFilteredProducts([]);
    setSelectedProductIndex(-1);
    setIsProductDropdownOpen(false);
  };

  const loadPurchaseOrderDetails = async () => {
    // Safety check - only load details in edit mode
    if (mode !== 'edit' || !purchaseOrder?.id) return;
    
    try {
      const response = await getPurchaseOrderDetails(purchaseOrder.id);
      const details = response.data;
      
      if (details) {
        // Transform purchase order details to form data
        const transformedProducts = details.purchases_product_details?.map((item: any) => ({
          name: item.product_name,
          code: item.product_code?.toString() || '',
          quantity: item.purchase_quantity?.toString() || '',
          price: item.unit_cost?.toString() || ''
        })) || [];

        setFormData({
          supplier: details.supplier_id || details.suppliers?.id || null,
          purchaseDate: details.purchase_date || new Date().toISOString().split('T')[0],
          quotation_ref: details.quotation_ref || '',
          currency: details.currency_type || 'OMR',
          status: details.status || 'Pending',
          products: transformedProducts,
          note: details.note || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load purchase order details",
        variant: "destructive",
      });
    }
  };

  const loadSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const response = await getSuppliersForPurchase();
      console.log('Suppliers response:', response); // Debug log
      setSuppliers(response.data || []);
    } catch (error: any) {
      console.error('Error loading suppliers:', error); // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to load suppliers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await productService.fetchAllProducts();
      console.log('Products response:', response); // Debug log
      
      // Ensure all products have valid price data
      const validProducts = (response.data || []).map((product: any) => ({
        ...product,
        unit_price_customer: getProductPrice(product)
      }));
      
      setProducts(validProducts);
    } catch (error: any) {
      console.error('Error loading products:', error); // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
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

  const handleProductEntryChange = (field: keyof typeof productEntry, value: string) => {
    setProductEntry(prev => ({
      ...prev,
      [field]: value
    }));

    // Handle product name changes for autocomplete
    if (field === 'name') {
      if (value.trim()) {
        // Filter products based on input
        const filtered = products.filter(product =>
          product.product_name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProducts(filtered);
        setShowProductSuggestions(true);
        setSelectedProductIndex(-1);
      } else {
        setShowProductSuggestions(false);
        setFilteredProducts([]);
        // Clear code and price when name is cleared
        setProductEntry(prev => ({
          ...prev,
          code: '',
          price: ''
        }));
      }
    }
  };

  const handleProductSelect = (product: Product) => {
    setProductEntry(prev => ({
      ...prev,
      name: product.product_name,
      code: product.product_code,
      price: getProductPrice(product).toString()
    }));
    setShowProductSuggestions(false);
    setFilteredProducts([]);
    setIsProductDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showProductSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedProductIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedProductIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedProductIndex >= 0 && filteredProducts[selectedProductIndex]) {
          handleProductSelect(filteredProducts[selectedProductIndex]);
        }
        break;
      case 'Escape':
        setShowProductSuggestions(false);
        setFilteredProducts([]);
        break;
    }
  };

  const addProduct = () => {
    if (!productEntry.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!productEntry.quantity || parseFloat(productEntry.quantity) <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (!productEntry.price || parseFloat(productEntry.price) <= 0) {
      toast({
        title: "Error",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    const newProduct: PurchaseOrderProduct = {
      name: productEntry.name,
      code: productEntry.code,
      quantity: productEntry.quantity,
      price: productEntry.price
    };

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));

    // Reset product entry form
    setProductEntry({ name: '', code: '', quantity: '', price: '' });
    setShowProductSuggestions(false);
    setFilteredProducts([]);
    setIsProductDropdownOpen(false);
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const calculateSubtotal = () => {
    return formData.products.reduce((total, product) => {
      return total + (parseFloat(product.quantity) * parseFloat(product.price));
    }, 0);
  };

  const calculateVATAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (VAT_RATE / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateVATAmount();
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (!formData.quotation_ref.trim()) {
      newErrors.quotation_ref = 'Quotation reference is required';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    if (!formData.status) {
      newErrors.status = 'Purchase status is required';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getUserData = () => {
    const full_name = localStorage.getItem('full_name') || 'Developer';
    const user_id = localStorage.getItem('user_id') || '1';
    return { full_name, user_id: parseInt(user_id) };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (mode === 'edit') {
      toast({
        title: "Info",
        description: "Update purchase order feature will be available when API is fully implemented.",
        variant: "info",
      });
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const { full_name, user_id } = getUserData();
      const subtotal = calculateSubtotal();
      const vatAmount = calculateVATAmount();
      const grandTotal = calculateGrandTotal();

      const payload = {
        supplier: formData.supplier,
        purchaseDate: formData.purchaseDate,
        quotation_ref: formData.quotation_ref,
        currency: formData.currency,
        status: formData.status,
        subTotal: parseFloat(subtotal.toFixed(3)),
        vatAmount: parseFloat(vatAmount.toFixed(3)),
        grandTotal: parseFloat(grandTotal.toFixed(3)),
        productCount: formData.products.length,
        products: formData.products,
        full_name,
        user_id,
        note: formData.note
      };

      const result = await createPurchaseOrder(payload);

      toast({
        title: "Success",
        description: "Purchase order created successfully",
        variant: "success",
      });
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      key={`${mode}-${isOpen}`} // Force re-render when mode changes
      open={isOpen} 
      onOpenChange={(open) => { 
        if (!open) { 
          // Aggressive cleanup when modal closes
          resetFormToInitial();
          // Force clear all state
          setFormData(getInitialFormData());
          setErrors({});
          setProductEntry({ name: '', code: '', quantity: '', price: '' });
          setShowProductSuggestions(false);
          setFilteredProducts([]);
          setSelectedProductIndex(-1);
          setIsProductDropdownOpen(false);
          onClose(); 
        } 
      }}
    >
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6 text-orange-500" />
            {mode === 'edit' ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'edit' 
              ? 'Update purchase order information and product details' 
              : 'Create a new purchase order with supplier and product information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-500" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplier?.toString() || ''}
                    onValueChange={(value) => handleInputChange('supplier', parseInt(value))}
                    disabled={isLoadingSuppliers}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label htmlFor="status">Purchase Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PURCHASE_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>VAT Rate:</strong> Fixed at {VAT_RATE}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-green-500" />
                Product Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <div className="relative">
                    <Input
                      id="product_name"
                      value={productEntry.name}
                      onChange={(e) => handleProductEntryChange('name', e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (productEntry.name.trim()) {
                          const filtered = products.filter(product =>
                            product.product_name.toLowerCase().includes(productEntry.name.toLowerCase())
                          );
                          setFilteredProducts(filtered);
                          setShowProductSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow for clicks
                        setTimeout(() => {
                          setShowProductSuggestions(false);
                        }, 200);
                      }}
                      placeholder="Search or enter product name"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Product Suggestions Dropdown */}
                  {(showProductSuggestions || isProductDropdownOpen) && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isProductDropdownOpen && !showProductSuggestions ? (
                        // Show all products when dropdown is opened
                        products.map((product, index) => (
                          <div
                            key={product.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              index === selectedProductIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Code: {product.product_code} | Price: {formData.currency} {formatPrice(product.unit_price_customer)}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Show filtered products when typing
                        filteredProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              index === selectedProductIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Code: {product.product_code} | Price: {formData.currency} {formatPrice(product.unit_price_customer)}
                            </div>
                          </div>
                        ))
                      )}
                      {filteredProducts.length === 0 && showProductSuggestions && (
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_code">Product Code</Label>
                  <Input
                    id="product_code"
                    value={productEntry.code}
                    onChange={(e) => handleProductEntryChange('code', e.target.value)}
                    placeholder="Auto-filled or manual"
                    disabled={!!productEntry.name && products.some(p => p.product_name === productEntry.name)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={productEntry.quantity}
                    onChange={(e) => handleProductEntryChange('quantity', e.target.value)}
                    placeholder="0"
                    min="1"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productEntry.price}
                    onChange={(e) => handleProductEntryChange('price', e.target.value)}
                    placeholder="0.000"
                    min="0"
                    step="0.001"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addProduct}
                className="bg-green-600 hover:bg-green-700"
                disabled={!productEntry.name || !productEntry.quantity || !productEntry.price}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>

          {/* Products Table */}
          {formData.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Products ({formData.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Product Code</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-right">Qty</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-right">Unit Price</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-right">Subtotal</th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.products.map((product, index) => {
                        const subtotal = parseFloat(product.quantity) * parseFloat(product.price);
                        return (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">{product.code}</td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">{product.name}</td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-right">{product.quantity}</td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-right">
                              {formData.currency} {parseFloat(product.price).toFixed(3)}
                            </td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-right font-medium">
                              {formData.currency} {subtotal.toFixed(3)}
                            </td>
                            <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeProduct(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="mt-4 space-y-2 text-right">
                  <div className="text-sm">
                    <span className="font-medium">Total Items:</span> {formData.products.length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Subtotal:</span> {formData.currency} {calculateSubtotal().toFixed(3)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">VAT ({VAT_RATE}%):</span> {formData.currency} {calculateVATAmount().toFixed(3)}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    <span>Grand Total:</span> {formData.currency} {calculateGrandTotal().toFixed(3)}
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
                <Label htmlFor="note">Special Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Enter any special notes or comments..."
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
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {mode === 'edit' ? 'Update Purchase Order' : 'Create Purchase Order'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

