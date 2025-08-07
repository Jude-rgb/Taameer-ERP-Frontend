import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Key, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/store/useUserStore';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePassword } from '@/utils/apiUtils';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  mode: 'add' | 'edit';
}

interface FormData {
  full_name: string;
  email: string;
  contact_number: string;
  role: string;
  status: string;
  permissions: string[];
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

const defaultModules = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inventory/products', label: 'Products' },
  { id: 'inventory/purchase-orders', label: 'Purchase Orders' },
  { id: 'inventory/stock', label: 'Stock Management' },
  { id: 'sales/quotations', label: 'Quotations' },
  { id: 'sales/invoices', label: 'Invoices' },
  { id: 'sales/delivery-notes', label: 'Delivery Notes' },
  { id: 'customers', label: 'Customers' },
  { id: 'reports', label: 'Reports' },
  { id: 'users', label: 'User Management' },
  { id: 'settings', label: 'System Settings' }
];

export const UserModal = ({ isOpen, onClose, user, mode }: UserModalProps) => {
  const { addUser, isLoading } = useUserStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    contact_number: '',
    role: 'Marketing_Officer',
    status: 'Active',
    permissions: [],
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        contact_number: user.contact_number || '',
        role: user.role || 'Marketing_Officer',
        status: user.status || 'Active',
        permissions: user.permissions || [],
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        contact_number: '',
        role: 'Marketing_Officer',
        status: 'Active',
        permissions: ['dashboard'],
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode === 'add') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          newErrors.password = passwordValidation.message;
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'add') {
        await addUser(formData);
        toast({
          title: "Success",
          description: "User created successfully",
          variant: "success",
        });
        onClose();
      } else if (mode === 'edit') {
        // TODO: Implement edit functionality when API is available
        toast({
          title: "Info",
          description: "Edit functionality will be implemented when API is available",
          variant: "info",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (moduleId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, moduleId]
        : prev.permissions.filter(p => p !== moduleId)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Create a new user account' : 'Update user information and permissions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl border border-border/50 h-15">
              <TabsTrigger value="basic" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions"  className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter full name"
                        required
                        className={errors.full_name ? 'border-red-500' : ''}
                      />
                      {errors.full_name && (
                        <p className="text-sm text-red-500">{errors.full_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        required
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_number">Phone Number</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => handleInputChange('contact_number', e.target.value)}
                        placeholder="+968 9123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange('role', value)}
                      >
                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                                                 <SelectContent>
                           <SelectItem value="ADMIN">Admin</SelectItem>
                           <SelectItem value="Accounts">Accounts</SelectItem>
                           <SelectItem value="Marketing_Officer">Marketing Officer</SelectItem>
                           <SelectItem value="Warehouse">Warehouse</SelectItem>
                         </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-sm text-red-500">{errors.role}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {mode === 'add' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                          required={mode === 'add'}
                          className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                          <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm password"
                          required={mode === 'add'}
                          className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Module Permissions
                  </CardTitle>
                  <CardDescription>
                    Select which modules this user can access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultModules.map((module) => (
                      <div key={module.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={module.id}
                          checked={formData.permissions.includes(module.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={module.id} className="text-sm font-medium">
                          {module.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
                  {mode === 'add' ? 'Add User' : 'Update User'}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};