import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Truck, Phone, User2, MapPin, Download, Image as ImageIcon, Package, ClipboardList } from 'lucide-react';
import api from '@/services/config';
import { generateDeliveryNotePDF, type DeliveryNoteDetails } from '@/components/pdf';

type DerivedStatus = 'delivered' | 'in_transit' | 'pending';

interface APIDeliveryNoteStock {
  id: number;
  product_code: string | null;
  product_name: string | null;
  quantity: string | null;
  delivered_quantity: string | null;
  balance_quantity: string | null;
  last_quantity_delivered_date?: string | null;
}

interface APIInvoiceSummary {
  id: number;
  invoice_number: string;
  invoice_payment_type?: string;
  customer_name: string;
  contact_number: string;
  location?: string;
  project?: string;
  sub_quotation_total?: string;
  quotation_vat?: string;
  quotation_total?: string;
  delivery?: string;
  delivery_charges?: string;
  user_id?: number;
  user_name?: string;
  invoice_payment_status?: string; // done | pending | partially
  quotation_number?: string;
  created_at?: string;
  last_edit_user_id?: string;
  last_edit_user_name?: string;
  discount_price?: string;
  delivery_note_status?: string;
  refund_amount?: string | null;
  refund_reasons?: string | null;
}

interface APIDeliveryNote {
  id: number;
  quotation_number: string;
  invoice_number: string;
  customer_name: string;
  contact_number: string;
  delivery_note_created_date: string;
  user_id: string;
  user_name: string;
  delivery_charges: string | null;
  delivery_note_status: string; // completed | pending
  delivery_note_number: string;
  supervisor_name?: string;
  created_at: string;
  last_edit_user_id?: string;
  last_edit_user_name?: string;
  invoice_id?: string;
  location?: string;
  invoice?: APIInvoiceSummary;
  delivery_note_stock?: APIDeliveryNoteStock[];
  images_of_unloding?: Array<{
    id: number;
    image_path: string;
    comment?: string;
    image_update_date?: string;
    created_at?: string;
  }>;
}

export interface DeliveryNoteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryNote: APIDeliveryNote | null;
}

const parseApiDate = (raw?: string | null): string => {
  if (!raw) return 'N/A';
  // Try common API format yyyy/MM/dd HH:mm:ss
  if (raw.includes('/')) {
    const [datePart] = raw.split(' ');
    const [yyyy, mm, dd] = datePart.split('/').map(n => parseInt(n, 10));
    if (!Number.isNaN(yyyy) && !Number.isNaN(mm) && !Number.isNaN(dd)) {
      return new Date(yyyy, mm - 1, dd).toLocaleDateString();
    }
  }
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? 'N/A' : dt.toLocaleDateString();
};

const getDerivedStatus = (note: APIDeliveryNote): DerivedStatus => {
  const apiStatus = (note.delivery_note_status || '').toLowerCase();
  const stocks = (note.delivery_note_stock || []) as APIDeliveryNoteStock[];

  if (apiStatus === 'completed') {
    return 'delivered';
  }
  if (apiStatus === 'pending') {
    const anyPartialWithBalance = stocks.some((s) => {
      const delivered = parseFloat(s.delivered_quantity || '0') || 0;
      const quantity = parseFloat(s.quantity || '0') || 0;
      const balance = parseFloat(s.balance_quantity || '0') || 0;
      return delivered !== quantity && balance > 0;
    });
    if (anyPartialWithBalance) return 'in_transit';
  }

  const hasStocks = stocks.length > 0;
  const allUndelivered = hasStocks && stocks.every((s) => {
    const delivered = parseFloat(s.delivered_quantity || '0') || 0;
    const quantity = parseFloat(s.quantity || '0') || 0;
    const balance = parseFloat(s.balance_quantity || '0') || 0;
    return delivered === 0 && balance === quantity;
  });
  if (allUndelivered) return 'pending';
  return 'pending';
};

const getStatusBadge = (note: APIDeliveryNote) => {
  const status = getDerivedStatus(note);
  const map = {
    delivered: { className: 'justify-center bg-success text-white', label: 'Delivered' },
    in_transit: { className: 'justify-center bg-info text-white', label: 'In Transit' },
    pending: { className: 'justify-center bg-warning text-white', label: 'Pending' },
  } as const;
  const cfg = map[status];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
};

const formatCurrency = (value?: string | number | null, decimals = 3) => {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : 0;
  return `OMR ${Number(num || 0).toFixed(decimals)}`;
};

