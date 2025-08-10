import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Eye, Download, Edit, FileText, Quote, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/utils/exportToExcel';
import { formatDate, formatOMRCurrency, getInvoiceStatusColor } from '@/utils/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import QuotationFilter, { type QuotationFilters } from '@/components/QuotationFilter';
import { fetchQuotations } from '@/services/dashboard.js';
import { createInvoiceFromQuotation } from '@/services/invoice.js';
import GenerateInvoiceConfirmModal from '@/components/modals/GenerateInvoiceConfirmModal';
import QuotationDetailsModal from '@/components/modals/QuotationDetailsModal';
import QuotationCreateModal from '@/components/modals/QuotationCreateModal';
import QuotationUpdateModal from '@/components/modals/QuotationUpdateModal';
import { generateQuotationPDF } from '@/components/pdf';
import { useAuthStore } from '@/store/useAuthStore';
import { canPerform, normalizeRole } from '@/lib/rbac';

interface APIQuotation {
  id: number;
  quotation_number: string;
  quatation_type: string; // note: API typo kept
  customer_name: string;
  contact_number: string;
  location?: string | null;
  user_id?: number | string | null;
  user_name?: string | null;
  created_at: string; // ISO
  sub_quotation_total?: string | null;
  quotation_vat?: string | null;
  quotation_total?: string | null;
  discount_price?: string | null;
  discount_comment?: string | null;
  invoice_status?: string | null; // pending | done | partially
  invoice_number?: string | null;
  invoice_created_date?: string | null;
  quotation_stock?: Array<{
    id: number;
    quotation_id: number;
    product_code?: string | null;
    product_name?: string | null;
    quantity?: string | null;
    unit_price?: string | null;
    total?: string | null;
  }>;
  searchableText?: string; // computed
}

const parseNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

