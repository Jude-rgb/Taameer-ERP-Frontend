import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createInvoicePayment } from '@/services/invoice.js';
import api from '@/services/config.js';

interface AddInvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any; // expects full invoice details
  onSuccess: () => Promise<void> | void;
}

const PAYMENT_METHODS = [
  'Cash',
  'Cheque',
  'Bank Transfer',
  'Al Dar',
  'Ausus',
  'Awazel',
  'Tabreed',
  'Massaed',
  'Makeen',
];

export const AddInvoicePaymentModal: React.FC<AddInvoicePaymentModalProps> = ({ isOpen, onClose, invoice, onSuccess }) => {
  const { toast } = useToast();
  const storedUser = (() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const paymentsCount = useMemo(() => (Array.isArray(invoice?.invoice_payment) ? invoice.invoice_payment.length : 0), [invoice?.invoice_payment?.length, invoice?.id]);
  const nextSubIndex = useMemo(() => paymentsCount + 1, [paymentsCount]);
  const paymentInvoiceNumber = useMemo(() => `${invoice?.invoice_number}_PAY_${nextSubIndex}`, [invoice?.invoice_number, nextSubIndex]);
  const currentDate = useMemo(() => {
    const now = new Date();
    // Format as M/D/YYYY to match example (8/10/2025)
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  }, []);

  const balanceAmount = useMemo(() => {
    const total = parseFloat(invoice?.quotation_total || '0') || 0;
    const paidSoFar = (invoice?.invoice_payment || []).reduce((a: number, p: any) => a + (parseFloat(p.paid_amount || '0') || 0), 0);
    const entered = parseFloat(paidAmount || '0') || 0;
    return (total - paidSoFar - entered).toFixed(3);
  }, [invoice, paidAmount]);

  const requiresAttachment = ['Cheque', 'Bank Transfer'].includes(paymentMethod);

  const resetForm = () => {
    setPaymentMethod('Cash');
    setPaidAmount('');
    setComment('');
    setReferenceFile(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) { setReferenceFile(null); return; }
    const isPdf = file.type === 'application/pdf';
    const isImg = file.type.startsWith('image/');
    if (!isPdf && !isImg) {
      toast({ title: 'Invalid file', description: 'Only PDF or image files are allowed.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 2MB.', variant: 'destructive' });
      return;
    }
    setReferenceFile(file);
  };

  const handleSubmit = async () => {
    try {
      if (!invoice) return;
      if (!paidAmount || parseFloat(paidAmount) <= 0) {
        toast({ title: 'Amount required', description: 'Enter a valid paid amount.', variant: 'destructive' });
        return;
      }
      if (requiresAttachment && !referenceFile) {
        toast({ title: 'Attachment required', description: 'Please attach PDF or image for this payment method.', variant: 'destructive' });
        return;
      }
      if (!comment.trim()) {
        toast({ title: 'Comment required', description: 'Please enter a comment.', variant: 'destructive' });
        return;
      }
      setIsSubmitting(true);
      const form = new FormData();
      form.append('invoice_number', String(invoice.invoice_number));
      form.append('invoice_id', String(invoice.id));
      form.append('payment_date', currentDate);
      form.append('payment_method', paymentMethod);
      form.append('comment', comment);
      form.append('paid_amount', String(parseFloat(paidAmount).toFixed(3)));
      form.append('balance_amount', balanceAmount);
      form.append('last_edit_user_id', String(storedUser?.id || ''));
      form.append('last_edit_user_name', String(storedUser?.full_name || storedUser?.user_name || ''));
      form.append('user_name', String(storedUser?.full_name || storedUser?.user_name || ''));
      form.append('user_id', String(storedUser?.id || ''));
      form.append('payment_invoice_number', paymentInvoiceNumber);
      if (referenceFile) form.append('reference', referenceFile);

      const resp = await createInvoicePayment(form);
      if (resp.success) {
        toast({ title: 'Success', description: 'Payment added successfully.', variant: 'success' });
        await onSuccess();
        resetForm();
        onClose();
      } else {
        throw new Error(resp.message || 'Failed');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add payment', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { if (!isSubmitting) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            {invoice?.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Paid Amount (OMR)</Label>
              <Input type="number" step="0.001" min="0" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
            </div>
            <div>
              <Label>New Balance (After This Payment)</Label>
              <Input value={balanceAmount} readOnly />
            </div>
            {(requiresAttachment) && (
              <div>
                <Label>Reference Document (PDF/Image, max 2MB)</Label>
                <Input type="file" accept="application/pdf,image/*" onChange={e => handleFileChange(e.target.files?.[0] || null)} />
              </div>
            )}
            <div>
              <Label>Comment</Label>
              <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Enter a note for this payment" />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}> {isSubmitting ? 'Saving...' : 'Save Payment'} </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoicePaymentModal;


