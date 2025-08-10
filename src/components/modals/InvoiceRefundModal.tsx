import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
// removed unused Badge import
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createInvoiceRefund } from '@/services/invoice.js';
import { ShoppingCart, MinusCircle, PlusCircle } from 'lucide-react';
import { formatOMRCurrency } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InvoiceRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any; // full details used by details modal
  onSuccess: () => Promise<void> | void;
}

export const InvoiceRefundModal: React.FC<InvoiceRefundModalProps> = ({ isOpen, onClose, invoice, onSuccess }) => {
  const { toast } = useToast();
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [isAmountDirty, setIsAmountDirty] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [selected, setSelected] = useState<Array<{ product_code: string; product_name: string; quantity: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paidTotal = useMemo(() => (invoice?.invoice_payment || []).reduce((a: number, p: any) => a + (parseFloat(p.paid_amount || '0') || 0), 0), [invoice]);
  const grandTotal = useMemo(() => parseFloat(invoice?.quotation_total || '0') || 0, [invoice]);
  // removed standalone maxRefund as it's not shown in UI; validation still enforced in submit

  const invoiceSubtotal = useMemo(() => parseFloat(invoice?.sub_quotation_total || '0') || 0, [invoice]);
  const invoiceDiscount = useMemo(() => parseFloat(invoice?.discount_price || '0') || 0, [invoice]);
  const invoiceVat = useMemo(() => parseFloat(invoice?.quotation_vat || '0') || 0, [invoice]);
  const invoiceDelivery = useMemo(() => parseFloat(invoice?.delivery_charges || '0') || 0, [invoice]);

  const selectedSubtotal = useMemo(() => {
    return selected.reduce((sum, s) => {
      const item = (invoice?.invoice_stock || []).find((p: any) => p.product_code === s.product_code);
      const unit = parseFloat(item?.unit_price || '0') || 0;
      return sum + unit * s.quantity;
    }, 0);
  }, [selected, invoice]);

  // Use fixed discount, delivery and VAT% derived from invoice details
  const vatPercent = useMemo(() => {
    if (invoiceSubtotal <= 0) return 0;
    return (invoiceVat || 0) / invoiceSubtotal; // e.g., 125/2500 => 0.05
  }, [invoiceVat, invoiceSubtotal]);

  const selectedDiscount = useMemo(() => {
    // Apply fixed invoice discount against selected subtotal, capped at selected subtotal
    const d = invoiceDiscount || 0;
    return Math.max(0, Math.min(selectedSubtotal, d));
  }, [invoiceDiscount, selectedSubtotal]);

  const selectedDelivery = useMemo(() => invoiceDelivery || 0, [invoiceDelivery]);

  const selectedVat = useMemo(() => {
    const base = Math.max(0, selectedSubtotal - selectedDiscount);
    return base * vatPercent;
  }, [selectedSubtotal, selectedDiscount, vatPercent]);

  const computedRefund = useMemo(() => {
    const value = selectedSubtotal - selectedDiscount + selectedVat + selectedDelivery;
    return Number.isFinite(value) ? value : 0;
  }, [selectedSubtotal, selectedDiscount, selectedVat, selectedDelivery]);

  // Derive current grand total after any previous refund to determine overpayment
  const existingRefund = useMemo(() => parseFloat(invoice?.refund_amount || '0') || 0, [invoice]);
  const afterDiscount = useMemo(() => Math.max(0, invoiceSubtotal - invoiceDiscount), [invoiceSubtotal, invoiceDiscount]);
  const grossTotal = useMemo(() => afterDiscount + invoiceVat + invoiceDelivery, [afterDiscount, invoiceVat, invoiceDelivery]);
  const currentGrandTotal = useMemo(() => Math.max(0, grossTotal - existingRefund), [grossTotal, existingRefund]);
  const overpayAllowance = useMemo(() => Math.max(0, paidTotal - currentGrandTotal), [paidTotal, currentGrandTotal]);
  const mustSelectItems = overpayAllowance <= 0.0005; // require items if not overpaid
  // NOTE: we no longer display a numeric max; validation uses computedRefund + overpayAllowance

  // Cap per-item refund quantity by remaining quantity after previous refunds
  const previouslyRefundedMap = useMemo(() => {
    const map: Record<string, number> = {};
    const list = Array.isArray(invoice?.refund_products) ? invoice.refund_products : [];
    for (const rp of list) {
      const code: string | undefined = (rp as any).product_code || (rp as any).productCode || (rp as any).code;
      const key = code || ((rp as any).product_name ? `name:${(rp as any).product_name}` : undefined);
      const qty = parseFloat((rp as any).quantity || '0') || 0;
      if (!key) continue;
      map[key] = (map[key] || 0) + qty;
    }
    return map;
  }, [invoice?.refund_products]);

  const getAvailableQty = (product: any): number => {
    const invoiceQty = parseFloat(product?.quantity || '0') || 0;
    const code: string | undefined = product?.product_code || product?.productCode || product?.code;
    const key = code || (product?.product_name ? `name:${product.product_name}` : undefined);
    const alreadyRefunded = key ? (previouslyRefundedMap[key] || 0) : 0;
    return Math.max(0, invoiceQty - alreadyRefunded);
  };

  // Auto-update refund amount from computed values if user hasn't manually changed it
  React.useEffect(() => {
    if (!isAmountDirty) {
      setRefundAmount(computedRefund.toFixed(3));
    }
  }, [computedRefund, isAmountDirty]);

  // Auto-distribute quantities based on paid amount when user clicks helper
  const distributeByPaid = () => {
    const items = (invoice?.invoice_stock || []).map((p: any) => ({
      code: p.product_code,
      name: p.product_name,
      qty: getAvailableQty(p),
      unit: parseFloat(p.unit_price || '0') || 0,
    }));
    if (!items.length || paidTotal <= 0) return;
    let remaining = paidTotal;
    const result: Array<{ product_code: string; product_name: string; quantity: number }> = [];
    for (const it of items) {
      if (remaining <= 0) break;
      const qty = Math.min(it.qty, Math.floor((remaining + 1e-9) / (it.unit || 1))); // integer qty
      if (qty > 0) {
        result.push({ product_code: it.code, product_name: it.name, quantity: qty });
        remaining -= qty * it.unit;
      }
    }
    setSelected(result);
    setIsAmountDirty(false);
  };

  const handleQtyChange = (code: string, delta: number, max: number) => {
    setSelected(prev => {
      const idx = prev.findIndex(p => p.product_code === code);
      if (idx === -1) return prev;
      const next = [...prev];
      const newQty = Math.max(0, Math.min(max, next[idx].quantity + delta));
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  const handleQtyInput = (code: string, name: string, value: string, max: number) => {
    const parsed = Math.floor(Number(value) || 0);
    const clamped = Math.max(0, Math.min(max, parsed));
    setSelected(prev => {
      const idx = prev.findIndex(p => p.product_code === code);
      if (idx === -1) {
        if (clamped === 0) return prev;
        return [...prev, { product_code: code, product_name: name, quantity: clamped }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: clamped };
      return next;
    });
  };

  const toggleSelect = (code: string, name: string, max: number) => {
    setSelected(prev => {
      const idx = prev.findIndex(p => p.product_code === code);
      if (idx >= 0) return prev.filter(p => p.product_code !== code);
      return [...prev, { product_code: code, product_name: name, quantity: Math.min(1, max) }];
    });
  };

  const buildRefundProductsPayload = () => {
    return selected
      .filter(p => p.quantity > 0)
      .map(p => ({
        product_code: p.product_code,
        product_name: p.product_name,
        quantity: String(p.quantity),
        actions: [{ text: 'Remove', icon: 'mdi-delete' }],
      }));
  };

  const resetForm = () => {
    setRefundAmount('');
    setReason('');
    setSelected([]);
  };

  const handleSubmit = async () => {
    try {
      const amount = parseFloat(refundAmount || '0') || 0;
      if (amount <= 0) {
        toast({ title: 'Invalid amount', description: 'Enter a refund amount greater than 0.', variant: 'destructive' });
        return;
      }
      // Items required if there's no overpayment
      const totalSelectedQty = selected.reduce((s, x) => s + (x.quantity || 0), 0);
      if (mustSelectItems && totalSelectedQty <= 0) {
        toast({ title: 'Items required', description: 'Select at least one product and quantity for refund.', variant: 'destructive' });
        return;
      }
      // Validate each selected line against available quantity (after previous refunds)
      for (const sel of selected) {
        const prod = (invoice?.invoice_stock || []).find((p: any) => p.product_code === sel.product_code);
        if (!prod) continue;
        const avail = getAvailableQty(prod);
        if (sel.quantity > avail) {
          toast({ title: 'Quantity too high', description: `Requested ${sel.quantity} exceeds available ${avail} for ${sel.product_name}.`, variant: 'destructive' });
          return;
        }
      }
      // Amount cannot exceed items-based computed refund plus any overpayment allowance
      const allowed = computedRefund + overpayAllowance;
      if (amount > allowed + 1e-6) {
        toast({ title: 'Amount too high', description: `Max refundable now is OMR ${allowed.toFixed(3)}.`, variant: 'destructive' });
        return;
      }
      if (!reason.trim()) {
        toast({ title: 'Reason required', description: 'Please provide a reason for the refund.', variant: 'destructive' });
        return;
      }
      setIsSubmitting(true);
      // Use FormData to match server 'Form Data' view
      const form = new FormData();
      form.append('invoice_id', String(invoice.id));
      form.append('refund_amount', String(amount));
      form.append('refund_reasons', reason);
      form.append('refund_product', JSON.stringify(buildRefundProductsPayload()));
      const resp = await createInvoiceRefund(form);
      if (resp.success) {
        toast({ title: 'Success', description: 'Refund recorded successfully.', variant: 'success' });
        await onSuccess();
        resetForm();
        onClose();
      } else {
        throw new Error(resp.message || 'Failed');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create refund', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { if (!isSubmitting) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Refund</DialogTitle>
          <DialogDescription>{invoice?.invoice_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Grand Total</div>
                <div className="text-xl font-bold">{formatOMRCurrency(currentGrandTotal)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="text-xl font-bold">{formatOMRCurrency(paidTotal)}</div>
              </CardContent>
            </Card>
            {/* Removed Max Refund card from summary */}
          </div>

          {/* Refund Amount & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Refund Amount (OMR)</Label>
              <Input type="number" step="0.001" min="0" value={refundAmount} onChange={e => { setRefundAmount(e.target.value); setIsAmountDirty(true); }} />
              <p className="text-xs text-muted-foreground mt-1">You may refund up to the remaining invoice total after previous refunds, limited by the total paid. If there is overpayment, you can refund the overpaid amount without selecting items.</p>
            </div>
            <div>
              <Label>Reason</Label>
              <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Refund reason" />
            </div>
          </div>

          <Separator />

          {/* Items selection (optional) */}
           <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
               <span className="text-sm font-medium">Select Items {mustSelectItems ? '(required)' : '(optional)'}</span>
              <Button variant="outline" size="sm" className="ml-auto" onClick={distributeByPaid} disabled={paidTotal <= 0}>
                Auto-fill by Paid Amount
              </Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Invoice Qty</TableHead>
                    <TableHead className="text-right">Refund Qty</TableHead>
                    <TableHead className="text-right">Line Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoice?.invoice_stock || []).map((p: any) => {
                    const max = getAvailableQty(p);
                    const sel = selected.find(s => s.product_code === p.product_code);
                    const qty = sel?.quantity || 0;
                    const unit = parseFloat(p.unit_price || '0') || 0;
                    const line = unit * qty;
                    const isSelected = !!sel;
                    return (
                      <TableRow key={p.id} className={`${isSelected ? 'bg-muted/50' : ''}`}>
                        <TableCell className="font-medium">{p.product_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.product_code}</TableCell>
                        <TableCell className="text-right">{formatOMRCurrency(unit)}</TableCell>
                        <TableCell className="text-right">{p.quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" disabled={qty <= 0 || max <= 0} onClick={() => {
                              if (!isSelected && max > 0) toggleSelect(p.product_code, p.product_name, max);
                              handleQtyChange(p.product_code, -1, max);
                            }}>
                              <MinusCircle className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              inputMode="numeric"
                              className="w-16 text-right"
                              min={0}
                              max={max}
                              value={qty}
                              disabled={max <= 0}
                              onChange={e => handleQtyInput(p.product_code, p.product_name, e.target.value, max)}
                            />
                            <Button variant="outline" size="icon" onClick={() => {
                              if (!isSelected && max > 0) toggleSelect(p.product_code, p.product_name, max);
                              handleQtyChange(p.product_code, +1, max);
                            }} disabled={qty >= max || max <= 0}>
                              <PlusCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatOMRCurrency(line)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Live Totals based on selected quantities with proportional charges */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <div className="flex justify-between text-sm"><span>Selected Subtotal</span><span className="font-medium">{formatOMRCurrency(selectedSubtotal)}</span></div>
                <div className="flex justify-between text-sm"><span>Proportional Discount</span><span className="font-medium">-{formatOMRCurrency(selectedDiscount)}</span></div>
                <div className="flex justify-between text-sm"><span>Proportional VAT</span><span className="font-medium">{formatOMRCurrency(selectedVat)}</span></div>
                {invoiceDelivery > 0 && (
                  <div className="flex justify-between text-sm"><span>Proportional Delivery</span><span className="font-medium">{formatOMRCurrency(selectedDelivery)}</span></div>
                )}
                <div className="flex justify-between mt-2 text-sm"><span className="font-semibold">Computed Refund</span><span className="font-bold">{formatOMRCurrency(computedRefund)}</span></div>
              </CardContent>
            </Card>
            {/* Removed duplicate refund amount field and 'Max now' text */}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Refund'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceRefundModal;


