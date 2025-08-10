import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Quote, User, Phone, MapPin, Calendar, ShoppingCart, DollarSign, Download } from 'lucide-react';
import { formatDate, formatOMRCurrency, getInvoiceStatusColor } from '@/utils/formatters';
import { generateQuotationPDF } from '@/components/pdf';

interface QuotationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: any | null; // An item from fetchQuotations list (already includes quotation_stock)
}

export const QuotationDetailsModal: React.FC<QuotationDetailsModalProps> = ({ isOpen, onClose, quotation }) => {
  const details = quotation || {};

  // Totals
  const subTotal = useMemo(() => Number.parseFloat(details?.sub_quotation_total || '0') || 0, [details]);
  const discountAmt = useMemo(() => Number.parseFloat(details?.discount_price || '0') || 0, [details]);
  const afterDiscount = Math.max(0, subTotal - discountAmt);
  const vatAmt = useMemo(() => Number.parseFloat(details?.quotation_vat || '0') || 0, [details]);
  const totalBeforeDelivery = afterDiscount + vatAmt;
  const deliveryCharges = useMemo(() => Number.parseFloat(details?.delivery_charges || '0') || 0, [details]);
  const chargesWithDelivery = totalBeforeDelivery + (deliveryCharges || 0);

  const hasDiscount = discountAmt > 0.0005;
  const hasVat = vatAmt > 0.0005;
  const hasDelivery = deliveryCharges > 0.0005;

  const handleDownload = async () => {
    try {
      await generateQuotationPDF(details, { openInNewTab: true });
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5" />
            Quotation Details
          </DialogTitle>
          <DialogDescription>
            {details?.quotation_number || ''}
          </DialogDescription>
        </DialogHeader>

        {!details ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading quotation...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Download Quotation
              </Button>
            </div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{title:'Total', value: formatOMRCurrency(totalBeforeDelivery), bg:'bg-primary/10', color:'text-primary', icon:DollarSign},
                hasDiscount ? {title:'Discount', value: formatOMRCurrency(discountAmt), bg:'bg-destructive/10', color:'text-destructive', icon:DollarSign} : null,
                hasDelivery ? {title:'Delivery', value: formatOMRCurrency(deliveryCharges), bg:'bg-blue-100 dark:bg-blue-900/30', color:'text-blue-600 dark:text-blue-400', icon:DollarSign} : null,
              ].filter(Boolean).map((c:any) => (
                <Card key={c.title} className="border-0 bg-gradient-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{c.title}</p>
                        <p className="text-xl font-bold">{c.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${c.bg}`}>
                        <c.icon className={`h-6 w-6 ${c.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Quotation & Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Quotation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Quotation No</label>
                    <p className="text-sm font-medium">{details.quotation_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Created At</label>
                    <p className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(details.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Created By</label>
                    <p className="text-sm font-medium">{details.user_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Type</label>
                    <p className="text-sm font-medium">{details.quatation_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Customer</label>
                    <p className="text-sm font-medium flex items-center gap-2"><User className="w-4 h-4" />{details.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Contact</label>
                    <p className="text-sm font-medium flex items-center gap-2"><Phone className="w-4 h-4" />{details.contact_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <p className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4" />{details.location || 'N/A'}</p>
                  </div>
                  {details.project && (
                    <div>
                      <label className="text-sm text-muted-foreground">Project</label>
                      <p className="text-sm font-medium">{details.project}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-muted-foreground">Invoice Status</label>
                    <div className="mt-1"><Badge className={getInvoiceStatusColor(details.invoice_status)}>{String(details.invoice_status || 'N/A').toUpperCase()}</Badge></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(details.quotation_stock) && details.quotation_stock.length>0 ? details.quotation_stock.map((p:any)=> (
                  <div key={p.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{p.product_name}</h4>
                        <p className="text-xs text-muted-foreground">{p.product_code}</p>
                      </div>
                      <Badge variant="outline">Qty: {p.quantity}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Unit Price:</span><p className="font-medium">{formatOMRCurrency(parseFloat(p.unit_price||'0'))}</p></div>
                      <div><span className="text-muted-foreground">Subtotal:</span><p className="font-medium">{formatOMRCurrency(parseFloat(p.total||'0'))}</p></div>
                      <div><span className="text-muted-foreground">Created At:</span><p className="font-medium">{formatDate(p.created_at)}</p></div>
                    </div>
                  </div>
                )) : <div className="text-center py-8 text-muted-foreground">No items</div>}
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sub Total (OMR)</span><span className="font-medium">{formatOMRCurrency(subTotal)}</span></div>
                  {hasDiscount && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Discount Amount (OMR)</span><span className="font-medium text-destructive">{formatOMRCurrency(discountAmt)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Sub Total (After Discount) (OMR)</span><span className="font-medium">{formatOMRCurrency(afterDiscount)}</span></div>
                    </>
                  )}
                  {hasVat && (
                    <div className="flex justify-between"><span className="text-muted-foreground">VAT (OMR)</span><span className="font-medium">{formatOMRCurrency(vatAmt)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Total (OMR)</span><span className="font-bold">{formatOMRCurrency(totalBeforeDelivery)}</span></div>
                  {hasDelivery && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Delivery Charges (OMR)</span><span className="font-medium text-blue-600 dark:text-blue-400">{formatOMRCurrency(deliveryCharges)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Charges with Delivery (OMR)</span><span className="font-medium">{formatOMRCurrency(chargesWithDelivery)}</span></div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDetailsModal;


