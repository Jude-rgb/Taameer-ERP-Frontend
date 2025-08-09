import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Package, FileText, Calendar, CreditCard, Download, MapPin, User, Phone, Receipt, Percent, ShoppingCart, CircleDollarSign, AlertCircle, Eye, DollarSign, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddInvoicePaymentModal from '@/components/modals/AddInvoicePaymentModal';
import { formatDate, formatOMRCurrency, getInvoiceStatusColor } from '@/utils/formatters';
import api from '@/services/config.js';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null; // minimal invoice with id, invoice_number
  fetchDetails: (id: number | string) => Promise<any>; // function that returns {success, data}
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice, fetchDetails }) => {
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // Keep a stable ref to the fetcher to avoid reloading on unrelated re-renders
  const fetchDetailsRef = useRef(fetchDetails);
  useEffect(() => { fetchDetailsRef.current = fetchDetails; }, [fetchDetails]);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !invoice?.id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchDetailsRef.current(invoice.id);
        if (resp.success) setDetails(resp.data);
        else setError(resp.message || 'Failed to load invoice');
      } catch (e: any) {
        setError(e.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, invoice?.id]);

  const totalPaid = useMemo(() => {
    const payments = details?.invoice_payment || [];
    return payments.reduce((acc: number, p: any) => acc + (parseFloat(p.paid_amount || '0') || 0), 0);
  }, [details]);

  const balance = useMemo(() => {
    const total = parseFloat(details?.quotation_total || '0') || 0;
    return total - totalPaid;
  }, [details, totalPaid]);
  const isPaid = balance <= 0.0005;

  const openReference = (ref?: string) => {
    if (!ref) return;
    const trimmed = ref.trim();
    if (!trimmed || trimmed === 'N/A' || trimmed === 'undefined') return;
    const base = String(api?.defaults?.baseURL || '').replace(/\/+$/, '');
    const path = trimmed.replace(/^\/+/, '');
    window.open(`${base}/${path}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Invoice Details
          </DialogTitle>
          <DialogDescription>
            {invoice?.invoice_number}
          </DialogDescription>
        </DialogHeader>

        {!details || loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">{loading ? 'Loading invoice...' : (error || 'No data')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{title:'Grand Total', value: formatOMRCurrency(parseFloat(details.quotation_total || '0')) , icon: CircleDollarSign, color:'text-primary', bg:'bg-primary/10'},
                {title:'Paid', value: formatOMRCurrency(totalPaid), icon: CreditCard, color:'text-success', bg:'bg-success/10'},
                {title:'Balance', value: formatOMRCurrency(balance), icon: DollarSign, color:'text-warning', bg:'bg-warning/10'}].map((c, idx) => (
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

            {/* Invoice & Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Quotation No</label>
                    <p className="text-sm font-medium">{details.quotation_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Invoice No</label>
                    <p className="text-sm font-medium">{details.invoice_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Created At</label>
                    <p className="text-sm font-medium">{formatDate(details.created_at)}</p>
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
                  <div>
                    <label className="text-sm text-muted-foreground">Payment Status</label>
                    <div className="mt-1"><Badge className={getInvoiceStatusColor(details.invoice_payment_status)}>{String(details.invoice_payment_status || 'N/A').toUpperCase()}</Badge></div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Delivery Status</label>
                    <div className="mt-1"><Badge className={`${(details.delivery_note_status || '').toLowerCase()==='created'?'bg-success text-white':'bg-warning text-white'}`}>{String(details.delivery_note_status || 'Pending').toUpperCase()}</Badge></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(details.invoice_stock) && details.invoice_stock.length>0 ? details.invoice_stock.map((p:any)=> (
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
                  <CircleDollarSign className="w-5 h-5" />
                  Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Sub Total</span><p className="font-medium">{formatOMRCurrency(parseFloat(details.sub_quotation_total||'0'))}</p></div>
                  <div><span className="text-muted-foreground">VAT</span><p className="font-medium">{formatOMRCurrency(parseFloat(details.quotation_vat||'0'))}</p></div>
                  {details.delivery_charges && parseFloat(details.delivery_charges) > 0 && (
                    <div><span className="text-muted-foreground">Delivery Charges</span><p className="font-medium">{formatOMRCurrency(parseFloat(details.delivery_charges))}</p></div>
                  )}
                  <div><span className="text-muted-foreground">Discount</span><p className="font-medium">{formatOMRCurrency(parseFloat(details.discount_price||'0'))}</p></div>
                  <div><span className="text-muted-foreground">Grand Total</span><p className="font-bold text-green-600">{formatOMRCurrency(parseFloat(details.quotation_total||'0'))}</p></div>
                </div>
                {details.refund_amount && parseFloat(details.refund_amount)>0 && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10">
                    <div className="flex items-center gap-2 text-destructive"><AlertCircle className="w-4 h-4"/> Refund Amount: {formatOMRCurrency(parseFloat(details.refund_amount))}</div>
                    {details.refund_reasons && <p className="text-sm text-muted-foreground mt-1">Note: {details.refund_reasons}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(details.invoice_payment) && details.invoice_payment.length>0 ? details.invoice_payment.map((pay:any)=> (
                  <div key={pay.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pay.payment_method}</Badge>
                      
                        <span>{formatDate(pay.created_at)}</span>
                        <span className="font-medium">{formatOMRCurrency(parseFloat(pay.paid_amount||'0'))}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Balance:</span>
                        <span className="font-medium">{formatOMRCurrency(parseFloat(pay.balance_amount||'0'))}</span>
                        {pay.reference && pay.reference.trim() !== '' && pay.reference.trim() !== 'N/A' && (
                          <Button variant="outline" size="sm" className="h-8" onClick={() => openReference(pay.reference)}>
                            <ExternalLink className="w-4 h-4 mr-1"/>Reference
                          </Button>
                        )}
                      </div>
                    </div>
                    {(pay.payment_invoice_number || (pay.comment && pay.comment.trim()!=='' && pay.comment.trim()!=='N/A')) && (
                      <div className="text-muted-foreground mt-1 flex items-center gap-2">
                        {pay.payment_invoice_number && (
                          <Badge variant="secondary" className="font-mono">{pay.payment_invoice_number}</Badge>
                        )}
                        {pay.comment && pay.comment.trim()!=='' && pay.comment.trim()!=='N/A' && (
                          <span>{pay.comment}</span>
                        )}
                      </div>
                    )}
                  </div>
                )) : <div className="text-center py-6 text-muted-foreground">No payments yet</div>}
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => setIsAddPaymentOpen(true)} disabled={isPaid}>
                    Make Payment
                  </Button>
                  <Button variant="destructive" disabled={!(details.invoice_payment && details.invoice_payment.length>0)}>
                    Refund
                  </Button>
                </div>
              </CardContent>
            </Card>
            <AddInvoicePaymentModal
              isOpen={isAddPaymentOpen}
              onClose={() => setIsAddPaymentOpen(false)}
              invoice={details}
              onSuccess={async () => {
                // reload details after new payment
                if (invoice) {
                  try {
                    const resp = await fetchDetails(invoice.id);
                    if (resp.success) setDetails(resp.data);
                  } catch {}
                }
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsModal;


