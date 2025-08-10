import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Eye, Download, DollarSign, Calendar, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/utils/exportToExcel';
import { formatDate, formatOMRCurrency, getInvoiceStatusColor } from '@/utils/formatters';
import { Switch } from '@/components/ui/switch';
import InvoiceFilter, { type InvoiceFilters } from '@/components/InvoiceFilter';
import { fetchInvoices as fetchInvoicesApi } from '@/services/dashboard.js';
import { createDeliveryNote } from '@/services/deliveryNote.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import InvoiceDetailsModal from '@/components/modals/InvoiceDetailsModal';
import { getInvoiceDetails } from '@/services/dashboard.js';

interface APIInvoicePayment {
  id: number | string;
  paid_amount: string | null;
  balance_amount: string | null;
  payment_date?: string | null;
}

interface APIQuotationRef {
  id: number | string;
  quotation_number: string;
  invoice_created_date?: string | null;
  discount_price?: string | null;
  discount_comment?: string | null;
}

interface APIInvoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  contact_number: string;
  quotation_number: string;
  created_at: string; // ISO
  quotation_total: string | null;
  discount_price?: string | null;
  refund_amount?: string | null;
  invoice_payment_status?: string | null; // pending | partially | done | overdue
  delivery_note_status?: string | null; // created | pending | completed
  user_id?: number | string | null;
  user_name?: string | null;
  invoice_payment?: APIInvoicePayment[];
  quotation?: APIQuotationRef | null;
  // computed
  searchableText?: string;
}

const parseNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

