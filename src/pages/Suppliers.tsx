import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Edit, Trash2, ToggleRight, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { SupplierModal } from '@/components/modals/SupplierModal';
import { SupplierDetailsModal } from '@/components/modals/SupplierDetailsModal';
import { useSupplierStore } from '@/store/useSupplierStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';

interface Supplier {
  id: number;
  selectedOption?: 'individual_type' | 'business_type';
  supplier_type?: 'individual_type' | 'business_type';
  first_name?: string;
  last_name?: string;
  business_name?: string;
  buiness_name?: string;
  mobile_number?: string;
  email?: string;
  address_line_1?: string;
  tax_number?: string;
  status?: string;
  created_at?: string;
  avatar?: string;
}

export const Suppliers = () => {
  const { suppliers, fetchSuppliers, deleteSupplier, toggleStatus, isLoading } = useSupplierStore();
  const { toast } = useToast();
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<number | string>>(new Set());

  // Fetch suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        await fetchSuppliers();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch suppliers",
          variant: "destructive",
        });
      }
    };

    loadSuppliers();
  }, [fetchSuppliers, toast]);

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setModalMode('add');
    setIsSupplierModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setModalMode('edit');
    setIsSupplierModalOpen(true);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsModalOpen(true);
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    // User feedback: Show info alert for unimplemented API functions
    toast({
      title: "Info",
      description: "Supplier status toggle functionality will be available when API is fully implemented.",
      variant: "info",
    });
  };

  const confirmDelete = async () => {
    if (!selectedSupplier) return;
    
    // User feedback: Show info alert for unimplemented API functions
    toast({
      title: "Info",
      description: "Supplier delete functionality will be available when API is fully implemented.",
      variant: "info",
    });
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
  };

  // Get supplier type badge styling
  const getSupplierTypeBadge = (supplier: Supplier) => {
    const type = supplier.selectedOption || supplier.supplier_type;
    switch (type) {
      case 'individual_type':
        return <Badge className="bg-blue-500 text-white">Individual</Badge>;
      case 'business_type':
        return <Badge className="bg-green-500 text-white">Business</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inactive</Badge>;
      default:
        return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
  };

  // Get supplier name
  const getSupplierName = (supplier: Supplier) => {
    if (supplier.selectedOption === 'business_type' || supplier.supplier_type === 'business_type') {
      return supplier.business_name || supplier.buiness_name || 'N/A';
    } else {
      const firstName = supplier.first_name || '';
      const lastName = supplier.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    }
  };

  // Get supplier initials for avatar
  const getSupplierInitials = (supplier: Supplier) => {
    const name = getSupplierName(supplier);
    if (name === 'N/A') return 'S';
    return name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Table columns definition
  const columns: Column<Supplier>[] = [
    {
      key: 'supplier',
      header: 'Supplier',
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={supplier.avatar} />
            <AvatarFallback className="bg-gradient-primary text-white font-medium">
              {getSupplierInitials(supplier)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{getSupplierName(supplier)}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {supplier.email || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (supplier) => getSupplierTypeBadge(supplier)
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (supplier) => (
        supplier.mobile_number ? (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {supplier.mobile_number}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (supplier) => getStatusBadge(supplier.status)
    },
    {
      key: 'created',
      header: 'Created',
      render: (supplier) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {supplier.created_at ? formatDate(supplier.created_at) : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (supplier) => (
        <div className="flex items-center justify-end gap-2">
          <span onClick={(e) => e.stopPropagation()}>
            <ActionButton
              icon={ToggleRight}
              tooltip="Toggle Status"
              color="green"
              onClick={() => handleToggleStatus(supplier)}
            />
          </span>
          <span onClick={(e) => e.stopPropagation()}>
            <ActionButton
              icon={Edit}
              tooltip="Edit Supplier"
              color="blue"
              onClick={() => handleEditSupplier(supplier)}
            />
          </span>
          <span onClick={(e) => e.stopPropagation()}>
            <ActionButton
              icon={Trash2}
              tooltip="Delete Supplier"
              color="red"
              onClick={() => handleDeleteSupplier(supplier)}
            />
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Suppliers</h1>
        <p className="text-muted-foreground">Manage supplier accounts and information</p>
      </motion.div>

      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5" />
                Supplier Management
              </CardTitle>
              <CardDescription>
                Manage supplier accounts, contact information, and status
              </CardDescription>
            </div>
            <Button 
              onClick={handleAddSupplier} 
              className="hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary-hover"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={suppliers}
            columns={columns}
            searchKey="business_name"
            searchPlaceholder="Search suppliers..."
            loading={isLoading}
            onRowSelect={setSelectedSupplierIds}
            emptyMessage="No suppliers available."
            idKey="id"
            onRowClick={(supplier) => handleViewDetails(supplier)}
          />
        </CardContent>
      </Card>

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplier={selectedSupplier}
        mode={modalMode}
      />

      <SupplierDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        supplier={selectedSupplier}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        description={`Are you sure you want to delete ${selectedSupplier ? getSupplierName(selectedSupplier) : 'this supplier'}? This action cannot be undone.`}
      />
    </div>
  );
};
