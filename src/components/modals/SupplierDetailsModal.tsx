import { motion } from 'framer-motion';
import { Building2, User, Mail, Phone, MapPin, FileText, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/utils/formatters';

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: any;
}

export const SupplierDetailsModal = ({ isOpen, onClose, supplier }: SupplierDetailsModalProps) => {
  if (!supplier) return null;

  const getSupplierTypeBadge = (type: string) => {
    switch (type) {
      case 'individual_type':
        return <Badge className="bg-blue-500 text-white">Individual</Badge>;
      case 'business_type':
        return <Badge className="bg-green-500 text-white">Business</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inactive</Badge>;
      default:
        return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
  };

  const getSupplierName = () => {
    if (supplier.selectedOption === 'business_type' || supplier.supplier_type === 'business_type') {
      return supplier.business_name || supplier.buiness_name || 'N/A';
    } else {
      const firstName = supplier.first_name || '';
      const lastName = supplier.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    }
  };

  const getSupplierInitials = () => {
    const name = getSupplierName();
    if (name === 'N/A') return 'S';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Supplier Details
          </DialogTitle>
          <DialogDescription>
            View complete supplier information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={supplier.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-white font-medium text-lg">
                    {getSupplierInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{getSupplierName()}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getSupplierTypeBadge(supplier.selectedOption || supplier.supplier_type)}
                    {getStatusBadge(supplier.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Mobile Number</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.mobile_number || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {supplier.address_line_1 || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tax Number</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.tax_number || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.created_at ? formatDate(supplier.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual/Business Specific Info */}
          {(supplier.selectedOption === 'individual_type' || supplier.supplier_type === 'individual_type') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">First Name</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.first_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Name</p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.last_name || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(supplier.selectedOption === 'business_type' || supplier.supplier_type === 'business_type') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium">Business Name</p>
                  <p className="text-sm text-muted-foreground">
                    {supplier.business_name || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end pt-6"
        >
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