export const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<APIInvoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>({ paymentStatus: null, deliveryStatus: null, fromDate: null, toDate: null });
  const [showMyData, setShowMyData] = useState<boolean>(false);

  const storedUser = (() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();
  const currentUserId = storedUser?.id;
  const currentUserName = storedUser?.full_name || storedUser?.user_name || 'User';

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const resp = await fetchInvoicesApi();
        if (resp.success && Array.isArray(resp.data)) {
          setInvoices(resp.data as APIInvoice[]);
        } else {
          setInvoices([]);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to fetch invoices', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoices();
  }, [toast]);

  const getLastPayment = (inv: APIInvoice): APIInvoicePayment | null => {
    const list = inv.invoice_payment || [];
    if (!list.length) return null;
    return list[list.length - 1];
  };

  const getBalanceAmount = (inv: APIInvoice): number => {
    const last = getLastPayment(inv);
    if (last && last.balance_amount != null) return parseNumber(last.balance_amount);
    return parseNumber(inv.quotation_total);
  };

  const getPaidAmount = (inv: APIInvoice): number => {
    const list = inv.invoice_payment || [];
    if (!list.length) return 0;
    return list.reduce((acc, p) => acc + parseNumber(p.paid_amount), 0);
  };

  const matchesFilters = (inv: APIInvoice): boolean => {
    // My data filter
    if (showMyData && currentUserId != null) {
      if (String(inv.user_id) !== String(currentUserId)) return false;
    }

    // Payment status
    if (filters.paymentStatus) {
      if ((inv.invoice_payment_status || '').toLowerCase() !== filters.paymentStatus) return false;
    }

    // Delivery status
    if (filters.deliveryStatus) {
      if ((inv.delivery_note_status || '').toLowerCase() !== filters.deliveryStatus) return false;
    }

    // Date range
    if (filters.fromDate || filters.toDate) {
      const d = inv.created_at ? new Date(inv.created_at) : null;
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

  const filteredInvoices = useMemo(() => invoices.filter(matchesFilters), [invoices, filters, showMyData, currentUserId]);

  const isMarketingOfficer = storedUser?.role === 'Marketing_Officer';

  // KPI values
  const totalInvoices = filteredInvoices.length;
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + getPaidAmount(inv), 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + getBalanceAmount(inv), 0);

  const handleExport = async () => {
    try {
      const exportRows = filteredInvoices.map((inv) => ({
        'Created Date': inv.created_at ? formatDate(inv.created_at) : '',
        'Quotation No': inv.quotation_number,
        'Invoice No': inv.invoice_number,
        'Customer Name': inv.customer_name,
        'Customer Number': inv.contact_number,
        'Grand Total': Number(parseNumber(inv.quotation_total).toFixed(3)),
        'Balance Amount': Number(getBalanceAmount(inv).toFixed(3)),
        'Discount Price': Number(parseNumber(inv.discount_price ?? inv.quotation?.discount_price ?? 0).toFixed(3)),
        'Refund Amount': Number(parseNumber(inv.refund_amount).toFixed(3)),
        'Payment Status': (inv.invoice_payment_status || '').toUpperCase(),
        'Delivery Status': (inv.delivery_note_status || '').toUpperCase(),
      }));
      await exportToExcel(exportRows, null, 'Invoices');
      toast({ title: 'Success', description: 'Invoices exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  const columns: Column<APIInvoice>[] = [
    {
      key: 'created_at',
      header: 'Date',
      render: (i) => (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span>{i.created_at ? formatDate(i.created_at) : '-'}</span>
        </div>
      ),
    },
    { key: 'quotation_number', header: 'Quotation No', render: (i) => <span className="font-medium">{i.quotation_number}</span> },
    { key: 'invoice_number', header: 'Invoice No', render: (i) => <span className="font-medium">{i.invoice_number}</span> },
    { key: 'customer_name', header: 'Customer Name' },
    { key: 'contact_number', header: 'Customer Number' },
    {
      key: 'quotation_total',
      header: 'Grand Total',
      render: (i) => <span className="font-semibold">{formatOMRCurrency(parseNumber(i.quotation_total))}</span>,
    },
    {
      key: 'balance_amount',
      header: 'Balance Amount',
      render: (i) => formatOMRCurrency(getBalanceAmount(i)),
    },
    {
      key: 'discount_price',
      header: 'Discount',
      render: (i) => {
        const discount = parseNumber(i.discount_price ?? i.quotation?.discount_price ?? 0);
        const comment = i.quotation?.discount_comment || '';
        if (!discount) return <span>OMR 0.000</span>;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted cursor-help">{formatOMRCurrency(discount)}</span>
              </TooltipTrigger>
              {comment ? (
                <TooltipContent>
                  <div className="max-w-xs text-sm">{comment}</div>
                </TooltipContent>
              ) : null}
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'refund_amount',
      header: 'Refund',
      render: (i) => formatOMRCurrency(parseNumber(i.refund_amount)),
    },
    {
      key: 'invoice_payment_status',
      header: 'Payment Status',
      render: (i) => (
        <Badge className={`justify-center ${getInvoiceStatusColor(i.invoice_payment_status || '')}`}>
          {(i.invoice_payment_status || 'N/A').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'delivery_note_status',
      header: 'Delivery Status',
      render: (i) => {
        const status = (i.delivery_note_status || 'pending').toLowerCase();
        const map: Record<string, string> = {
          created: 'bg-success text-white',
          completed: 'bg-success text-white',
          pending: 'bg-warning text-white',
        };
        const cls = map[status] || 'bg-muted text-muted-foreground';
        const label = status.charAt(0).toUpperCase() + status.slice(1);
        return <Badge className={`justify-center ${cls}`}>{label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (i) => (
        <div className="flex items-center justify-end gap-2">
          {(i.delivery_note_status || '').toLowerCase() !== 'created' && (
            <ActionButton
              icon={Truck}
              tooltip="Generate Delivery Note"
              color="yellow"
              onClick={async (e) => {
                e?.stopPropagation?.();
                // Open confirm modal
                setConfirmInvoice(i);
              }}
            />
          )}
          <ActionButton
            icon={Eye}
            tooltip="View Invoice"
            color="blue"
            onClick={(e) => {
              e?.stopPropagation?.();
              setViewInvoice(i);
            }}
          />
        </div>
      ),
    },
  ];

  // Confirm modal state
  const [confirmInvoice, setConfirmInvoice] = useState<APIInvoice | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [viewInvoice, setViewInvoice] = useState<APIInvoice | null>(null);

  const buildCreatePayload = (inv: APIInvoice) => {
    const payload: any = {
      quotation_number: inv.quotation_number,
      invoice_number: inv.invoice_number,
      created_at: inv.created_at,
      invoice_stock: (inv as any).invoice_stock || [],
      sub_quotation_total: (inv as any).sub_quotation_total,
      quotation_vat: (inv as any).quotation_vat,
      quotation_total: (inv as any).quotation_total,
      customer_name: inv.customer_name,
      contact_number: inv.contact_number,
      location: (inv as any).location || '',
      invoice_id: inv.id,
      user_id: currentUserId,
      user_name: currentUserName,
    };
    return payload;
  };

  const handleConfirmCreate = async () => {
    if (!confirmInvoice) return;
    setIsCreating(true);
    try {
      const payload = buildCreatePayload(confirmInvoice);
      const resp = await createDeliveryNote(payload);
      if (resp.success) {
        toast({ title: 'Success', description: 'Delivery note created.', variant: 'success' });
        setConfirmInvoice(null);
        // refresh invoices to update delivery status
        const r = await fetchInvoicesApi();
        if (r.success && Array.isArray(r.data)) setInvoices(r.data as APIInvoice[]);
      } else {
        throw new Error(resp.message || 'Create failed');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create delivery note', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Create and manage customer invoices</p>
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

      {/* Summary Cards (styled like Delivery Notes) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          { title: 'Total Invoices', value: totalInvoices, color: 'text-primary', bgColor: 'bg-primary/10' },
          { title: 'Paid Amount', value: formatOMRCurrency(totalPaid), color: 'text-success', bgColor: 'bg-success/10' },
          { title: 'Outstanding', value: formatOMRCurrency(totalOutstanding), color: 'text-warning', bgColor: 'bg-warning/10' },
        ].map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }}>
            <Card className="border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <DollarSign className={`h-6 w-6 ${stat.color}`} />
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
              <CardTitle className="mb-2">Customer Invoices</CardTitle>
              <CardDescription>{filteredInvoices.length} invoices</CardDescription>
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
            data={filteredInvoices.map((i) => ({
              ...i,
              searchableText: [i.invoice_number, i.quotation_number, i.customer_name, i.contact_number].filter(Boolean).join(' '),
            }))}
            columns={columns}
            searchKey="searchableText"
            searchPlaceholder="Search invoices by invoice, quotation, or customer..."
            onRowSelect={setSelectedIds}
            loading={isLoading}
            emptyMessage="No invoices available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      <InvoiceFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onClearFilters={() => setFilters({ paymentStatus: null, deliveryStatus: null, fromDate: null, toDate: null })}
      />

      {/* Confirm Generate Delivery Note */}
      <DeleteConfirmModal
        isOpen={!!confirmInvoice}
        onClose={() => !isCreating && setConfirmInvoice(null)}
        onConfirm={handleConfirmCreate}
        title="Generate Delivery Note?"
        description={confirmInvoice ? `Create a delivery note for invoice ${confirmInvoice.invoice_number}?` : ''}
        isLoading={isCreating}
        loadingText="Generating..."
        confirmLabel="Generate"
        confirmVariant="default"
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
        fetchDetails={async (id) => {
          const resp = await getInvoiceDetails(id);
          // also refresh table when details are fetched after payment add
          try {
            const r = await fetchInvoicesApi();
            if (r.success && Array.isArray(r.data)) setInvoices(r.data as APIInvoice[]);
          } catch {}
          return resp;
        }}
      />
    </div>
  );
};