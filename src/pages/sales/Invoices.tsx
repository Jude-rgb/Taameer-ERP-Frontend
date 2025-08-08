import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Edit, Trash2, Eye, DollarSign, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { dummyInvoices, formatOMRCurrency, Invoice } from '@/data/dummyData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/utils/exportToExcel';

export const Invoices = () => {
  const [invoices] = useState<Invoice[]>(dummyInvoices);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const { toast } = useToast();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Partially Paid':
        return 'outline';
      case 'Unpaid':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-success';
      case 'Partially Paid':
        return 'bg-warning';
      case 'Unpaid':
        return 'bg-secondary';
      case 'Overdue':
        return 'bg-destructive';
      default:
        return 'bg-secondary';
    }
  };

  const handleExport = async () => {
    try {
      const exportRows = invoices.map(inv => ({
        'Invoice No': inv.invoiceNumber,
        'Customer': inv.customerName,
        'Issue Date': format(inv.issueDate, 'yyyy-MM-dd'),
        'Due Date': format(inv.dueDate, 'yyyy-MM-dd'),
        'Amount': formatOMRCurrency(inv.amount),
        'Paid': formatOMRCurrency(inv.paidAmount),
        'Status': inv.status,
      }));
      await exportToExcel(exportRows, null, 'Invoices');
      toast({ title: 'Success', description: 'Invoices exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  const columns: Column<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice Number', render: (i) => <span className="font-medium">{i.invoiceNumber}</span> },
    { key: 'customerName', header: 'Customer' },
    { key: 'issueDate', header: 'Issue Date', render: (i) => format(i.issueDate, 'MMM dd, yyyy') },
    { key: 'dueDate', header: 'Due Date', render: (i) => format(i.dueDate, 'MMM dd, yyyy') },
    { key: 'amount', header: 'Amount', render: (i) => <span className="font-semibold">{formatOMRCurrency(i.amount)}</span> },
    { key: 'paidAmount', header: 'Paid', render: (i) => formatOMRCurrency(i.paidAmount) },
    { key: 'status', header: 'Status', render: (i) => <Badge variant={getStatusVariant(i.status)} className={`${getStatusColor(i.status)} text-white`}>{i.status}</Badge> },
    { key: 'actions', header: 'Actions', width: 'text-right', render: (i) => (
      <div className="flex items-center justify-end gap-2">
        <ActionButton icon={Eye} tooltip="View" color="blue" onClick={(e) => e?.stopPropagation()} />
        <ActionButton icon={Edit} tooltip="Edit" color="green" onClick={(e) => e?.stopPropagation()} />
        <ActionButton icon={Trash2} tooltip="Delete" color="red" onClick={(e) => e?.stopPropagation()} />
      </div>
    ) },
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
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Create and manage customer invoices</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-4"
      >
        {[
          {
            title: 'Total Invoices',
            value: invoices.length,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            title: 'Paid Amount',
            value: formatOMRCurrency(invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)),
            color: 'text-success',
            bgColor: 'bg-success/10',
          },
          {
            title: 'Outstanding',
            value: formatOMRCurrency(invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0)),
            color: 'text-warning',
            bgColor: 'bg-warning/10',
          },
          {
            title: 'Overdue',
            value: invoices.filter(inv => inv.status === 'Overdue').length,
            color: 'text-destructive',
            bgColor: 'bg-destructive/10',
          },
        ].map((stat, index) => (
          <Card key={stat.title} className="border-0 bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <DollarSign className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Table Card with unified header actions */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Customer Invoices</CardTitle>
              <CardDescription>{invoices.length} invoices</CardDescription>
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
              <Button className="bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-200" onClick={() => toast({ title: 'Create Invoice', description: 'Creation flow coming soon', variant: 'info' })}>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={invoices}
            columns={columns}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoices by number or customer..."
            onRowSelect={setSelectedIds}
            emptyMessage="No invoices available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
};