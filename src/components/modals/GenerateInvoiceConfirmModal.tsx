import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  quotation?: any | null;
  errorPayload?: any | null;
}

export const GenerateInvoiceConfirmModal = ({ open, onClose, onConfirm, isLoading = false, quotation, errorPayload }: Props) => {
  const stockErrors = useMemo(() => {
    if (!errorPayload) return null;
    const type = errorPayload?.errors?.type;
    if (type !== 'insufficient_stock') return null;
    const products = Array.isArray(errorPayload?.errors?.products) ? errorPayload.errors.products : [];
    return products as Array<{ product_code: string; product_name: string; requested_quantity: number; available_quantity: number }>;
  }, [errorPayload]);

  const shortage = (requested: number, available: number) => {
    const avail = Number(available || 0);
    const req = Number(requested || 0);
    if (avail >= 0) {
      return Math.max(0, req - avail);
    }
    return Math.abs(avail) + req;
  };

  const shortageExpr = (requested: number, available: number) => {
    const avail = Number(available || 0);
    const req = Number(requested || 0);
    if (avail >= 0) {
      const diff = Math.max(0, req - avail);
      return `${req} - ${avail} = ${diff}`;
    }
    const diff = Math.abs(avail) + req;
    return `${Math.abs(avail)} + ${req} = ${diff}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={stockErrors ? "sm:max-w-3xl max-w-[95vw]" : "max-w-md"}>
        <DialogHeader>
          {stockErrors ? (
            <>
              <DialogTitle>Generate Invoice</DialogTitle>
              <DialogDescription>
                Insufficient stock detected. Review the details below.
              </DialogDescription>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-6 h-6 text-primary" />
              </motion.div>
              <DialogTitle className="text-center">Generate Invoice?</DialogTitle>
              <DialogDescription className="text-center">
                Create an invoice for quotation {quotation?.quotation_number ? (
                  <span className="font-medium">{quotation.quotation_number}</span>
                ) : 'this quotation'}?
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {stockErrors ? (
          <div className="space-y-3">
            <Alert>
              <div className="font-medium">Stock validation failed</div>
              <div className="text-sm text-muted-foreground">Not enough stock to generate invoice.</div>
            </Alert>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2">Product Code</th>
                    <th className="text-left p-2">Product Name</th>
                    <th className="text-right p-2">Ordered Qty</th>
                    <th className="text-right p-2">Available Qty</th>
                    <th className="text-right p-2">Shortage</th>
                  </tr>
                </thead>
                <tbody>
                  {stockErrors.map((p, idx) => (
                    <tr key={idx} className={idx % 2 ? 'bg-muted/20' : ''}>
                      <td className="p-2">{p.product_code}</td>
                      <td className="p-2">{p.product_name}</td>
                      <td className="p-2 text-right text-destructive font-semibold">{p.requested_quantity}</td>
                      <td className="p-2 text-right text-destructive font-semibold">{p.available_quantity}</td>
                      <td className="p-2 text-right text-destructive font-semibold">{shortage(p.requested_quantity as any, p.available_quantity as any)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>OK</Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex justify-center gap-3 pt-2"
          >
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button onClick={onConfirm} disabled={isLoading} className="hover:scale-105 transition-all duration-200">
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateInvoiceConfirmModal;


