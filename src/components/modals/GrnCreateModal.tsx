import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/store/useProductStore';
import { grnService } from '@/services/grn.js';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Search, ChevronDown, Loader2 } from 'lucide-react';

interface GrnCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GrnCreateModal: React.FC<GrnCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { products, fetchProducts } = useProductStore();
  const { toast } = useToast();
  const [grnNumber, setGrnNumber] = useState('');
  const [query, setQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ product_code: string; product_name: string; quantity: string }>>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [pendingQty, setPendingQty] = useState<string>('0');
  const [showList, setShowList] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (isOpen && (!products || products.length === 0)) {
      fetchProducts();
    }
  }, [isOpen, fetchProducts, products]);

  const filtered = useMemo(() => {
    if (!query) return products || [];
    const q = query.toLowerCase();
    return (products || []).filter((p: any) =>
      (p.product_code || '').toLowerCase().includes(q) ||
      (p.product_name || '').toLowerCase().includes(q) ||
      (p.product_brand || '').toLowerCase().includes(q)
    );
  }, [products, query]);

  const selectProduct = (p: any) => {
    setSelectedProduct(p);
    setPendingQty('0');
    setQuery(`${p.product_code} • ${p.product_name}`);
    setShowList(false);
  };

  const addSelected = () => {
    if (!selectedProduct) return;
    const code = String(selectedProduct.product_code);
    if (selectedItems.some(si => si.product_code === code)) {
      toast({ title: 'Already added', description: 'This product is already in the list', variant: 'info' });
      return;
    }
    const qtyNum = parseFloat(pendingQty.replace(/,/g, '')) || 0;
    if (qtyNum <= 0) {
      toast({ title: 'Validation', description: 'Please enter quantity greater than 0', variant: 'destructive' });
      return;
    }
    setSelectedItems(prev => [
      ...prev,
      { product_code: code, product_name: selectedProduct.product_name, quantity: pendingQty },
    ]);
    // reset selector
    setSelectedProduct(null);
    setQuery('');
    setPendingQty('0');
  };

  const removeItem = (code: string) => setSelectedItems(prev => prev.filter(i => i.product_code !== code));

  const updateQty = (code: string, val: string) => {
    const norm = val.replace(/,/g, '');
    setSelectedItems(prev => prev.map(i => i.product_code === code ? { ...i, quantity: Number(norm || 0).toFixed(3) } : i));
  };

  const handleCreate = async () => {
    try {
      if (isCreating) return;
      if (!grnNumber.trim()) {
        toast({ title: 'Validation', description: 'Please enter GRN number', variant: 'destructive' });
        return;
      }
      if (selectedItems.length === 0) {
        toast({ title: 'Validation', description: 'Please add at least one product', variant: 'destructive' });
        return;
      }
      setIsCreating(true);
      const payload = {
        grn_number: grnNumber.trim(),
        product_data: selectedItems,
        user_id: String(user?.id || user?.user_id || '1'),
      };
      const resp = await grnService.createGRN(payload);
      toast({ title: 'Success', description: resp.message || 'GRN created', variant: 'success' });
      // Refresh both GRN list (via parent onSuccess) and product inventory
      await fetchProducts();
      resetState();
      onClose();
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create GRN', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const resetState = () => {
    setGrnNumber('');
    setQuery('');
    setSelectedItems([]);
    setSelectedProduct(null);
    setPendingQty('0');
    setShowList(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetState(); } onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create GRN</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">GRN Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">GRN Number</label>
                  <Input value={grnNumber} onChange={e => setGrnNumber(e.target.value)} placeholder="Enter GRN number" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Add Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search/select */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 pr-10 w-full sm:w-[520px]"
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
                <div className="max-h-56 overflow-y-auto border rounded-md">
                  {(query ? filtered : (products || [])).slice(0, 50).map((p: any) => (
                    <button key={p.id}
                      type="button"
                      onClick={() => selectProduct(p)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{p.product_name}</div>
                        <div className="text-xs text-muted-foreground">{p.product_code} • {p.product_brand}</div>
                      </div>
                    </button>
                  ))}
                  {(query ? filtered : (products || [])).length === 0 && <div className="p-3 text-sm text-muted-foreground">No products found</div>}
                </div>
              )}

              {selectedProduct && (
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{selectedProduct.product_name}</div>
                    <div className="text-xs text-muted-foreground">{selectedProduct.product_code} • {selectedProduct.product_brand}</div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Qty</label>
                    <Input className="w-28" value={pendingQty} onChange={e => setPendingQty(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setSelectedProduct(null); setQuery(''); setPendingQty('0.000'); }}>Clear</Button>
                    <Button onClick={addSelected} disabled={(parseFloat(pendingQty.replace(/,/g, '')) || 0) <= 0}>
                      Add Product
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected items */}
              <div className="space-y-3">
                {selectedItems.map((it) => (
                  <div key={it.product_code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{it.product_name}</div>
                      <div className="text-xs text-muted-foreground">{it.product_code}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Qty</label>
                        <Input value={it.quantity}
                          onChange={e => updateQty(it.product_code, e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(it.product_code)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {selectedItems.length === 0 && <div className="text-sm text-muted-foreground">No products added yet</div>}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { resetState(); onClose(); }}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary-hover" disabled={isCreating}>
              {isCreating ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating...</span>) : 'Create GRN'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


