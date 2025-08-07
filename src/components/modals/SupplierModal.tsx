import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Mail, Phone, MapPin, FileText, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupplierStore } from '@/store/useSupplierStore';
import { useToast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/apiUtils';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: any;
  mode: 'add' | 'edit';
}

interface FormData {
  selectedOption: 'individual_type' | 'business_type';
  first_name: string;
  last_name: string;
  buiness_name: string;
  mobile_number: string;
  email: string;
  address_line_1: string;
  tax_number: string;
}

interface FormErrors {
  selectedOption?: string;
  first_name?: string;
  last_name?: string;
  buiness_name?: string;
  mobile_number?: string;
  email?: string;
  address_line_1?: string;
  tax_number?: string;
}

export const SupplierModal = ({ isOpen, onClose, supplier, mode }: SupplierModalProps) => {
  const { addSupplier, updateSupplier, isLoading } = useSupplierStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    selectedOption: 'individual_type',
    first_name: '',
    last_name: '',
    buiness_name: '',
    mobile_number: '',
    email: '',
    address_line_1: '',
    tax_number: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (supplier && mode === 'edit') {
      setFormData({
        selectedOption: supplier.selectedOption || supplier.supplier_type || 'individual_type',
        first_name: supplier.first_name || 'N/A',
        last_name: supplier.last_name || 'N/A',
        buiness_name: supplier.business_name || supplier.buiness_name || 'N/A',
        mobile_number: supplier.mobile_number || '',
        email: supplier.email || '',
        address_line_1: supplier.address_line_1 || '',
        tax_number: supplier.tax_number || ''
      });
    } else {
      setFormData({
        selectedOption: 'individual_type',
        first_name: '',
        last_name: '',
        buiness_name: '',
        mobile_number: '',
        email: '',
        address_line_1: '',
        tax_number: ''
      });
    }
    setErrors({});
  }, [supplier, mode, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.selectedOption) {
      newErrors.selectedOption = 'Supplier type is required';
    }

    if (formData.selectedOption === 'individual_type') {
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name.trim()) {
        newErrors.last_name = 'Last name is required';
      }
    } else if (formData.selectedOption === 'business_type') {
      if (!formData.buiness_name.trim()) {
        newErrors.buiness_name = 'Business name is required';
      }
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 = 'Address is required';
    }

    if (!formData.tax_number.trim()) {
      newErrors.tax_number = 'Tax number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'add') {
        await addSupplier(formData);
        toast({
          title: "Success",
          description: "Supplier created successfully",
          variant: "success",
        });
        onClose();
      } else if (mode === 'edit') {
        // User feedback: Show info alert for unimplemented API functions
        toast({
          title: "Info",
          description: "Supplier update functionality will be available when API is fully implemented.",
          variant: "info",
        });
        onClose(); // Close the modal even if not actually updating
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save supplier",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {mode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Create a new supplier account' : 'Update supplier information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectedOption">Supplier Type *</Label>
                <Select
                  value={formData.selectedOption}
                  onValueChange={(value: 'individual_type' | 'business_type') => 
                    handleInputChange('selectedOption', value)
                  }
                >
                  <SelectTrigger className={errors.selectedOption ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual_type">Individual</SelectItem>
                    <SelectItem value="business_type">Business</SelectItem>
                  </SelectContent>
                </Select>
                {errors.selectedOption && (
                  <p className="text-sm text-red-500">{errors.selectedOption}</p>
                )}
              </div>

              {formData.selectedOption === 'individual_type' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                      required
                      className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500">{errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                      required
                      className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-500">{errors.last_name}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="buiness_name">Business Name *</Label>
                  <Input
                    id="buiness_name"
                    value={formData.buiness_name}
                    onChange={(e) => handleInputChange('buiness_name', e.target.value)}
                    placeholder="Enter business name"
                    required
                    className={errors.buiness_name ? 'border-red-500' : ''}
                  />
                  {errors.buiness_name && (
                    <p className="text-sm text-red-500">{errors.buiness_name}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile_number">Mobile Number *</Label>
                  <Input
                    id="mobile_number"
                    value={formData.mobile_number}
                    onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                    placeholder="+968 9123 4567"
                    required
                    className={errors.mobile_number ? 'border-red-500' : ''}
                  />
                  {errors.mobile_number && (
                    <p className="text-sm text-red-500">{errors.mobile_number}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="supplier@example.com"
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address *</Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1}
                  onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                  placeholder="Enter complete address"
                  required
                  className={errors.address_line_1 ? 'border-red-500' : ''}
                />
                {errors.address_line_1 && (
                  <p className="text-sm text-red-500">{errors.address_line_1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_number">Tax Number *</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => handleInputChange('tax_number', e.target.value)}
                  placeholder="Enter tax number"
                  required
                  className={errors.tax_number ? 'border-red-500' : ''}
                />
                {errors.tax_number && (
                  <p className="text-sm text-red-500">{errors.tax_number}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-3 pt-6"
          >
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-hover">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'add' ? 'Creating...' : 'Saving...'}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'add' ? 'Add Supplier' : 'Update Supplier'}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