export const Quotations = () => {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<APIQuotation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<QuotationFilters>({ invoiceStatus: null, quotationType: null, fromDate: null, toDate: null });
  const [showMyData, setShowMyData] = useState<boolean>(false);
  const [confirmQuotation, setConfirmQuotation] = useState<APIQuotation | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<any | null>(null);
  const [viewQuotation, setViewQuotation] = useState<APIQuotation | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editQuotation, setEditQuotation] = useState<APIQuotation | null>(null);

  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);
  const canCreate = canPerform(role, 'quotation.create');
  const canUpdate = canPerform(role, 'quotation.update');

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
    const load = async () => {
      setIsLoading(true);
      try {
        const resp = await fetchQuotations();
        if (resp.success && Array.isArray(resp.data)) {
          setQuotations(resp.data as APIQuotation[]);
        } else {
          setQuotations([]);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to fetch quotations', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  const matchesFilters = (q: APIQuotation): boolean => {
    if (showMyData && currentUserId != null) {
      if (String(q.user_id) !== String(currentUserId)) return false;
    }
    if (filters.invoiceStatus) {
      if ((q.invoice_status || '').toLowerCase() !== filters.invoiceStatus) return false;
    }
    if (filters.quotationType) {
      if ((q.quatation_type || '').toLowerCase() !== filters.quotationType.toLowerCase()) return false;
    }
    if (filters.fromDate || filters.toDate) {
      const d = q.created_at ? new Date(q.created_at) : null;
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

  const filteredQuotations = useMemo(() => quotations.filter(matchesFilters), [quotations, filters, showMyData, currentUserId]);

  const isMarketingOfficer = storedUser?.role === 'Marketing_Officer';

  const handleExport = async () => {
    try {
      const exportRows = filteredQuotations.map((q) => ({
        'Date': q.created_at ? formatDate(q.created_at) : '',
        'Quotation No': q.quotation_number,
        'Created By': q.user_name || '',
        'Quotation Type': q.quatation_type || '',
        'Customer Name': q.customer_name,
        'Contact Number': q.contact_number,
        'Sub Total': Number(parseNumber(q.sub_quotation_total).toFixed(3)),
        'Discount Amount': Number(parseNumber(q.discount_price).toFixed(3)),
        'VAT': Number(parseNumber(q.quotation_vat).toFixed(3)),
        'Grand Total': Number(parseNumber(q.quotation_total).toFixed(3)),
        'Invoice Status': (q.invoice_status || '').toUpperCase(),
        'Invoice No': q.invoice_number || '',
      }));
      await exportToExcel(exportRows, null, 'Quotations');
      toast({ title: 'Success', description: 'Quotations exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  const columns: Column<APIQuotation>[] = [
    {
      key: 'created_at',
      header: 'Date',
      render: (q) => (
        <div className="text-sm text-muted-foreground">{q.created_at ? formatDate(q.created_at) : '-'}</div>
      ),
    },
    {
      key: 'quotation_number',
      header: 'Quotation No',
      render: (q) => <span className="font-medium">{q.quotation_number}</span>,
    },
    { key: 'user_name', header: 'Created By', render: (q) => <span>{q.user_name || '-'}</span> },
    { key: 'quatation_type', header: 'Quotation Type' },
    { key: 'customer_name', header: 'Customer Name' },
    { key: 'contact_number', header: 'Contact Number' },
    {
      key: 'quotation_total',
      header: 'Total Value',
      render: (q) => <span className="font-semibold">{formatOMRCurrency(parseNumber(q.quotation_total))}</span>,
    },
    {
      key: 'discount_price',
      header: 'Discount',
      render: (q) => {
        const discount = parseNumber(q.discount_price);
        const comment = q.discount_comment || '';
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
      key: 'invoice_status',
      header: 'Invoice Status',
      render: (q) => (
        <Badge className={`justify-center ${getInvoiceStatusColor(q.invoice_status || '')}`}>
          {(q.invoice_status || 'N/A').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (q) => {
        const invCreated = (q.invoice_status || '').toLowerCase() === 'done' || (q.invoice_number && q.invoice_number !== 'pending');
        return (
          <div className="flex items-center justify-end gap-2">
            <ActionButton
              icon={Eye}
              tooltip="View Quotation"
              color="blue"
              onClick={(e) => {
                e?.stopPropagation?.();
                setViewQuotation(q);
              }}
            />
            {!invCreated && canUpdate && (
              <ActionButton
                icon={Edit}
                tooltip="Edit Quotation"
                color="green"
                onClick={(e) => {
                  e?.stopPropagation?.();
                  setEditQuotation(q);
                }}
              />
            )}
            {!invCreated && (
              <ActionButton
                icon={FileText}
                tooltip="Generate Invoice"
                color="yellow"
                onClick={(e) => {
                  e?.stopPropagation?.();
                  setCreateError(null);
                  setConfirmQuotation(q);
                }}
              />
            )}
            <ActionButton
              icon={Download}
              tooltip="Download PDF"
              color="purple"
              onClick={(e) => {
                e?.stopPropagation?.();
                generateQuotationPDF({
                  id: q.id,
                  quotation_number: q.quotation_number,
                  created_at: q.created_at,
                  quatation_type: q.quatation_type,
                  user_name: q.user_name,
                  customer_name: q.customer_name,
                  contact_number: q.contact_number,
                  location: q.location,
                  sub_quotation_total: q.sub_quotation_total,
                  discount_price: q.discount_price,
                  quotation_vat: q.quotation_vat,
                  delivery_charges: (q as any).delivery_charges,
                  quotation_total: q.quotation_total,
                  invoice_status: q.invoice_status,
                  invoice_number: q.invoice_number,
                  quotation_stock: q.quotation_stock as any,
                }, { openInNewTab: true });
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">Create and manage customer quotations</p>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          { title: 'Total Quotations', value: filteredQuotations.length, color: 'text-primary', bgColor: 'bg-primary/10', icon: Quote },
          { title: 'Grand Total', value: formatOMRCurrency(filteredQuotations.reduce((s, q) => s + parseNumber(q.quotation_total), 0)), color: 'text-success', bgColor: 'bg-success/10', icon: DollarSign },
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
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Customer Quotations</CardTitle>
              <CardDescription>{filteredQuotations.length} quotations</CardDescription>
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
              {canCreate && (
                <Button className="bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-200" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quotation
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredQuotations.map((q) => ({
              ...q,
              searchableText: [q.quotation_number, q.customer_name, q.contact_number, q.user_name, q.quatation_type].filter(Boolean).join(' '),
            }))}
            columns={columns}
            searchKey="searchableText"
            searchPlaceholder="Search quotations by number, customer, or user..."
            onRowSelect={setSelectedIds}
            loading={isLoading}
            emptyMessage="No quotations available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      <QuotationFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onClearFilters={() => setFilters({ invoiceStatus: null, quotationType: null, fromDate: null, toDate: null })}
      />

      <GenerateInvoiceConfirmModal
        open={!!confirmQuotation}
        onClose={() => { if (!isCreating) { setConfirmQuotation(null); setCreateError(null); } }}
        isLoading={isCreating}
        quotation={confirmQuotation}
        errorPayload={createError}
        onConfirm={async () => {
          if (!confirmQuotation || isCreating) return;
          setIsCreating(true);
          setCreateError(null);
          try {
            const q = confirmQuotation;
            const stored = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
            const payload: any = {
              customer_name: q.customer_name,
              contact_number: q.contact_number,
              location: q.location || '',
              project: (q as any).project || '',
              sub_quotation_total: q.sub_quotation_total,
              quotation_vat: q.quotation_vat,
              quotation_total: q.quotation_total,
              delivery: (q as any).delivery || 'no',
              delivery_charges: (q as any).delivery_charges || 0,
              discount_price: q.discount_price || '0',
              user_id: stored?.id,
              user_name: stored?.full_name || stored?.user_name || 'User',
              quotation_number: q.quotation_number,
              invoice_product_data: (q.quotation_stock || []).map((it) => ({
                id: it.id,
                quotation_id: q.id,
                product_code: it.product_code,
                product_name: it.product_name,
                quantity: it.quantity,
                unit_price: it.unit_price,
                stock_befor_update: (it as any).stock_befor_update,
                stock_after_update: (it as any).stock_after_update,
                total: it.total,
                created_at: (it as any).created_at,
              })),
            };
            const resp = await createInvoiceFromQuotation(payload);
            if (resp?.status === 'error' && resp?.errors?.type === 'insufficient_stock') {
              setCreateError(resp);
              return;
            }
            if (resp?.status === 'Success') {
              toast({ title: 'Success', description: 'Invoice created successfully.', variant: 'success' });
              setConfirmQuotation(null);
              setCreateError(null);
              // refresh quotations (invoice status will update)
              try {
                const r = await fetchQuotations();
                if (r.success && Array.isArray(r.data)) setQuotations(r.data as APIQuotation[]);
              } catch {}
              return;
            }
            // Unexpected shape
            toast({ title: 'Error', description: resp?.message || 'Failed to create invoice', variant: 'destructive' });
            setConfirmQuotation(null);
          } catch (error: any) {
            toast({ title: 'Error', description: error?.message || 'Failed to create invoice', variant: 'destructive' });
            setConfirmQuotation(null);
          } finally {
            setIsCreating(false);
          }
        }}
      />

      <QuotationDetailsModal
        isOpen={!!viewQuotation}
        onClose={() => setViewQuotation(null)}
        quotation={viewQuotation}
      />

      {canCreate && (
        <QuotationCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={async () => {
            try {
              const r = await fetchQuotations();
              if (r.success && Array.isArray(r.data)) setQuotations(r.data as APIQuotation[]);
            } catch {}
          }}
        />
      )}

      {canUpdate && (
        <QuotationUpdateModal
          isOpen={!!editQuotation}
          onClose={() => setEditQuotation(null)}
          quotation={editQuotation}
          onSuccess={async () => {
            try {
              const r = await fetchQuotations();
              if (r.success && Array.isArray(r.data)) setQuotations(r.data as APIQuotation[]);
            } catch {}
          }}
        />
      )}
    </div>
  );
};