export const DeliveryNoteDetailsModal: React.FC<DeliveryNoteDetailsModalProps> = ({ isOpen, onClose, deliveryNote }) => {
  const rawBase = (api?.defaults?.baseURL as string) || '';
  const baseUrl = rawBase.replace(/\/+$/, '');

  const items = deliveryNote?.delivery_note_stock || [];
  const images = (deliveryNote?.images_of_unloding || []).filter(img => img.image_path && img.image_path !== 'N/A');

  const totals = useMemo(() => {
    const invoice = deliveryNote?.invoice;
    return {
      subtotal: invoice?.sub_quotation_total,
      vat: invoice?.quotation_vat,
      total: invoice?.quotation_total,
      delivery: invoice?.delivery_charges ?? deliveryNote?.delivery_charges ?? '0',
      paymentStatus: invoice?.invoice_payment_status,
    };
  }, [deliveryNote]);

  if (!deliveryNote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Note Details
          </DialogTitle>
          <DialogDescription>
            {deliveryNote.delivery_note_number} • {deliveryNote.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top Summary */}
          <Card className="border-0 bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getStatusBadge(deliveryNote)}
                  <Badge variant="outline" className="justify-center">
                    <Calendar className="w-3 h-3 mr-1" /> {parseApiDate(deliveryNote.delivery_note_created_date || deliveryNote.created_at)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await generateDeliveryNotePDF((deliveryNote as unknown as DeliveryNoteDetails), { openInNewTab: true });
                      } catch {}
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Delivery Note No</span>
                    <p className="font-medium">{deliveryNote.delivery_note_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quotation No</span>
                    <p className="font-medium">{deliveryNote.quotation_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Invoice No</span>
                    <p className="font-medium">{deliveryNote.invoice_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer</span>
                    <p className="font-medium">{deliveryNote.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact</span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{deliveryNote.contact_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{deliveryNote.location || 'N/A'}</p>
                    </div>
                  </div>
                  {/* Supervisor removed as requested */}
                  <div>
                    <span className="text-muted-foreground">Created By</span>
                    <div className="flex items-center gap-2">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{deliveryNote.user_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Payment Status</span>
                    <div className="mt-1">
                      <Badge className={`justify-center ${
                        (totals.paymentStatus || '').toLowerCase() === 'done' ? 'bg-success text-white' :
                        (totals.paymentStatus || '').toLowerCase() === 'partially' ? 'bg-orange-500 text-white' : 'bg-warning text-white'
                      }`}>
                        {totals.paymentStatus ? totals.paymentStatus.toUpperCase() : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subtotal</span>
                    <p className="font-medium">{formatCurrency(totals.subtotal)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">VAT</span>
                    <p className="font-medium">{formatCurrency(totals.vat)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total</span>
                    <p className="font-bold text-green-600">{formatCurrency(totals.total)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery Charges</span>
                    <p className="font-medium">{formatCurrency(totals.delivery)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No items available</div>
              ) : (
                <div className="space-y-3">
                  {items.map((it, idx) => {
                    const qty = parseFloat(it.quantity || '0') || 0;
                    const delivered = parseFloat(it.delivered_quantity || '0') || 0;
                    const balance = parseFloat(it.balance_quantity || '0') || 0;
                    const statusBadge = delivered >= qty ? 'bg-success text-white' : delivered > 0 ? 'bg-info text-white' : 'bg-warning text-white';
                    return (
                      <div key={it.id || idx} className="border rounded-lg p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{it.product_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">Code: {it.product_code || 'N/A'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="justify-center">Qty: {qty}</Badge>
                            <Badge variant="outline" className="justify-center">Delivered: {delivered}</Badge>
                            <Badge variant="outline" className="justify-center">Balance: {balance}</Badge>
                            <Badge className={`justify-center ${statusBadge}`}>{delivered >= qty ? 'Delivered' : delivered > 0 ? 'Partial' : 'Pending'}</Badge>
                          </div>
                        </div>
                        {it.last_quantity_delivered_date && (
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Last delivered: {parseApiDate(it.last_quantity_delivered_date)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Unloading Images ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No images uploaded</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img) => {
                    const path = (img.image_path || '').replace(/^\/+/, '');
                    const url = `${baseUrl}/${path}`;
                    return (
                      <div key={img.id} className="rounded-lg overflow-hidden border">
                        <img
                          src={url}
                          alt={img.comment || 'Unloading image'}
                          className="w-full h-48 object-cover"
                          onClick={() => window.open(url, '_blank')}
                        />
                        <div className="p-2 space-y-1">
                          {img.comment && <div className="text-sm font-medium">{img.comment}</div>}
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {parseApiDate(img.image_update_date || img.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryNoteDetailsModal;


