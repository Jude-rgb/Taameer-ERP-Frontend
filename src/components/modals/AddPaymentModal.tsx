import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  Calendar, 
  CreditCard,
  Save,
  Trash2
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
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { formatDate } from '@/utils/formatters';

// Interfaces
interface PurchaseOrder {
  id: number;
  purchase_no: string;
  quotation_ref: string;
  grand_total: string;
  currency_type: string;
  currency_decimal_places: number;
}

interface FormData {
  date: string;
  payment_method: string;
  payment_note: string;
}

interface FormErrors {
  date?: string;
  payment_method?: string;
  file?: string;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onSuccess?: () => void; // Callback to refresh parent component
}

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Other', label: 'Other' }
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const AddPaymentModal = ({ 
  isOpen, 
  onClose, 
  purchaseOrder,
  onSuccess
}: AddPaymentModalProps) => {
  const { toast } = useToast();
  const { createPayment } = usePurchaseOrderStore();
  
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0], // Today's date
    payment_method: '',
    payment_note: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        payment_method: '',
        payment_note: ''
      });
      setErrors({});
      setSelectedFile(null);
      setFileName('');
    }
  }, [isOpen]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      setFileName('');
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPG, JPEG, or PNG file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    
    // Clear file error
    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.date) {
      newErrors.date = 'Payment date is required';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!purchaseOrder) {
      toast({
        title: "Error",
        description: "Purchase order information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get user data from localStorage
      const user_id = localStorage.getItem('user_id') || '1';
      const user_name = localStorage.getItem('full_name') || 'Developer';
      
      // Extract only numeric value from grand_total (remove currency text)
      const numericAmount = purchaseOrder.grand_total.replace(/[^\d.]/g, '');
      
      // Create FormData for file upload - send file as binary
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.date);
      formDataToSend.append('quotation_ref', purchaseOrder.quotation_ref);
      formDataToSend.append('amount', numericAmount); // Send only numeric value
      formDataToSend.append('payment_method', formData.payment_method);
      
      // Add file as binary (not JSON metadata)
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      } else {
        formDataToSend.append('file', 'undefined');
      }
      
      formDataToSend.append('purchase_id', purchaseOrder.id.toString());
      formDataToSend.append('payment_note', formData.payment_note);
      formDataToSend.append('user_id', user_id);
      formDataToSend.append('user_name', user_name);

      // Debug: Log the FormData contents
      console.log('FormData being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const result = await createPayment(formDataToSend);

      toast({
        title: "Success",
        description: "Payment added successfully",
        variant: "success",
      });
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
      const currency = purchaseOrder?.currency_type || 'OMR';
      const decimals = purchaseOrder?.currency_decimal_places || 3;
      return `${currency} ${numAmount.toFixed(decimals)}`;
    } catch (error) {
      return 'OMR 0.000';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="h-6 w-6 text-green-500" />
            Add Payment
          </DialogTitle>
          <DialogDescription className="text-base">
            Add a new payment for purchase order {purchaseOrder?.purchase_no}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purchase Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-500" />
                Purchase Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Purchase Order Number</Label>
                  <p className="text-sm font-medium mt-1">{purchaseOrder?.purchase_no || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Quotation Reference</Label>
                  <p className="text-sm font-medium mt-1">{purchaseOrder?.quotation_ref || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Purchase Order Value</Label>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    {purchaseOrder ? formatCurrency(purchaseOrder.grand_total) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-purple-500" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                  >
                    <SelectTrigger className={errors.payment_method ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.payment_method && (
                    <p className="text-sm text-red-500">{errors.payment_method}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-orange-500" />
                Attachment (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload Document</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  {fileName && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {fileName && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="w-4 h-4" />
                    {fileName}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, JPEG, PNG (Max size: 2MB)
                </p>
                {errors.file && (
                  <p className="text-sm text-red-500">{errors.file}</p>
                )}
              </div>
            </CardContent>
          </Card>

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
                <Label htmlFor="payment_note">Special Note (Optional)</Label>
                <Textarea
                  id="payment_note"
                  value={formData.payment_note}
                  onChange={(e) => handleInputChange('payment_note', e.target.value)}
                  placeholder="Enter any special notes or comments about this payment..."
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
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Add Payment
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
