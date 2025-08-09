import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Calendar, Package, CheckCircle2, AlertTriangle, Trash2, Upload, ClipboardList, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/config';
import { completeDeliveryNote, removeUnloadingImage, updateDeliveryQuantity, uploadUnloading, getDeliveryNotes } from '@/services/deliveryNote.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DerivedStatus = 'delivered' | 'pending';

interface APIDeliveryNoteStock {
  id: number;
  product_code: string | null;
  product_name: string | null;
  quantity: string | null;
  delivered_quantity: string | null;
  balance_quantity: string | null;
  last_quantity_delivered_date?: string | null;
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
  invoice?: any;
  delivery_note_stock?: APIDeliveryNoteStock[];
  images_of_unloding?: Array<{
    id: number;
    image_path: string;
    comment?: string;
    image_update_date?: string;
    created_at?: string;
  }>;
}

export interface DeliveryQtyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryNote: APIDeliveryNote | null;
  onUpdated?: () => void; // callback to refresh parent state
}

const parseApiDate = (raw?: string | null): string => {
  if (!raw) return 'N/A';
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

const getDerivedStatus = (note: APIDeliveryNote | null): DerivedStatus => {
  if (!note) return 'pending';
  const apiStatus = (note.delivery_note_status || '').toLowerCase();
  return apiStatus === 'completed' ? 'delivered' : 'pending';
};

export const DeliveryQtyUpdateModal: React.FC<DeliveryQtyUpdateModalProps> = ({ isOpen, onClose, deliveryNote, onUpdated }) => {
  const { toast } = useToast();
  const [localItems, setLocalItems] = useState<APIDeliveryNoteStock[]>(deliveryNote?.delivery_note_stock || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [pendingQtyById, setPendingQtyById] = useState<Record<number, string>>({}); // delta to deliver now
  const [showNotFullyAlert, setShowNotFullyAlert] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const baseUrl = (api?.defaults?.baseURL as string || '').replace(/\/+$/, '');

  // Refresh only this modal's data (delivery_note_stock, images) after add/delete
  const refreshSelf = async () => {
    try {
      if (!deliveryNote) return;
      const resp = await getDeliveryNotes();
      if (resp.success && Array.isArray(resp.data)) {
        const updated = resp.data.find((n: any) => String(n.id) === String(deliveryNote.id));
        if (updated) {
          setLocalItems(updated.delivery_note_stock || []);
          // Merge images to reflect latest changes without replacing the whole note
          (deliveryNote as any).images_of_unloding = updated.images_of_unloding || [];
        }
      }
    } catch {
      // ignore refresh errors to avoid breaking UX
    }
  };

  // Keep items synced when a new note opens
  React.useEffect(() => {
    setLocalItems(deliveryNote?.delivery_note_stock || []);
    setSelectedFile(null);
    setComment('');
    setPendingQtyById({});
  }, [deliveryNote, isOpen]);

  const parseNum = (v?: string | null) => {
    const n = parseFloat(v || '0');
    return Number.isFinite(n) ? n : 0;
  };

  const isFullyDelivered = (it: APIDeliveryNoteStock) => {
    const qty = parseNum(it.quantity);
    const delivered = parseNum(it.delivered_quantity);
    // Fully delivered ONLY when delivered equals ordered qty and qty > 0
    return qty > 0 && delivered >= qty;
  };

  const isNotDelivered = (it: APIDeliveryNoteStock) => {
    const delivered = parseNum(it.delivered_quantity);
    const balance = parseNum(it.balance_quantity);
    // If delivered and balance are both 0, treat as NOT delivered
    return delivered === 0 && balance === 0;
  };

  const getItemStatus = (it: APIDeliveryNoteStock) => {
    if (isFullyDelivered(it)) return 'delivered' as const;
    const delivered = parseNum(it.delivered_quantity);
    if (delivered > 0) return 'partial' as const;
    return 'not_delivered' as const;
  };

  const allDelivered = useMemo(() => {
    const items = localItems || [];
    if (items.length === 0) return false;
    // All items must be fully delivered; items with delivered=0 and balance=0 are NOT delivered
    return items.every((it) => isFullyDelivered(it) && !isNotDelivered(it));
  }, [localItems]);

  // moved above

  const handleChangePending = (id: number, value: string) => {
    // keep only integers >= 0
    const sanitized = value.replace(/[^0-9]/g, '');
    setPendingQtyById((prev) => ({ ...prev, [id]: sanitized }));
  };

  const handleUpdateItem = async (item: APIDeliveryNoteStock) => {
    const deltaStr = pendingQtyById[item.id] ?? '';
    const delta = deltaStr === '' ? NaN : Number(deltaStr);
    const qty = parseFloat(item.quantity || '0') || 0;
    const delivered = parseFloat(item.delivered_quantity || '0') || 0;
    const balance = Math.max(0, qty - delivered);

    if (Number.isNaN(delta) || delta <= 0) {
      toast({ title: 'Invalid quantity', description: 'Enter a quantity greater than 0', variant: 'destructive' });
      return;
    }
    if (delta > balance) {
      toast({ title: 'Invalid quantity', description: `You can deliver at most ${balance}`, variant: 'destructive' });
      return;
    }

    try {
      setIsSaving(true);
      const resp = await updateDeliveryQuantity({ product_id: item.id, new_delivered: String(delta) });
      if (!resp.success) throw new Error(resp.message || 'Failed to update');

      setLocalItems((prev) => prev.map((it) => {
        if (it.id !== item.id) return it;
        const newDelivered = (parseFloat(it.delivered_quantity || '0') || 0) + delta;
        const totalQty = parseFloat(it.quantity || '0') || 0;
        const newBalance = Math.max(0, totalQty - newDelivered);
        return { ...it, delivered_quantity: String(newDelivered), balance_quantity: String(newBalance) };
      }));
      setPendingQtyById((prev) => ({ ...prev, [item.id]: '' }));
      toast({ title: 'Updated', description: 'Delivered quantity updated', variant: 'success' });
      onUpdated?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update quantity', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllDelivered = async () => {
    if (!deliveryNote) return;
    try {
      setIsSaving(true);
      // For each not fully delivered item, send only balance delta
      const updatable = (localItems || []).filter((it) => !isFullyDelivered(it));
      const promises = updatable.map(async (it) => {
        const qty = parseNum(it.quantity);
        const delivered = parseNum(it.delivered_quantity);
        const balance = Math.max(0, qty - delivered);
        if (balance <= 0) return null;
        return updateDeliveryQuantity({ product_id: it.id, new_delivered: String(balance) });
      });
      await Promise.all(promises);
      // Refresh local state
      setLocalItems((prev) => prev.map((it) => {
        if (isFullyDelivered(it)) return it;
        const qty = parseNum(it.quantity);
        return { ...it, delivered_quantity: String(qty), balance_quantity: '0' };
      }));
      toast({ title: 'All items delivered', description: 'All quantities updated to delivered', variant: 'success' });
      onUpdated?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to mark all as delivered', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const requestCompleteDelivery = () => {
    if (!deliveryNote) return;
    if (!allDelivered) {
      setShowNotFullyAlert(true);
      return;
    }
    setShowConfirmComplete(true);
  };

  const handleConfirmComplete = async () => {
    if (!deliveryNote) return;
    try {
      setIsCompleting(true);
      const resp = await completeDeliveryNote({ delivery_note_id: deliveryNote.id });
      if (!resp.success) throw new Error(resp.message || 'Failed to complete delivery');
      setShowConfirmComplete(false);
      toast({ title: 'Completed', description: 'Delivery marked as completed', variant: 'success' });
      // Close the modal first to avoid it reopening during parent refresh
      onClose();
      // Then refresh the parent table
      onUpdated?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to complete delivery', variant: 'destructive' });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleUploadUnloading = async () => {
    if (!deliveryNote) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image_path', selectedFile);
      }
      if (comment) formData.append('comment', comment);
      // auto set current date
      formData.append('image_update_date', new Date().toLocaleDateString('en-US'));
      formData.append('delivery_note_id', String(deliveryNote.id));
      const resp = await uploadUnloading(formData);
      if (resp.success) {
        toast({ title: 'Uploaded', description: 'Unloading info saved', variant: 'success' });
        setSelectedFile(null);
        setComment('');
        setFileInputKey((k) => k + 1);
        await refreshSelf();
        onUpdated?.();
      } else {
        throw new Error(resp.message || 'Upload failed');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to upload', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    try {
      setIsRemoving(true);
      const resp = await removeUnloadingImage({ image_id: imageId });
      if (resp.success) {
        toast({ title: 'Removed', description: 'Unloading comment/image removed', variant: 'success' });
        setRemoveTargetId(null);
        await refreshSelf();
        onUpdated?.();
      } else {
        throw new Error(resp.message || 'Remove failed');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to remove', variant: 'destructive' });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!deliveryNote) return null;

  const items = localItems || [];
  const images = (deliveryNote.images_of_unloding || []).filter(img => img.image_path && img.image_path !== 'N/A');
  const status = getDerivedStatus(deliveryNote);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" /> Update Delivered Quantity
          </DialogTitle>
          <DialogDescription>
            {deliveryNote.delivery_note_number} • {deliveryNote.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top Summary - minimal */}
          <Card className="border-0 bg-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className={`justify-center ${status === 'delivered' ? 'bg-success text-white' : 'bg-warning text-white'}`}>
                    {status === 'delivered' ? 'Delivered' : 'Pending'}
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    <Calendar className="w-3 h-3 mr-1" /> {parseApiDate(deliveryNote.delivery_note_created_date || deliveryNote.created_at)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {!allDelivered && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllDelivered} disabled={isSaving}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as Delivered
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={requestCompleteDelivery}
                    className={`${allDelivered && status !== 'delivered' ? 'bg-success text-white hover:bg-success/90' : ''}`}
                  >
                    Complete Delivery
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items editable list */}
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" /> Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No items available</div>
              ) : (
                <div className="space-y-3">
                  {items.map((it) => {
                    const qty = parseNum(it.quantity);
                    const delivered = parseNum(it.delivered_quantity);
                    const balance = parseNum(it.balance_quantity);
                    const disabled = isFullyDelivered(it); // only disable when fully delivered
                    const itemStatus = getItemStatus(it);
                    return (
                      <div key={it.id} className="border rounded-lg p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{it.product_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">Code: {it.product_code || 'N/A'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="justify-center">Qty: {qty}</Badge>
                            <Badge variant="outline" className="justify-center">Delivered: {delivered}</Badge>
                            <Badge variant="outline" className="justify-center">Balance: {balance}</Badge>
                            <Badge className={`justify-center ${itemStatus === 'delivered' ? 'bg-success text-white' : itemStatus === 'partial' ? 'bg-info text-white' : 'bg-warning text-white'}`}>
                              {itemStatus === 'delivered' ? 'Delivered' : itemStatus === 'partial' ? 'Partial' : 'Not Delivered'}
                            </Badge>
                          </div>
                        </div>
                        {it.last_quantity_delivered_date && (
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Last update: {parseApiDate(it.last_quantity_delivered_date)}
                          </div>
                        )}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div className="space-y-1">
                            <Label htmlFor={`delta-${it.id}`}>Deliver Now (qty)</Label>
                            <Input
                              id={`delta-${it.id}`}
                              type="number"
                              min={1}
                              step="1"
                              placeholder="Enter qty"
                              value={pendingQtyById[it.id] ?? ''}
                              disabled={disabled || isSaving}
                              onChange={(e) => handleChangePending(it.id, e.target.value)}
                            />
                          </div>
                          <div>
                            <Button
                              type="button"
                              onClick={() => handleUpdateItem(it)}
                              disabled={disabled || isSaving}
                              className="mt-2"
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                        {disabled && (
                          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Item fully delivered
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unloading images and comments */}
          <Card className="border-0 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> Unloading Comments & Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_path">Attach Image (optional)</Label>
                  <Input key={fileInputKey} id="image_path" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment (optional)</Label>
                  <Textarea id="comment" rows={1} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comment" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleUploadUnloading} disabled={!deliveryNote || isUploading}>
                  {isUploading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center"><Upload className="w-4 h-4 mr-2" /> Submit</span>
                  )}
                </Button>
              </div>

              {/* Existing images */}
              <div className="space-y-3">
                {(images || []).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">No images/comments added</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img) => {
                      const path = (img.image_path || '').replace(/^\/+/, '');
                      const url = `${baseUrl}/${path}`;
                      return (
                        <div key={img.id} className="relative rounded-lg overflow-hidden border">
                          {isRemoving && removeTargetId === img.id && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                          <img src={url} alt={img.comment || 'Unloading image'} className="w-full h-48 object-cover" onClick={() => window.open(url, '_blank')} />
                          <div className="p-2 space-y-1">
                            {img.comment && <div className="text-sm font-medium">{img.comment}</div>}
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {parseApiDate(img.image_update_date || img.created_at)}
                            </div>
                            <div className="pt-1 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setRemoveTargetId(img.id)}
                                disabled={isRemoving && removeTargetId === img.id}
                              >
                                <span className="flex items-center"><Trash2 className="w-4 h-4 mr-1" /> Remove</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>

    {/* Not fully delivered alert */}
    <AlertDialog open={showNotFullyAlert} onOpenChange={setShowNotFullyAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cannot Complete Delivery</AlertDialogTitle>
          <AlertDialogDescription>
            Some items are not fully delivered. Please update remaining quantities before completing this delivery.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setShowNotFullyAlert(false)}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Confirm completion */}
    <AlertDialog open={showConfirmComplete} onOpenChange={setShowConfirmComplete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Delivery</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to complete this delivery?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCompleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmComplete} disabled={isCompleting}>
            {isCompleting ? 'Completing...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Remove confirm */}
    <AlertDialog open={removeTargetId !== null} onOpenChange={(open) => { if (!open) setRemoveTargetId(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove comment/image</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this comment/image?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isRemoving} onClick={() => removeTargetId !== null && handleRemoveImage(removeTargetId)}>
            {isRemoving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Removing...</span> : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default DeliveryQtyUpdateModal;


