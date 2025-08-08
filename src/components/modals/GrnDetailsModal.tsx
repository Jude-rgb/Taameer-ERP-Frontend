import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import React from "react";

interface GrnDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  grn: any | null;
}

export const GrnDetailsModal: React.FC<GrnDetailsModalProps> = ({ isOpen, onClose, grn }) => {
  if (!grn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            GRN Details
          </DialogTitle>
          <DialogDescription>
            {grn.grn_number} • <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(grn.created_at)}</span>
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grn.grn_stock?.length ? grn.grn_stock.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 dark:bg-gray-900/30">
                <div>
                  <h4 className="font-medium">{item.product_name}</h4>
                  <p className="text-sm text-muted-foreground">{item.product_code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="min-w-[80px] justify-center">Qty: {item.quantity}</Badge>
                  <Badge variant="outline" className="min-w-[110px] justify-center">Before: {item.stock_befor_update}</Badge>
                  <Badge variant="outline" className="min-w-[100px] justify-center">After: {item.stock_after_update}</Badge>
                </div>
              </div>
            )) : <p className="text-center text-muted-foreground py-6">No items</p>}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};


