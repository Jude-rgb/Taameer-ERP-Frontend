import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Edit, Trash2, Eye, Truck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { dummyDeliveryNotes, DeliveryNote } from '@/data/dummyData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/utils/exportToExcel';

export const DeliveryNotes = () => {
  const [deliveryNotes] = useState<DeliveryNote[]>(dummyDeliveryNotes);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const { toast } = useToast();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'In Transit':
        return 'outline';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success';
      case 'In Transit':
        return 'bg-info';
      case 'Pending':
        return 'bg-warning';
      case 'Cancelled':
        return 'bg-destructive';
      default:
        return 'bg-secondary';
    }
  };

  const handleExport = async () => {
    try {
      const exportRows = deliveryNotes.map(dn => ({
        'Delivery No': dn.deliveryNumber,
        'Customer': dn.customerName,
        'Created Date': format(dn.createdAt, 'yyyy-MM-dd'),
        'Delivery Date': format(dn.deliveryDate, 'yyyy-MM-dd'),
        'Total Items': dn.totalItems,
        'Status': dn.status,
      }));
      await exportToExcel(exportRows, null, 'Delivery Notes');
      toast({ title: 'Success', description: 'Delivery notes exported to Excel', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to export', variant: 'destructive' });
    }
  };

  const columns: Column<DeliveryNote>[] = [
    { key: 'deliveryNumber', header: 'Delivery Number', render: (n) => <span className="font-medium">{n.deliveryNumber}</span> },
    { key: 'customerName', header: 'Customer' },
    { key: 'createdAt', header: 'Created Date', render: (n) => format(n.createdAt, 'MMM dd, yyyy') },
    { key: 'deliveryDate', header: 'Delivery Date', render: (n) => format(n.deliveryDate, 'MMM dd, yyyy') },
    { key: 'totalItems', header: 'Total Items' },
    { key: 'status', header: 'Status', render: (n) => <Badge variant={getStatusVariant(n.status)} className={`${getStatusColor(n.status)} text-white`}>{n.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (n) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Delivery Notes</h1>
          <p className="text-muted-foreground">Track and manage product deliveries</p>
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
            title: 'Total Deliveries',
            value: deliveryNotes.length,
            icon: Truck,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            title: 'Delivered',
            value: deliveryNotes.filter(dn => dn.status === 'Delivered').length,
            icon: Truck,
            color: 'text-success',
            bgColor: 'bg-success/10',
          },
          {
            title: 'In Transit',
            value: deliveryNotes.filter(dn => dn.status === 'In Transit').length,
            icon: Truck,
            color: 'text-info',
            bgColor: 'bg-info/10',
          },
          {
            title: 'Pending',
            value: deliveryNotes.filter(dn => dn.status === 'Pending').length,
            icon: Truck,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
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
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
              <CardTitle className="mb-2">Delivery Notes</CardTitle>
              <CardDescription>{deliveryNotes.length} delivery notes</CardDescription>
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
              <Button className="bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-200" onClick={() => toast({ title: 'Create Delivery Note', description: 'Creation flow coming soon', variant: 'info' })}>
                <Plus className="mr-2 h-4 w-4" />
                Create Delivery Note
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={deliveryNotes}
            columns={columns}
            searchKey="deliveryNumber"
            searchPlaceholder="Search delivery notes by number or customer..."
            onRowSelect={setSelectedIds}
            emptyMessage="No delivery notes available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
};