import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Download } from 'lucide-react';

interface VATSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (withVAT: boolean) => void;
  purchaseOrderNo?: string;
}

export const VATSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  purchaseOrderNo 
}: VATSelectionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Purchase Order PDF
          </DialogTitle>
          <DialogDescription>
            {purchaseOrderNo && `Purchase Order: ${purchaseOrderNo}`}
            <br />
            Choose how you want to generate the PDF:
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Button
              onClick={() => onConfirm(true)}
              className="w-full justify-start gap-2 h-12"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Generate with VAT</div>
                <div className="text-sm text-muted-foreground">Include VAT calculations in the PDF</div>
              </div>
            </Button>
            
            <Button
              onClick={() => onConfirm(false)}
              className="w-full justify-start gap-2 h-12"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Generate without VAT</div>
                <div className="text-sm text-muted-foreground">Exclude VAT from grand total</div>
              </div>
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};