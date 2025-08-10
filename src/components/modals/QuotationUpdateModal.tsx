import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronDown, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { productService } from '@/services/product.js';
import { quotationService } from '@/services/quotation.js';
import { formatOMRCurrency } from '@/utils/formatters';

interface QuotationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  quotation: any; // existing quotation with quotation_stock[]
}

const toNum = (v: any) => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? 0 : n;
};
const toMoney = (n: number, d: number = 2) => n.toFixed(d);

export const QuotationUpdateModal: React.FC<QuotationUpdateModalProps> = ({ isOpen, onClose, onSuccess, quotation }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [qty, setQty] = useState('0');

  const [items, setItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | number | null>(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const resp = await productService.fetchAllProducts();
        if (resp.success && Array.isArray(resp.data)) setProducts(resp.data as any);
      } catch (e: any) {
        toast({ title: 'Error', description: e.message || 'Failed to load products', variant: 'destructive' });
      }
    })();
  }, [isOpen, toast]);

  useEffect(() => {
    if (!quotation) return;
    // Seed items from existing quotation
    const seeded = (quotation.quotation_stock || []).map((it: any) => ({
      id: it.id,
      quotation_id: quotation.id,
      product_code: it.product_code,
      product_name: it.product_name,
      quantity: String(it.quantity ?? '0'),
      unit_price: String(it.unit_price ?? '0'),
      total: String(it.total ?? '0'),
      created_at: it.created_at,
      stock_befor_update: it.stock_befor_update,
      stock_after_update: it.stock_after_update,
    }));
    setItems(seeded);
    // Sync discount/delivery toggles and values from quotation
    const dp = toNum(quotation?.discount_price);
    setEnableDiscount(dp > 0);
    setDiscountValue(String(quotation?.discount_price || '0'));
    setDiscountComment(String(quotation?.discount_comment || ''));
    const delAmt = toNum(quotation?.delivery_charges);
    const delOn = delAmt > 0 || String(quotation?.delivery || 'no') === 'yes';
    setDeliveryOn(delOn);
    setDeliveryCharges(String(quotation?.delivery_charges || '0'));
  }, [quotation]);

  const filtered = useMemo(() => {
    if (!query) return products || [];
    const q = query.toLowerCase();
    return (products || []).filter((p: any) =>
      String(p.product_code || '').toLowerCase().includes(q) ||
      String(p.product_name || '').toLowerCase().includes(q) ||
      String(p.product_brand || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  const chooseProduct = (p: any) => {
    setSelectedProduct(p);
    setQty('0');
    setQuery(`${p.product_code} • ${p.product_name}`);
    setShowList(false);
  };

  const addItem = () => {
    if (!selectedProduct) return;
    const stock = toNum(selectedProduct.warehouse_stock);
    if (stock <= 0) {
      toast({ title: 'Stock not available', description: 'Without stock you cannot add this product.', variant: 'destructive' });
      return;
    }
    const quantity = toNum(qty);
    if (quantity <= 0) {
      toast({ title: 'Validation', description: 'Enter quantity greater than 0', variant: 'destructive' });
      return;
    }
    if (items.some(it => it.product_code === selectedProduct.product_code)) {
      toast({ title: 'Already added', description: 'Product already added to quotation', variant: 'info' });
      return;
    }
    // Determine unit price based on existing quotation type
    const priceMode = (String(quotation?.quatation_type || '')).toLowerCase() === 'shop' ? 'Shop' : 'Customer';
    const unit = priceMode === 'Customer' ? toNum(selectedProduct.unit_price_customer) : toNum(selectedProduct.unit_price_shop);
    const lineTotal = unit * quantity;
    setItems(prev => ([...prev, {
      product_code: String(selectedProduct.product_code),
      product_name: String(selectedProduct.product_name),
      unit_price: toMoney(unit, 2),
      quantity: toMoney(quantity, 2),
      total: toMoney(lineTotal, 2),
    }]));
    setSelectedProduct(null);
    setQuery('');
    setQty('0');
  };

  const updateQty = (code: string, value: string) => {
    const qn = toNum(value);
    setItems(prev => prev.map(it => it.product_code === code ? {
      ...it,
      quantity: toMoney(qn, 2),
      total: toMoney(toNum(it.unit_price) * qn, 2),
    } : it));
  };
  const removeItem = async (it: any) => {
    const key = (it && (it.id ?? it.product_code)) as string | number;
    setDeletingKey(key);
    // If item exists in DB (has id), call delete API first
    if (it && it.id) {
      try {
        const resp = await quotationService.deleteProduct({ quaution_product_id: it.id });
        if (!resp.success) {
          toast({ title: 'Failed to remove', description: resp.message || 'Server rejected removal', variant: 'destructive' });
          setDeletingKey(null);
          return;
        }
      } catch (e: any) {
        toast({ title: 'Failed to remove', description: e.message || 'Network error', variant: 'destructive' });
        setDeletingKey(null);
        return;
      }
    }
    setItems(prev => prev.filter(p => p !== it));
    setDeletingKey(null);
  };

  // Totals recompute using discount/delivery already present fields
  const subTotal = useMemo(() => items.reduce((s, it) => s + toNum(it.total), 0), [items]);
  const [enableDiscount, setEnableDiscount] = useState(() => toNum(quotation?.discount_price) > 0);
  const [discountValue, setDiscountValue] = useState<string>(String(quotation?.discount_price || '0'));
  const [discountComment, setDiscountComment] = useState<string>(String(quotation?.discount_comment || ''));
  const discount = enableDiscount ? toNum(discountValue) : 0;
  const effectiveSub = Math.max(0, subTotal - discount);
  const vat = +(effectiveSub * 0.05).toFixed(2);
  const totalBeforeDelivery = effectiveSub + vat;
  const [deliveryOn, setDeliveryOn] = useState(() => toNum(quotation?.delivery_charges) > 0 || String(quotation?.delivery || 'no') === 'yes');
  const [deliveryCharges, setDeliveryCharges] = useState<string>(String(quotation?.delivery_charges || '0'));
  const delivery = deliveryOn ? toNum(deliveryCharges) : 0;
  const grandTotal = totalBeforeDelivery + delivery;

  const save = async () => {
    try {
      if (isSaving) return;
      if (!quotation) return;
      if (items.length === 0) {
        toast({ title: 'Validation', description: 'Add at least one product', variant: 'destructive' });
        return;
      }
      setIsSaving(true);
      if (enableDiscount && toNum(discountValue) > 0 && !discountComment.trim()) {
        toast({ title: 'Validation', description: 'Discount comment is required when discount is applied', variant: 'destructive' });
        setIsSaving(false);
        return;
      }
      const payload: any = {
        quotation_id: quotation.id,
        quatation_product_data: items.map(it => ({
          id: it.id,
          quotation_id: quotation.id,
          product_code: it.product_code,
          product_name: it.product_name,
          quantity: String(it.quantity),
          unit_price: String(it.unit_price),
          stock_befor_update: it.stock_befor_update,
          stock_after_update: it.stock_after_update,
          total: String(it.total),
          created_at: it.created_at,
        })),
        sub_quotation_total: toMoney(subTotal, 2),
        quotation_vat: toMoney(vat, 2),
        quotation_total: toMoney(grandTotal, 2),
        delivery: deliveryOn ? 'yes' : 'no',
        delivery_charges: deliveryOn ? toMoney(delivery, 2) : '0',
        discount_price: enableDiscount ? toMoney(discount, 2) : '0',
        discount_comment: enableDiscount ? discountComment.trim() : null,
        last_edit_user_id: user?.id,
        last_edit_user_name: user?.full_name || user?.user_name || 'User',
      };
      const resp = await quotationService.update(payload);
      if (resp.success) {
        toast({ title: 'Success', description: resp.message || 'Quotation updated', variant: 'success' });
        onClose();
        onSuccess();
      } else {
        toast({ title: 'Error', description: resp.message || 'Failed to update quotation', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update quotation', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Quotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Quotation Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Quotation Type</label>
                <Input value={quotation?.quatation_type || ''} disabled />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Customer Name</label>
                <Input value={quotation?.customer_name || ''} disabled />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Contact Number</label>
                <Input value={quotation?.contact_number || ''} disabled />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <Input value={quotation?.location || ''} disabled />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Project / Purpose</label>
                <Input value={quotation?.project || ''} disabled />
              </div>
              {/* Discount info moved to Options section for editing */}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Edit Products</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 pr-10 w-full"
                  placeholder="Search by code, name or brand..."
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedProduct(null); setShowList(true); }}
                  onFocus={() => setShowList(true)}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted" onClick={() => setShowList(s => !s)}>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showList ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {!selectedProduct && showList && (
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {(query ? filtered : products).slice(0, 60).map((p:any) => {
                    const out = toNum(p.warehouse_stock) <= 0;
                    return (
                      <button key={p.id} type="button" onClick={() => chooseProduct(p)} className={`w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between ${out ? 'text-destructive' : ''}`}>
                        <div>
                          <div className="font-medium">{p.product_name}</div>
                          <div className="text-xs text-muted-foreground">{p.product_code} • {p.product_brand}</div>
                        </div>
                        {out && <Badge variant="destructive">Out of stock</Badge>}
                      </button>
                    );
                  })}
                  {(query ? filtered : products).length === 0 && <div className="p-3 text-sm text-muted-foreground">No products found</div>}
                </div>
              )}

              {selectedProduct && (
                <div className="flex flex-col md:flex-row md:items-end gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{selectedProduct.product_name}</div>
                    <div className="text-xs text-muted-foreground">{selectedProduct.product_code} • {selectedProduct.product_brand}</div>
                    {toNum(selectedProduct.warehouse_stock) <= 0 && (
                      <div className="mt-2 text-destructive text-sm inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" />Stock not available. Without stock you cannot add product.</div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Qty</label>
                    <Input className="w-28" value={qty} onChange={e => setQty(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setSelectedProduct(null); setQuery(''); setQty('0'); }}>Clear</Button>
                    <Button onClick={addItem} disabled={toNum(selectedProduct.warehouse_stock) <= 0 || toNum(qty) <= 0}>Add Product</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.product_code+String(it.id||'')} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{it.product_name}</div>
                      <div className="text-xs text-muted-foreground">{it.product_code}</div>
                      <div className="text-xs mt-1">Unit: {formatOMRCurrency(toNum(it.unit_price))} • Line: {formatOMRCurrency(toNum(it.total))}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Qty</label>
                        <Input value={it.quantity} onChange={e => updateQty(it.product_code, e.target.value)} className="w-28" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(it)} disabled={deletingKey === (it.id ?? it.product_code)}>
                        {deletingKey === (it.id ?? it.product_code) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-sm text-muted-foreground">No products added yet</div>}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          {/* Options (Discount & Delivery) */}
          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Options</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch checked={enableDiscount} onCheckedChange={setEnableDiscount} />
                  <span className="text-sm font-medium">Enable Discount</span>
                </div>
                {enableDiscount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Discount Amount</label>
                      <Input className="w-full md:w-60" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Discount Comment</label>
                      <Textarea value={discountComment} onChange={e=>setDiscountComment(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch checked={deliveryOn} onCheckedChange={setDeliveryOn} />
                  <span className="text-sm font-medium">Add Delivery Charges</span>
                </div>
                {deliveryOn && (
                  <div>
                    <label className="text-sm text-muted-foreground">Delivery Charges</label>
                    <Input className="w-full md:w-60" value={deliveryCharges} onChange={e=>setDeliveryCharges(e.target.value)} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Totals</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span className="font-medium">{formatOMRCurrency(subTotal)}</span></div>
              {enableDiscount && toNum(discountValue) > 0 && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount Amount</span><span className="font-medium text-destructive">{formatOMRCurrency(discount)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sub Total (After Discount)</span><span className="font-medium">{formatOMRCurrency(effectiveSub)}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">VAT (5%)</span><span className="font-medium">{formatOMRCurrency(vat)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{formatOMRCurrency(totalBeforeDelivery)}</span></div>
              {deliveryOn && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery Charges</span><span className="font-medium">{formatOMRCurrency(delivery)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Charges with Delivery</span><span className="font-medium">{formatOMRCurrency(grandTotal)}</span></div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={save} disabled={isSaving || items.length===0} className="bg-primary hover:bg-primary-hover">
                  {isSaving ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span>) : 'Update Quotation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationUpdateModal;


