import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Eye, Truck, Download, PackageCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/utils/exportToExcel';
import { getDeliveryNotes } from '@/services/deliveryNote.js';
import { Switch } from '@/components/ui/switch';
import DeliveryNoteFilter, { DeliveryNoteFilters } from '@/components/DeliveryNoteFilter';
import { DeliveryNoteDetailsModal } from '@/components/modals/DeliveryNoteDetailsModal';
import { DeliveryQtyUpdateModal } from '@/components/modals/DeliveryQtyUpdateModal';
import { generateDeliveryNotePDF, type DeliveryNoteDetails } from '@/components/pdf';

interface APIDeliveryNoteStock {
  id: number;
  product_code: string | null;
  product_name: string | null;
  quantity: string | null;
  delivered_quantity: string | null;
  balance_quantity: string | null;
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
  delivery_note_status: string; // completed | created | partially etc.
  delivery_note_number: string;
  supervisor_name?: string;
  created_at: string;
  location?: string;
  invoice?: any;
  delivery_note_stock?: APIDeliveryNoteStock[];
  // computed field for table search
  searchableText?: string;
}

type DerivedStatus = 'delivered' | 'pending';

export const DeliveryNotes = () => {
  const [deliveryNotes, setDeliveryNotes] = useState<APIDeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<DeliveryNoteFilters>({ status: null, fromDate: null, toDate: null });
  const [showMyData, setShowMyData] = useState(false);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<APIDeliveryNote | null>(null);
  const [updateQtyNote, setUpdateQtyNote] = useState<APIDeliveryNote | null>(null);
  const { toast } = useToast();

  const storedUser = (() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const currentUserId = storedUser?.id;

  useEffect(() => {
    const loadDeliveryNotes = async () => {
      setIsLoading(true);
      try {
        const resp = await getDeliveryNotes();
        if (resp.success && Array.isArray(resp.data)) {
          setDeliveryNotes(resp.data as APIDeliveryNote[]);
        } else {
          setDeliveryNotes([]);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to fetch delivery notes', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadDeliveryNotes();
  }, [toast]);

  const getDerivedStatus = (note: APIDeliveryNote): DerivedStatus => {
    const apiStatus = (note.delivery_note_status || '').toLowerCase();
    return apiStatus === 'completed' ? 'delivered' : 'pending';
  };

  const matchesFilters = (note: APIDeliveryNote): boolean => {
    // My data filter
    if (showMyData && currentUserId != null) {
      if (String(note.user_id) !== String(currentUserId)) return false;
    }

    // Status filter
    if (filters.status) {
      if (getDerivedStatus(note) !== filters.status) return false;
    }

    // Date filter
    if (filters.fromDate || filters.toDate) {
      const dateStr = note.delivery_note_created_date || note.created_at;
      const d = parseApiDate(dateStr);
      // If user applied a date filter and we cannot parse date, exclude this row
      if (!d) return false;
      if (filters.fromDate) {
        const from = new Date(filters.fromDate);
        from.setHours(0, 0, 0, 0);
        if (d < from) return false;
      }
      if (filters.toDate) {
        const to = new Date(filters.toDate);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
    }
    return true;
  };

  const filteredNotes = useMemo(() => deliveryNotes.filter(matchesFilters), [deliveryNotes, filters, showMyData, currentUserId]);

  // KPI counts
  const totalDeliveries = filteredNotes.length;
  const deliveredCount = filteredNotes.filter(n => getDerivedStatus(n) === 'delivered').length;
  const pendingCount = filteredNotes.filter(n => getDerivedStatus(n) === 'pending').length;

  // Robust date parsing for API formats
  const parseApiDate = (raw?: string | null): Date | null => {
    if (!raw) return null;
    // Format: yyyy/MM/dd HH:mm:ss
    if (raw.includes('/')) {
      try {
        const [datePart, timePart] = raw.split(' ');
        const [yyyy, mm, dd] = datePart.split('/').map((v) => parseInt(v, 10));
        if (Number.isNaN(yyyy) || Number.isNaN(mm) || Number.isNaN(dd)) return null;
        if (timePart) {
          const [HH = '0', MM = '0', SS = '0'] = timePart.split(':');
          return new Date(yyyy, mm - 1, dd, parseInt(HH, 10) || 0, parseInt(MM, 10) || 0, parseInt(SS, 10) || 0);
        }
        return new Date(yyyy, mm - 1, dd);
      } catch {
        return null;
      }
    }
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const mapBadgeByDerived = (derived: DerivedStatus) => {
    const map = {
      delivered: { className: 'bg-success text-white', label: 'Delivered' },
      pending: { className: 'bg-warning text-white', label: 'Pending' },
    } as const;
    return map[derived];
  };

  const handleExport = async () => {
    try {
      const exportRows = filteredNotes.map(dn => {
        const derived = mapBadgeByDerived(getDerivedStatus(dn)).label;
        const createdDate = dn.delivery_note_created_date || dn.created_at;
        const stocks = dn.delivery_note_stock || [];
        const totalDelivered = stocks.reduce((acc, s) => acc + (parseFloat(s.delivered_quantity || '0') || 0), 0);
        const totalBalance = stocks.reduce((acc, s) => acc + (parseFloat(s.balance_quantity || '0') || 0), 0);
        return {
          'Delivery Note No': dn.delivery_note_number,
          'Quotation No': dn.quotation_number,
          'Invoice No': dn.invoice_number,
          'Customer': dn.customer_name,
          'Contact': dn.contact_number,
          'Created Date': createdDate ? new Date(createdDate.replace(/\//g, '-')).toLocaleDateString() : '',
          'Status': derived,
          'Created By': dn.user_name,
          'Location': dn.location || '',
          'Items Count': stocks.length,
          'Delivered Qty Total': totalDelivered,
          'Balance Qty Total': totalBalance,
        };
      });
      await exportToExcel(exportRows, null, 'Delivery Notes');
      toast({ title: 'Success', description: 'Delivery notes exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  const columns: Column<APIDeliveryNote>[] = [
    {
      key: 'created_at',
      header: 'Date',
      render: (n) => {
        const d = n.delivery_note_created_date || n.created_at;
        const display = d ? new Date(d.replace(/\//g, '-')).toLocaleDateString() : '-';
        return (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{display}</span>
          </div>
        );
      }
    },
    {
      key: 'user_name',
      header: 'User Name',
      render: (n) => (
        <span className="text-sm">{n.user_name || 'N/A'}</span>
      )
    },
    { key: 'delivery_note_number', header: 'Delivery Note No', render: (n) => <span className="font-medium">{n.delivery_note_number}</span> },
    { key: 'quotation_number', header: 'Quotation No' },
    { key: 'invoice_number', header: 'Invoice No' },
    { key: 'customer_name', header: 'Customer Name' },
    { key: 'contact_number', header: 'Contact Number' },
    {
      key: 'delivery_note_status',
      header: 'Status',
      render: (n) => {
        const derived = mapBadgeByDerived(getDerivedStatus(n));
        return <Badge className={`justify-center ${derived.className}`}>{derived.label}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (n) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton icon={Eye} tooltip="View Details" color="purple" onClick={(e) => { e?.stopPropagation?.(); setSelectedDeliveryNote(n); }} />
          {getDerivedStatus(n) !== 'delivered' && (
            <ActionButton icon={PackageCheck} tooltip="Update Delivered Qty" color="yellow" onClick={(e) => { e?.stopPropagation?.(); setUpdateQtyNote(n); }} />
          )}
          <ActionButton
            icon={Download}
            tooltip="Download PDF"
            color="green"
            onClick={async (e) => {
              e?.stopPropagation?.();
              try {
                await generateDeliveryNotePDF(n as unknown as DeliveryNoteDetails, { openInNewTab: true });
                toast({ title: 'Success', description: 'Delivery Note PDF opened in a new tab', variant: 'success' });
              } catch (error: any) {
                toast({ title: 'Error', description: error?.message || 'Failed to generate PDF', variant: 'destructive' });
              }
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Notes</h1>
          <p className="text-muted-foreground">Track and manage product deliveries</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="show-my-data" className="text-sm font-medium">
              Show My Data Only
            </label>
            <Switch id="show-my-data" checked={showMyData} onCheckedChange={setShowMyData} className="data-[state=checked]:bg-primary" />
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {[
          {
            title: 'Total Deliveries',
            value: totalDeliveries,
            icon: Truck,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            title: 'Delivered',
            value: deliveredCount,
            icon: Truck,
            color: 'text-success',
            bgColor: 'bg-success/10',
          },
          // In Transit removed: treated under Pending per latest requirement
          {
            title: 'Pending',
            value: pendingCount,
            icon: Truck,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Table Card with unified header actions */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Delivery Notes</CardTitle>
              <CardDescription>{filteredNotes.length} delivery notes</CardDescription>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredNotes.map((n) => ({
              ...n,
              searchableText: [
                n.delivery_note_number,
                n.quotation_number,
                n.invoice_number,
                n.customer_name,
                n.contact_number,
              ]
                .filter(Boolean)
                .join(' '),
            }))}
            columns={columns}
            searchKey="searchableText"
            searchPlaceholder="Search delivery notes by number, quotation, invoice, or customer..."
            onRowSelect={setSelectedIds}
            loading={isLoading}
            emptyMessage="No delivery notes available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      <DeliveryNoteFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onClearFilters={() => setFilters({ status: null, fromDate: null, toDate: null })}
      />

      <DeliveryNoteDetailsModal
        isOpen={!!selectedDeliveryNote}
        onClose={() => setSelectedDeliveryNote(null)}
        deliveryNote={selectedDeliveryNote}
      />

      <DeliveryQtyUpdateModal
        isOpen={!!updateQtyNote}
        onClose={() => setUpdateQtyNote(null)}
        deliveryNote={updateQtyNote}
        onUpdated={async () => {
          try {
            const resp = await getDeliveryNotes();
            if (resp.success && Array.isArray(resp.data)) {
              const list = resp.data as APIDeliveryNote[];
              setDeliveryNotes(list);
            }
          } catch {}
        }}
      />
    </div>
  );
};