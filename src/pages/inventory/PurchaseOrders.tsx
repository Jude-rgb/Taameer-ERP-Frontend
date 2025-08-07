import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  FileText, 
  Calendar, 
  Building2,
  Download,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { PurchaseOrderDetailsModal } from '@/components/modals/PurchaseOrderDetailsModal';

import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/formatters';
import { exportPurchaseOrdersToExcel } from '@/utils/exportToExcel';

interface PurchaseOrder {
  id: number;
  purchase_no: string;
  quotation_ref: string;
  purchase_date: string;
  created_at: string;
  grand_total: string;
  product_count: number;
  purchase_status: string;
  payment_status: string;
  stock_status: string;
  currency_type: string;
  currency_decimal_places: number;
  suppliers: {
    id: number;
    supplier_type: string;
    business_name?: string;
    first_name?: string;
    last_name?: string;
  };
  // Add a computed field for search
  searchableText?: string;
}

export const PurchaseOrders = () => {
  const { 
    purchaseOrders, 
    fetchPurchaseOrders, 
    deletePurchaseOrder,
    isLoading
  } = usePurchaseOrderStore();
  
  const { toast } = useToast();
  
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<Set<number | string>>(new Set());
  

  // Helper function to get supplier name - must be defined before useMemo
  const getSupplierName = (supplier: any) => {
    if (supplier.supplier_type === 'business_type') {
      return supplier.business_name || 'N/A';
    } else {
      const firstName = supplier.first_name || '';
      const lastName = supplier.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'N/A';
    }
  };

  // Fetch purchase orders on component mount - following same pattern as other pages
  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        await fetchPurchaseOrders();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch purchase orders",
          variant: "destructive",
        });
      }
    };

    loadPurchaseOrders();
  }, [fetchPurchaseOrders, toast]);


  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    console.log('Edit purchase order:', purchaseOrder); // Debug log
    toast({
      title: "Info",
      description: "Edit purchase order functionality will be available when API is fully implemented.",
      variant: "info",
    });
  };

  const handleDeletePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    console.log('Delete purchase order:', purchaseOrder); // Debug log
    setSelectedPurchaseOrder(purchaseOrder);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateReceivedQty = (purchaseOrder: PurchaseOrder) => {
    console.log('Update received quantity:', purchaseOrder); // Debug log
    toast({
      title: "Info",
      description: "Update received quantity functionality will be available when API is fully implemented.",
      variant: "info",
    });
  };

  const handleRowClick = (purchaseOrder: PurchaseOrder) => {
    console.log('Row clicked:', purchaseOrder); // Debug log
    setSelectedPurchaseOrder(purchaseOrder);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsEdit = (purchaseOrder: PurchaseOrder) => {
    handleEditPurchaseOrder(purchaseOrder);
  };

  const handleDetailsDelete = (purchaseOrder: PurchaseOrder) => {
    handleDeletePurchaseOrder(purchaseOrder);
  };

  const confirmDelete = async () => {
    if (!selectedPurchaseOrder) return;
    
    try {
      await deletePurchaseOrder(selectedPurchaseOrder.id);
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
        variant: "success",
      });
      setIsDeleteModalOpen(false);
      setSelectedPurchaseOrder(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete purchase order",
        variant: "destructive",
      });
    }
  };

  const getSupplierInitials = (supplier: any) => {
    const name = getSupplierName(supplier);
    if (name === 'N/A') return 'S';
    return name
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string, type: 'purchase' | 'payment') => {
    const statusMap = {
      purchase: {
        completed: { label: 'Completed', className: 'bg-green-500 text-white' },
        ordered: { label: 'Ordered', className: 'bg-blue-500 text-white' },
        partially: { label: 'Partially', className: 'bg-orange-500 text-white' },
        received: { label: 'Received', className: 'bg-green-500 text-white' },
        draft: { label: 'Draft', className: 'bg-gray-500 text-white' },
        cancelled: { label: 'Cancelled', className: 'bg-red-500 text-white' }
      },
      payment: {
        pending: { label: 'Pending', className: 'bg-yellow-500 text-white' },
        done: { label: 'Paid', className: 'bg-green-500 text-white' }
      }
    };

    const statusConfig = statusMap[type][status.toLowerCase()] || { label: status, className: 'bg-gray-500 text-white' };
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const formatCurrency = (amount: string, currencyType: string = 'OMR', decimalPlaces: number = 3) => {
    const numAmount = parseFloat(amount) || 0;
    return `${currencyType} ${numAmount.toFixed(decimalPlaces)}`;
  };




  const handleExportToExcel = async () => {
    try {
      await exportPurchaseOrdersToExcel(purchaseOrders);
      
      toast({
        title: "Success",
        description: "Purchase orders exported to Excel successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export purchase orders",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = (purchaseOrder: PurchaseOrder) => {
    console.log('Generate PDF for:', purchaseOrder); // Debug log
    toast({
      title: "Info",
      description: "PDF generation functionality will be available when API is fully implemented.",
      variant: "info",
    });
  };

  // Table columns definition
  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'purchase_no',
      header: 'Purchase No',
      render: (order) => (
        <div className="font-medium text-foreground">
          {order.purchase_no}
        </div>
      )
    },
    {
      key: 'quotation_ref',
      header: 'Quotation Ref',
      render: (order) => (
        <div className="text-sm text-muted-foreground">
          {order.quotation_ref || 'N/A'}
        </div>
      )
    },
    {
      key: 'supplier',
      header: 'Supplier Name',
      render: (order) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-primary text-white text-xs font-medium">
              {getSupplierInitials(order.suppliers)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{getSupplierName(order.suppliers)}</div>
            <div className="text-xs text-muted-foreground">
              {order.suppliers.supplier_type === 'business_type' ? 'Business' : 'Individual'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'purchase_date',
      header: 'Purchase Date',
      render: (order) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(order.purchase_date)}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (order) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(order.created_at)}
        </div>
      )
    },
    {
      key: 'product_count',
      header: 'Product Count',
      render: (order) => (
        <div className="text-sm font-medium">
          {order.product_count}
        </div>
      )
    },
    {
      key: 'grand_total',
      header: 'Grand Total',
      render: (order) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(order.grand_total, order.currency_type, order.currency_decimal_places)}
        </div>
      )
    },
    {
      key: 'stock_status',
      header: 'Stock Status',
      render: (order) => getStatusBadge(order.stock_status, 'purchase')
    },
    {
      key: 'payment_status',
      header: 'Payment Status',
      render: (order) => getStatusBadge(order.payment_status, 'payment')
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (order) => {
        console.log('Rendering actions for order:', order); // Debug log
        console.log('Order status:', { 
          stock_status: order.stock_status, 
          payment_status: order.payment_status 
        }); // Debug log
        
        // Action button visibility logic based on stock_status
        const canEdit = order.stock_status !== 'completed' && order.stock_status !== 'partially';
        const canDelete = order.stock_status !== 'completed' && order.stock_status !== 'partially';
        const canUpdateReceivedQty = order.stock_status !== 'completed';

        return (
          <div className="flex items-center justify-end gap-2">
            {canEdit && (
              <ActionButton
                icon={Edit}
                tooltip="Edit Purchase Order"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPurchaseOrder(order);
                }}
              />
            )}
            {canDelete && (
              <ActionButton
                icon={Trash2}
                tooltip="Delete Purchase Order"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePurchaseOrder(order);
                }}
              />
            )}
            <ActionButton
              icon={Download}
              tooltip="Generate PDF"
              color="green"
              onClick={(e) => {
                e.stopPropagation();
                handleGeneratePDF(order);
              }}
            />
            {canUpdateReceivedQty && (
              <ActionButton
                icon={PackageCheck}
                tooltip="Update Received Quantity"
                color="yellow"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateReceivedQty(order);
                }}
              />
            )}
          </div>
        );
      }
    }
  ];


  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Purchase Orders</h1>
        <p className="text-muted-foreground">Manage purchase orders and supplier relationships</p>
      </motion.div>




      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Purchase Order Management</CardTitle>
              <CardDescription>
                {purchaseOrders.length} purchase orders
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={handleExportToExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button 
                className="hover:scale-105 transition-all duration-200 bg-primary hover:bg-primary-hover"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={purchaseOrders}
            columns={columns}
            searchKey="purchase_no"
            searchPlaceholder="Search purchase orders..."
            loading={isLoading}
            onRowSelect={setSelectedPurchaseOrderIds}
            emptyMessage="No purchase orders available."
            idKey="id"
            onRowClick={(order) => handleRowClick(order)}
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      <PurchaseOrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        purchaseOrder={selectedPurchaseOrder}
        onEdit={handleDetailsEdit}
        onDelete={handleDetailsDelete}
      />


      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Purchase Order"
        description={`Are you sure you want to delete purchase order ${selectedPurchaseOrder?.purchase_no}? This action cannot be undone.`}
      />
    </div>
  );
};