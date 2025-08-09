import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2, Package, Calendar, Download } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/store/useProductStore';
import { useToast } from '@/hooks/use-toast';

// Product interface based on API requirements
interface Product {
  id?: number;
  product_code: string;
  product_brand: string;
  product_name: string;
  description?: string;
  product_image?: string;
  product_weight: string;
  product_unit: string;
  unit_price_shop: number;
  unit_price_customer: number;
  cost_price?: number;
  total_stock?: number;
  warehouse_stock?: number;
  sold_stock?: number;
  availability?: 'online' | 'offline';
  updated_at?: string;
  created_at?: string;
}

interface ProductVariation {
  id: string;
  type: string;
  value: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const PRODUCT_UNITS = [
  'kg',         // kilogram
  'g',          // gram
  'mg',         // milligram
  'ton',        // metric ton
  'lb',         // pound
  'oz',         // ounce

  'l',          // liter
  'ml',         // milliliter
  'gal',        // gallon

  'm',          // meter
  'cm',         // centimeter
  'mm',         // millimeter
  'ft',         // feet
  'inch',       // inch

  'm²',         // square meter
  'ft²',        // square feet
  'cm²',        // square cm

  'm³',         // cubic meter
  'ft³',        // cubic feet
  'L/m²',       // liters per square meter

  'sheet',      // sheets
  'roll',       // rolls
  'bag',        // bags
  'box',        // boxes
  'pack',       // packs
  'bottle',     // bottles
  'can',        // cans
  'tube',       // tubes
  'piece',      // individual item
  'set',        // sets
  'bundle',     // bundles
  'pallet',     // pallets
  'container',  // containers
  'carton',     // cartons
  'drum',       // drums
  'barrel',     // barrels

  'g/m²',       // grams per square meter
  'pcs',        // shorthand for pieces
];


const VARIATION_TYPES = [
  'color',
  'size',
  'material',
  'other'
];

export const ProductModal = ({ isOpen, onClose, product }: ProductModalProps) => {
  const { addProduct, updateProduct, getUniqueBrands, isLoading } = useProductStore();
  const { toast } = useToast();
  const availableBrands = getUniqueBrands();

  const [formData, setFormData] = useState<Partial<Product>>({
    product_code: '',
    product_brand: '',
    product_name: '',
    description: '',
    product_image: '',
    product_weight: '',
    product_unit: '',
    unit_price_shop: 0,
    unit_price_customer: 0,
    cost_price: 0,
    total_stock: 0,
    warehouse_stock: 0,
    sold_stock: 0,
    availability: 'online',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newVariationType, setNewVariationType] = useState('');
  const [newVariationValue, setNewVariationValue] = useState('');
  const [isTypingBrand, setIsTypingBrand] = useState(false);
  const [brandInputValue, setBrandInputValue] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        product_code: product.product_code || '',
        product_brand: product.product_brand || '',
        product_name: product.product_name || '',
        description: product.description || '',
        product_image: product.product_image || '',
        product_weight: product.product_weight || '',
        product_unit: product.product_unit || '',
        unit_price_shop: product.unit_price_shop || 0,
        unit_price_customer: product.unit_price_customer || 0,
        cost_price: product.cost_price || 0,
        total_stock: product.total_stock || 0,
        warehouse_stock: product.warehouse_stock || 0,
        sold_stock: product.sold_stock || 0,
        availability: product.availability || 'online',
      });
    } else {
      setFormData({
        product_code: '',
        product_brand: '',
        product_name: '',
        description: '',
        product_image: '',
        product_weight: '',
        product_unit: '',
        unit_price_shop: 0,
        unit_price_customer: 0,
        cost_price: 0,
        total_stock: 0,
        warehouse_stock: 0,
        sold_stock: 0,
        availability: 'online',
      });
    }
    setErrors({});
    setVariations([]);
    setBrandInputValue('');
    setIsTypingBrand(false);
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_code?.trim()) {
      newErrors.product_code = 'Product code is required';
    }
    if (!formData.product_brand?.trim()) {
      newErrors.product_brand = 'Brand is required';
    }
    if (!formData.product_name?.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    if (!formData.product_weight?.trim()) {
      newErrors.product_weight = 'Weight is required';
    }
    if (!formData.product_unit?.trim()) {
      newErrors.product_unit = 'Unit is required';
    }
    if (!formData.unit_price_shop || formData.unit_price_shop <= 0) {
      newErrors.unit_price_shop = 'Shop price must be greater than 0';
    }
    if (!formData.unit_price_customer || formData.unit_price_customer <= 0) {
      newErrors.unit_price_customer = 'Customer price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Disable add/update for now; show info toast like other screens
    toast({
      title: "Info",
      description: "Product add/update will be available when API is fully implemented.",
      variant: "info",
    });
  };

  const handleChange = (field: keyof Product, value: any) => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          product_image: 'Please select an image file'
        }));
        return;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          product_image: 'Image size must be less than 2MB'
        }));
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('product_image', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariation = () => {
    if (newVariationType && newVariationValue) {
      const newVariation: ProductVariation = {
        id: Date.now().toString(),
        type: newVariationType,
        value: newVariationValue,
      };
      setVariations([...variations, newVariation]);
      setNewVariationType('');
      setNewVariationValue('');
    }
  };

  const removeVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6 text-orange-500" />
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {product ? 'Update product information and pricing details' : 'Add a new product to your inventory catalog'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200 border-b pb-2">
              <Package className="h-5 w-5 text-blue-500" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_code">Product Code *</Label>
                <Input
                  id="product_code"
                  value={formData.product_code || ''}
                  onChange={(e) => handleChange('product_code', e.target.value)}
                  placeholder="Enter product code"
                  className={errors.product_code ? 'border-red-500' : ''}
                  readOnly={!!product} // Read-only for update
                />
                {errors.product_code && (
                  <p className="text-sm text-red-500">{errors.product_code}</p>
                )}
              </div>

                             <div className="space-y-2">
                 <Label htmlFor="product_brand">Brand *</Label>
                 <div className="flex gap-2">
                   <Select
                     value={!isTypingBrand ? (formData.product_brand || '') : ''}
                     onValueChange={(value) => {
                       handleChange('product_brand', value);
                       setIsTypingBrand(false);
                       setBrandInputValue('');
                     }}
                     disabled={isTypingBrand}
                   >
                     <SelectTrigger className={`flex-1 ${errors.product_brand ? 'border-red-500' : ''}`}>
                       <SelectValue placeholder="Select existing brand" />
                     </SelectTrigger>
                     <SelectContent>
                       {availableBrands.map((brand) => (
                         <SelectItem key={brand} value={brand}>
                           {brand}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <Input
                     placeholder="Or type new brand"
                     value={brandInputValue}
                     onChange={(e) => {
                       const value = e.target.value;
                       setBrandInputValue(value);
                       handleChange('product_brand', value);
                       setIsTypingBrand(value.length > 0);
                     }}
                     onFocus={() => setIsTypingBrand(true)}
                     onBlur={() => {
                       if (brandInputValue.length === 0) {
                         setIsTypingBrand(false);
                       }
                     }}
                     className={`flex-1 ${errors.product_brand ? 'border-red-500' : ''}`}
                   />
                 </div>
                 {errors.product_brand && (
                   <p className="text-sm text-red-500">{errors.product_brand}</p>
                 )}
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name || ''}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="Enter product name"
                className={errors.product_name ? 'border-red-500' : ''}
              />
              {errors.product_name && (
                <p className="text-sm text-red-500">{errors.product_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
            <p className="text-sm text-muted-foreground bg-gray-200 dark:bg-gray-800 p-3 rounded-md">
              <strong>Coming Soon:</strong> Product image adding option will be added in a future update.
            </p>

            <div className="space-y-2">
              <Label htmlFor="product_image">Product Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {formData.product_image ? (
                    <img
                      src={formData.product_image}
                      alt="Product preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="product_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast({
                        title: 'Info',
                        description: 'Product image upload will be available when API is fully implemented.',
                        variant: 'info',
                      })
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: 2MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
              {errors.product_image && (
                <p className="text-sm text-red-500">{errors.product_image}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200 border-b pb-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Additional Information
            </h3>
            <p className="text-sm text-muted-foreground bg-gray-200 dark:bg-gray-800 p-3 rounded-md">
              <strong>Coming Soon:</strong> Availability toggle will be added in a future update.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_weight">Weight *</Label>
                <Input
                  id="product_weight"
                  type="number"
                  value={formData.product_weight || ''}
                  onChange={(e) => handleChange('product_weight', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={errors.product_weight ? 'border-red-500' : ''}
                />
                {errors.product_weight && (
                  <p className="text-sm text-red-500">{errors.product_weight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_unit">Unit *</Label>
                <Select
                  value={formData.product_unit || ''}
                  onValueChange={(value) => handleChange('product_unit', value)}
                >
                  <SelectTrigger className={errors.product_unit ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.product_unit && (
                  <p className="text-sm text-red-500">{errors.product_unit}</p>
                )}
              </div>
              

              <div className="space-y-2">
                <Label>Availability</Label>
                <RadioGroup
                  value={formData.availability || 'online'}
                  onValueChange={(value) => handleChange('availability', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online">Online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="offline" id="offline" />
                    <Label htmlFor="offline">Offline</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200 border-b pb-2">
              <Download className="h-5 w-5 text-green-500" />
              Pricing Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_price_shop">Unit Price (Shop) *</Label>
                <Input
                  id="unit_price_shop"
                  type="number"
                  value={formData.unit_price_shop || 0}
                  onChange={(e) => handleChange('unit_price_shop', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={errors.unit_price_shop ? 'border-red-500' : ''}
                />
                {errors.unit_price_shop && (
                  <p className="text-sm text-red-500">{errors.unit_price_shop}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price_customer">Unit Price (Customer) *</Label>
                <Input
                  id="unit_price_customer"
                  type="number"
                  value={formData.unit_price_customer || 0}
                  onChange={(e) => handleChange('unit_price_customer', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={errors.unit_price_customer ? 'border-red-500' : ''}
                />
                {errors.unit_price_customer && (
                  <p className="text-sm text-red-500">{errors.unit_price_customer}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  value={formData.cost_price || 0}
                  onChange={(e) => handleChange('cost_price', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Product Variations (UI only) */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200 border-b pb-2">
              <Plus className="h-5 w-5 text-purple-500" />
              Product Variations
            </h3>
            <p className="text-sm text-muted-foreground bg-gray-200 dark:bg-gray-800 p-3 rounded-md">
              <strong>Coming Soon:</strong> Variation management will be available in future updates for color, size, material, and other product attributes.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Add Variation</h4>
                <div className="flex gap-3">
                  <Select value={newVariationType} onValueChange={setNewVariationType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enter variation value"
                    value={newVariationValue}
                    onChange={(e) => setNewVariationValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariation}
                    disabled={!newVariationType || !newVariationValue}
                    className="px-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {variations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Current Variations</h4>
                  <div className="flex flex-wrap gap-2">
                    {variations.map((variation) => (
                      <Badge 
                        key={variation.id} 
                        variant="secondary" 
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <span className="font-medium">{variation.type}:</span>
                        <span>{variation.value}</span>
                        <button
                          type="button"
                          onClick={() => removeVariation(variation.id)}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2"
            >
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
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {product ? 'Update Product' : 'Add Product'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};