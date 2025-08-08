import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Edit, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { dummyQuotations, formatOMRCurrency, Quotation } from '@/data/dummyData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/utils/exportToExcel';

export const Quotations = () => {
  const [quotations] = useState<Quotation[]>(dummyQuotations);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }> = {
      Accepted: { variant: 'default' },
      Sent: { variant: 'outline' },
      Draft: { variant: 'secondary' },
      Rejected: { variant: 'destructive' },
      Expired: { variant: 'destructive' },
    };
    const conf = map[status] || { variant: 'secondary' };
    return <Badge variant={conf.variant}>{status}</Badge>;
  };

  const handleExport = async () => {
    try {
      const exportRows = quotations.map(q => ({
        'Quotation No': q.quotationNumber,
        'Customer': q.customerName,
        'Created Date': format(q.createdAt, 'yyyy-MM-dd'),
        'Valid Until': format(q.validUntil, 'yyyy-MM-dd'),
        'Amount': formatOMRCurrency(q.amount),
        'Status': q.status,
      }));
      await exportToExcel(exportRows, null, 'Quotations');
      toast({ title: 'Success', description: 'Quotations exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  const columns: Column<Quotation>[] = [
    {
      key: 'quotationNumber',
      header: 'Quote Number',
      render: (q) => <span className="font-medium">{q.quotationNumber}</span>,
    },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (q) => format(q.createdAt, 'MMM dd, yyyy'),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (q) => format(q.validUntil, 'MMM dd, yyyy'),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (q) => <span className="font-semibold">{formatOMRCurrency(q.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (q) => getStatusBadge(q.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (q) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton icon={Eye} tooltip="View" color="blue" onClick={(e) => e?.stopPropagation()} />
          <ActionButton icon={Edit} tooltip="Edit" color="green" onClick={(e) => e?.stopPropagation()} />
          <ActionButton icon={Trash2} tooltip="Delete" color="red" onClick={(e) => e?.stopPropagation()} />
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
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">Create and manage customer quotations</p>
        </div>
      </motion.div>

      {/* Table Card with unified header actions */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Customer Quotations</CardTitle>
              <CardDescription>{quotations.length} quotations</CardDescription>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toast({ title: 'Filters', description: 'Filter options coming soon', variant: 'info' })} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button className="bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-200" onClick={() => toast({ title: 'Create Quotation', description: 'Creation flow coming soon', variant: 'info' })}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quotation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={quotations}
            columns={columns}
            searchKey="quotationNumber"
            searchPlaceholder="Search quotations by number or customer..."
            onRowSelect={setSelectedIds}
            emptyMessage="No quotations available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
};