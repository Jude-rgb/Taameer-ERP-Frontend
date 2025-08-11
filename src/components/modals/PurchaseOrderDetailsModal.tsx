import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Edit, Trash2, FileText, Calendar, Building2, CreditCard, CheckCircle, Download, Plus, Eye, Phone, Mail, MapPin, Hash, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActionButton } from '@/components/ui/action-button';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { VATSelectionModal } from '@/components/modals/VATSelectionModal';
import { usePurchaseOrderStore } from '@/store/usePurchaseOrderStore';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from "@/utils/formatters";
import { generatePurchaseOrderPDF } from "@/components/pdf";
import api from "@/services/config.js";

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
  note?: string;
  user_name?: string;
  suppliers: {
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
  };
  purchases_product_details?: Array<{
    id: number;
    product_code: number;
    product_name: string;
    unit_cost: number;
    purchase_quantity: number;
    sub_total: number;
    vat: number;
    total_quantity_received: number;
    balance_quantity: number;
  }>;
}
interface Payment {
  id: number;
  date: string;
  amount: number;
  payment_method: string;
  reference_document: string;
  payment_note: string;
}
interface PurchaseOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onEdit?: (purchaseOrder: PurchaseOrder) => void;
  onDelete?: (purchaseOrder: PurchaseOrder) => void;
  onSuccess?: () => void; // Callback to refresh parent component
}
export const PurchaseOrderDetailsModal = ({
  isOpen,
  onClose,
  purchaseOrder,
  onEdit,
  onDelete,
  onSuccess
}: PurchaseOrderDetailsModalProps) => {
  const {
    getPurchasePayments,
    purchasePayments,
    isLoading,
    markStockReceived,
    getPurchaseOrderDetails
  } = usePurchaseOrderStore();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState<'details' | 'payments'>('details');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isMarkingStock, setIsMarkingStock] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isVATModalOpen, setIsVATModalOpen] = useState(false);
  useEffect(() => {
    if (isOpen && purchaseOrder) {
      setModalError(null);
      loadPayments();
    }
  }, [isOpen, purchaseOrder]);
  const loadPayments = async () => {
    if (!purchaseOrder) return;
    try {
      console.log('Loading payments for purchase order:', purchaseOrder.id); // Debug log
      await getPurchasePayments(purchaseOrder.id);
    } catch (error: any) {
      console.error('Error loading payments:', error); // Debug log
      setModalError(error.message || "Failed to load payment history");
      toast({
        title: "Error",
        description: error.message || "Failed to load payment history",
        variant: "destructive"
      });
    }
  };

  // Don't render if no purchase order
  if (!purchaseOrder) {
    console.log('No purchase order provided to modal'); // Debug log
    return null;
  }
  console.log('Rendering modal with purchase order:', purchaseOrder); // Debug log

  const getSupplierName = () => {
    try {
      const supplier = purchaseOrder.suppliers;
      if (supplier.supplier_type === 'business_type') {
        return supplier.business_name || 'N/A';
      } else {
        const firstName = supplier.first_name || '';
        const lastName = supplier.last_name || '';
        return `${firstName} ${lastName}`.trim() || 'N/A';
      }
    } catch (error) {
      console.error('Error getting supplier name:', error); // Debug log
      return 'N/A';
    }
  };
  const getStatusBadge = (status: string, type: 'purchase' | 'payment' | 'stock') => {
    try {
      const statusMap = {
        purchase: {
          draft: {
            label: 'Draft',
            className: 'bg-gray-500 text-white'
          },
          sent: {
            label: 'Sent',
            className: 'bg-blue-500 text-white'
          },
          confirmed: {
            label: 'Confirmed',
            className: 'bg-green-500 text-white'
          },
          received: {
            label: 'Received',
            className: 'bg-green-500 text-white'
          },
          cancelled: {
            label: 'Cancelled',
            className: 'bg-red-500 text-white'
          }
        },
        payment: {
          pending: {
            label: 'Pending',
            className: 'bg-yellow-500 text-white'
          },
          partly: {
            label: 'Partly Paid',
            className: 'bg-orange-500 text-white'
          },
          done: {
            label: 'Paid',
            className: 'bg-green-500 text-white'
          }
        },
        stock: {
          pending: {
            label: 'Pending',
            className: 'bg-yellow-500 text-white'
          },
          partially: {
            label: 'Partially Received',
            className: 'bg-orange-500 text-white'
          },
          completed: {
            label: 'Completed',
            className: 'bg-green-500 text-white'
          }
        }
      };
      const statusConfig = statusMap[type][status.toLowerCase()] || {
        label: status,
        className: 'bg-gray-500 text-white'
      };
      return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
    } catch (error) {
      console.error('Error getting status badge:', error); // Debug log
      return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };
  const formatCurrency = (amount: string | number) => {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      const currency = purchaseOrder.currency_type || 'OMR';
      const decimals = purchaseOrder.currency_decimal_places || 3;
      return `${currency} ${numAmount.toFixed(decimals)}`;
    } catch (error) {
      console.error('Error formatting currency:', error); // Debug log
      return 'OMR 0.000';
    }
  };

  // Action button visibility logic
  const canEdit = purchaseOrder.stock_status !== 'completed' && purchaseOrder.stock_status !== 'partially';
  const canDelete = purchaseOrder.stock_status !== 'completed' && purchaseOrder.stock_status !== 'partially';
  const canAddPayment = purchaseOrder.payment_status !== 'done';
  const canMarkStockReceived = purchaseOrder.stock_status !== 'completed';
  
  // Check if there are any products with pending quantities
  const hasPendingQuantities = purchaseOrder.purchases_product_details?.some(
    product => product.purchase_quantity > product.total_quantity_received
  ) || false;
  const handleAddPayment = () => {
    setIsAddPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    // Refresh all purchase order data, not just payments
    if (purchaseOrder) {
      try {
        // Refresh payments
        await loadPayments();
        
        // Refresh the purchase order details to update payment status
        // This will make the Add Payment button hide immediately
        const updatedPurchaseOrder = await getPurchaseOrderDetails(purchaseOrder.id);
        if (updatedPurchaseOrder.success && updatedPurchaseOrder.data) {
          // The parent component will handle updating the purchase order data
          // through the onSuccess callback
        }
        
        // Also refresh the parent component to get updated purchase order data
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('Error refreshing purchase order data:', error);
      }
    }
  };
  const handleMarkStockReceived = async () => {
    if (!purchaseOrder.purchases_product_details || purchaseOrder.purchases_product_details.length === 0) {
      toast({
        title: "No Products",
        description: "No products found in this purchase order",
        variant: "destructive"
      });
      return;
    }

    setIsMarkingStock(true);
    try {
      await markStockReceived(purchaseOrder.id, purchaseOrder.purchases_product_details);
      toast({
        title: "Success",
        description: "Stock marked as received successfully",
        variant: "success",
      });

      // Refresh purchase order details after successful operation
      if (purchaseOrder) {
        try {
          await getPurchaseOrderDetails(purchaseOrder.id); // Refresh PO details in store
          if (onSuccess) {
            onSuccess(); // Trigger parent refresh
          }
        } catch (error) {
          console.error('Error refreshing purchase order data:', error);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark stock as received",
        variant: "destructive"
      });
    } finally {
      setIsMarkingStock(false);
    }
  };


  const handleGeneratePDF = () => {
    setIsVATModalOpen(true);
  };

  const handleVATSelection = async (withVAT: boolean) => {
    setIsVATModalOpen(false);
    try {
      const resp = await getPurchaseOrderDetails(purchaseOrder.id);
      if (!resp?.success || !resp.data) {
        throw new Error(resp?.message || 'Failed to load purchase order details');
      }
      await generatePurchaseOrderPDF(resp.data, { withVAT });
      toast({
        title: 'Success',
        description: 'Purchase Order PDF generated successfully.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Purchase Order Details
          </DialogTitle>
          <DialogDescription>
            {purchaseOrder.purchase_no} - {getSupplierName()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
                     {/* Header Actions */}
           <div className="flex flex-wrap gap-2 justify-between items-center">
             <div className="flex flex-wrap gap-2">
               {canAddPayment && <Button onClick={handleAddPayment} size="sm" className="bg-green-600 hover:bg-green-700">
                   <Plus className="w-4 h-4 mr-2" />
                   Add Payment
                 </Button>}
               
                               {canMarkStockReceived && hasPendingQuantities && (
                  <Button 
                    onClick={handleMarkStockReceived} 
                    size="sm" 
                    variant="outline"
                    disabled={isMarkingStock}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isMarkingStock ? 'Marking...' : 'Mark Stock Received'}
                  </Button>
                )}
               <Button onClick={handleGeneratePDF} size="sm" variant="outline">
                 <Download className="w-4 h-4 mr-2" />
                 Generate PDF
               </Button>
             </div>
             <div className="flex gap-2">
               {canEdit && onEdit && <ActionButton icon={Edit} tooltip="Edit Purchase Order" color="blue" onClick={() => onEdit(purchaseOrder)} />}
               {canDelete && onDelete && <ActionButton icon={Trash2} tooltip="Delete Purchase Order" color="red" onClick={() => onDelete(purchaseOrder)} />}
             </div>
           </div>

          {/* Purchase Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase No</label>
                  <p className="text-sm font-medium">{purchaseOrder.purchase_no}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quotation Ref</label>
                  <p className="text-sm font-medium">{purchaseOrder.quotation_ref || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                  <p className="text-sm font-medium">{formatDate(purchaseOrder.purchase_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm font-medium">{formatDate(purchaseOrder.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Grand Total</label>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(purchaseOrder.grand_total)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Count</label>
                  <p className="text-sm font-medium">{purchaseOrder.product_count}</p>
                </div>
                {purchaseOrder.note && <div className="col-span-full">
                    <label className="text-sm font-medium text-muted-foreground">Note</label>
                    <p className="text-sm">{purchaseOrder.note}</p>
                  </div>}
                {purchaseOrder.user_name && <div>
                    <label className="text-sm font-medium text-muted-foreground">Created By</label>
                    <p className="text-sm font-medium">{purchaseOrder.user_name}</p>
                  </div>}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Purchase Status</label>
                  <div className="mt-1">{getStatusBadge(purchaseOrder.purchase_status, 'purchase')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                  <div className="mt-1">{getStatusBadge(purchaseOrder.payment_status, 'payment')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock Status</label>
                  <div className="mt-1">{getStatusBadge(purchaseOrder.stock_status, 'stock')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                    {getSupplierName().charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{getSupplierName()}</p>
                    <p className="text-sm text-muted-foreground">
                      {purchaseOrder.suppliers.supplier_type === 'business_type' ? 'Business' : 'Individual'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {purchaseOrder.suppliers.mobile_number && <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{purchaseOrder.suppliers.mobile_number}</span>
                    </div>}
                  {purchaseOrder.suppliers.email && <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{purchaseOrder.suppliers.email}</span>
                    </div>}
                  {purchaseOrder.suppliers.address_line_1 && <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{purchaseOrder.suppliers.address_line_1}</span>
                    </div>}
                  {purchaseOrder.suppliers.tax_number && <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Tax: {purchaseOrder.suppliers.tax_number}</span>
                    </div>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl border border-border/50 h-15">
            <button onClick={() => setActiveTab('details')} className={`flex items-center justify-center gap-2 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10 ${activeTab === 'details' ? 'bg-primary text-white shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              Product Details
            </button>
            <button onClick={() => setActiveTab('payments')} className={`flex items-center justify-center gap-2 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10 ${activeTab === 'payments' ? 'bg-primary text-white shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              Payment History
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchaseOrder.purchases_product_details && purchaseOrder.purchases_product_details.length > 0 ? <div className="space-y-4">
                    {purchaseOrder.purchases_product_details.map((product, index) => <div key={product.id || index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{product.product_name}</h4>
                            <p className="text-sm text-muted-foreground">Code: {product.product_code}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">Qty: {product.purchase_quantity}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Unit Cost:</span>
                            <p className="font-medium">{formatCurrency(product.unit_cost)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">VAT:</span>
                            <p className="font-medium">{formatCurrency(product.vat)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subtotal:</span>
                            <p className="font-medium">{formatCurrency(product.sub_total)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Received:</span>
                            <p className="font-medium">{product.total_quantity_received} / {product.purchase_quantity}</p>
                          </div>
                        </div>
                        {product.balance_quantity > 0 && <div className="mt-2">
                            
                          </div>}
                      </div>)}
                  </div> : <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No product details available</p>
                  </div>}
              </CardContent>
            </Card>}

          {activeTab === 'payments' && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modalError ? <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 mb-2">Error loading payments</p>
                    <p className="text-sm text-muted-foreground">{modalError}</p>
                  </div> : isLoading ? <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading payments...</p>
                  </div> : purchasePayments && purchasePayments.length > 0 ? <div className="space-y-4">
                    {purchasePayments.map((payment: Payment) => <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{formatCurrency(payment.amount)}</h4>
                            <p className="text-sm text-muted-foreground">{payment.payment_method}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDate(payment.date)}</p>
                            {/* Only show View Document button if reference_document exists and is not N/A or undefined */}
                            {payment.reference_document && 
                             payment.reference_document.trim() !== '' && 
                             payment.reference_document.trim() !== 'N/A' && 
                             payment.reference_document.trim() !== 'undefined' && (
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto" 
                                 onClick={() => {
                                   const rawBase = (api?.defaults?.baseURL as string) || 'https://taameerv2staging.gethorcrm.com/';
                                   const base = rawBase.replace(/\/+$/, '');
                                   const path = payment.reference_document.replace(/^\/+/, '');
                                   window.open(`${base}/${path}`, '_blank');
                                 }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Document
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* Only show payment note if it exists and is not empty, N/A, or undefined */}
                        {payment.payment_note && 
                         payment.payment_note.trim() !== '' && 
                         payment.payment_note.trim() !== 'N/A' && 
                         payment.payment_note.trim() !== 'undefined' && (
                          <p className="text-sm text-muted-foreground">{payment.payment_note}</p>
                        )}
                      </div>)}
                  </div> : <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payment history available</p>
                  </div>}
              </CardContent>
            </Card>}
        </div>
      </DialogContent>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        purchaseOrder={purchaseOrder}
        onSuccess={handlePaymentSuccess}
      />

      {/* VAT Selection Modal */}
      <VATSelectionModal
        isOpen={isVATModalOpen}
        onClose={() => setIsVATModalOpen(false)}
        onConfirm={handleVATSelection}
        purchaseOrderNo={purchaseOrder.purchase_no}
      />

    </Dialog>
  );
};