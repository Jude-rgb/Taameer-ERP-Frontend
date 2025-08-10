import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronDown, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { productService } from '@/services/product.js';
import { quotationService } from '@/services/quotation.js';
import { formatOMRCurrency } from '@/utils/formatters';

type PriceMode = 'Customer' | 'Shop';

interface ProductOption {
  id: number | string;
  product_code: string;
  product_name: string;
  product_brand?: string | null;
  warehouse_stock?: string | number | null;
  unit_price_customer?: string | number | null;
  unit_price_shop?: string | number | null;
}

interface LineItem {
  product_code: string;
  product_name: string;
  unit_price: string; // fixed 2-3 decimals string
  quantity: string; // string decimal
  total: string; // string decimal
}

interface QuotationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const toNum = (v: any) => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

const toMoney = (n: number, d: number = 2) => n.toFixed(d);

export const QuotationCreateModal: React.FC<QuotationCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [priceMode, setPriceMode] = useState<PriceMode>('Customer');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [project, setProject] = useState('');

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [qty, setQty] = useState('0');

  const [items, setItems] = useState<LineItem[]>([]);

  const [enableDiscount, setEnableDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState('0');
  const [discountComment, setDiscountComment] = useState('');
  const [deliveryOn, setDeliveryOn] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState('0');

  const [isSaving, setIsSaving] = useState(false);

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

  const filtered = useMemo(() => {
    if (!query) return products || [];
    const q = query.toLowerCase();
    return (products || []).filter(p =>
      String(p.product_code || '').toLowerCase().includes(q) ||
      String(p.product_name || '').toLowerCase().includes(q) ||
      String(p.product_brand || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  const chooseProduct = (p: ProductOption) => {
    setSelectedProduct(p);
    setQty('0');
    setQuery(`${p.product_code} • ${p.product_name}`);
    setShowList(false);
  };

  const computedUnitPrice = (p: ProductOption | null): number => {
    if (!p) return 0;
    return priceMode === 'Customer' ? toNum(p.unit_price_customer) : toNum(p.unit_price_shop);
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
    const unit = computedUnitPrice(selectedProduct);
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

  const removeItem = (code: string) => setItems(prev => prev.filter(it => it.product_code !== code));

  // Totals
  const subTotal = useMemo(() => items.reduce((s, it) => s + toNum(it.total), 0), [items]);
  const effectiveSub = useMemo(() => Math.max(0, subTotal - (enableDiscount ? toNum(discountValue) : 0)), [subTotal, enableDiscount, discountValue]);
  const vat = useMemo(() => +(effectiveSub * 0.05).toFixed(2), [effectiveSub]);
  const totalBeforeDelivery = useMemo(() => effectiveSub + vat, [effectiveSub, vat]);
  const delivery = useMemo(() => (deliveryOn ? toNum(deliveryCharges) : 0), [deliveryOn, deliveryCharges]);
  const grandTotal = useMemo(() => totalBeforeDelivery + delivery, [totalBeforeDelivery, delivery]);

  const save = async () => {
    try {
      if (isSaving) return;
      if (!priceMode) return;
      if (!customerName.trim() || !contactNumber.trim() || !location.trim() || !project.trim()) {
        toast({ title: 'Validation', description: 'Customer, contact, location and project/purpose are required', variant: 'destructive' });
        return;
      }
      if (items.length === 0) {
        toast({ title: 'Validation', description: 'Add at least one product', variant: 'destructive' });
        return;
      }
      if (enableDiscount && toNum(discountValue) > 0 && !discountComment.trim()) {
        toast({ title: 'Validation', description: 'Discount comment is required when discount is applied', variant: 'destructive' });
        return;
      }
      setIsSaving(true);
      const payload: any = {
        quatation_type: priceMode === 'Customer' ? 'Customer' : 'Shop',
        customer_name: customerName.trim(),
        contact_number: contactNumber.trim(),
        location: location.trim(),
        project: project.trim(),
        quatation_product_data: items.map(it => ({
          product_code: it.product_code,
          product_name: it.product_name,
          unit_price: it.unit_price,
          quantity: it.quantity,
          total: it.total,
        })),
        sub_quotation_total: toMoney(subTotal, 2),
        quotation_vat: toMoney(vat, 2),
        quotation_total: toMoney(grandTotal, 2),
        delivery: deliveryOn ? 'yes' : 'no',
        delivery_charges: deliveryOn ? toMoney(delivery, 2) : '0',
        discount_price: enableDiscount ? toMoney(toNum(discountValue), 2) : '0',
        discount_comment: enableDiscount ? discountComment.trim() : null,
        user_id: user?.id,
        user_name: user?.full_name || user?.user_name || 'User',
      };
      const resp = await quotationService.create(payload);
      if (resp.success) {
        toast({ title: 'Success', description: resp.message || 'Quotation created', variant: 'success' });
        reset();
        onClose();
        onSuccess();
      } else {
        toast({ title: 'Error', description: resp.message || 'Failed to create quotation', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to create quotation', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setPriceMode('Customer');
    setCustomerName('');
    setContactNumber('');
    setLocation('');
    setProject('');
    setQuery('');
    setShowList(false);
    setSelectedProduct(null);
    setQty('0');
    setItems([]);
    setEnableDiscount(false);
    setDiscountValue('0');
    setDiscountComment('');
    setDeliveryOn(false);
    setDeliveryCharges('0');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) reset(); onClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quotation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Quotation Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Quotation Type</label>
                  <div className="flex items-center gap-3 mt-1">
                    <Button
                      variant={priceMode==='Customer'?'default':'outline'}
                      onClick={() => setPriceMode('Customer')}
                      disabled={items.length>0 || !!selectedProduct}
                    >
                      Customer Price
                    </Button>
                    <Button
                      variant={priceMode==='Shop'?'default':'outline'}
                      onClick={() => setPriceMode('Shop')}
                      disabled={items.length>0 || !!selectedProduct}
                    >
                      Shop Price
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Customer Name</label>
                  <Input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Enter customer name" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Contact Number</label>
                  <Input value={contactNumber} onChange={e=>setContactNumber(e.target.value)} placeholder="Enter contact number" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Location</label>
                  <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Enter location" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Project / Purpose</label>
                  <Input value={project} onChange={e=>setProject(e.target.value)} placeholder="Enter project or purpose" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Add Products</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Search/select */}
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

              {/* Items */}
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.product_code} className="flex items-center justify-between p-3 border rounded-lg">
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
                      <Button variant="ghost" size="icon" onClick={() => removeItem(it.product_code)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-sm text-muted-foreground">No products added yet</div>}
              </div>
            </CardContent>
          </Card>

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
                      <Input className="w-full md:w-60" placeholder="0.000" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Discount Comment</label>
                      <Textarea value={discountComment} onChange={e => setDiscountComment(e.target.value)} placeholder="Add a note for discount" />
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
                    <Input className="w-full md:w-60" placeholder="0.000" value={deliveryCharges} onChange={e => setDeliveryCharges(e.target.value)} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="border-0 bg-card">
            <CardHeader><CardTitle className="text-lg">Totals</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Sub Total</span><span className="font-medium">{formatOMRCurrency(subTotal)}</span></div>
              {enableDiscount && toNum(discountValue) > 0 && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount Amount</span><span className="font-medium text-destructive">{formatOMRCurrency(toNum(discountValue))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Total (After Discount)</span><span className="font-medium">{formatOMRCurrency(effectiveSub)}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">VAT (5%)</span><span className="font-medium">{formatOMRCurrency(vat)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">{formatOMRCurrency(totalBeforeDelivery)}</span></div>
              {deliveryOn && (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery Charges</span><span className="font-medium">{formatOMRCurrency(delivery)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Charges with Delivery</span><span className="font-bold">{formatOMRCurrency(grandTotal)}</span></div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
                <Button onClick={save} disabled={isSaving || items.length===0} className="bg-primary hover:bg-primary-hover">
                  {isSaving ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span>) : 'Create Quotation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationCreateModal;


