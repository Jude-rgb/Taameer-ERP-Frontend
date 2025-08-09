import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Mail, Phone, MapPin, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  location: string;
  createdAt: string;
}

// Sample customer data (lorem ipsum placeholders)
const sampleCustomers: Customer[] = [
  { id: '1', name: 'Lorem Ipsum', email: 'lorem1@example.com', phone: '+968 9000 0001', company: 'Lorem Co.', status: 'active', totalOrders: 10, totalSpent: 1500, location: 'Muscat, Oman', createdAt: '2024-01-15' },
  { id: '2', name: 'Dolor Sit', email: 'lorem2@example.com', phone: '+968 9000 0002', company: 'Dolor Ltd.', status: 'active', totalOrders: 8, totalSpent: 980, location: 'Salalah, Oman', createdAt: '2024-02-20' },
  { id: '3', name: 'Amet Consectetur', email: 'lorem3@example.com', phone: '+968 9000 0003', company: 'Amet Group', status: 'inactive', totalOrders: 3, totalSpent: 450, location: 'Sohar, Oman', createdAt: '2024-03-10' },
  { id: '4', name: 'Adipiscing Elit', email: 'lorem4@example.com', phone: '+968 9000 0004', company: 'Adipiscing Solutions', status: 'active', totalOrders: 22, totalSpent: 3200, location: 'Nizwa, Oman', createdAt: '2024-01-05' },
  { id: '5', name: 'Sed Do', email: 'lorem5@example.com', phone: '+968 9000 0005', company: 'Sed Industries', status: 'active', totalOrders: 12, totalSpent: 2100, location: 'Sur, Oman', createdAt: '2024-02-28' }
];

export const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<number | string>>(new Set());
  const { toast } = useToast();

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    toast({
      title: 'Info',
      description: 'This feature will be available when API is fully implemented.',
      variant: 'info',
    });
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    toast({
      title: 'Info',
      description: 'This feature will be available when API is fully implemented.',
      variant: 'info',
    });
  };

  const confirmDelete = () => {};

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-500 text-white">Active</Badge>
    ) : (
      <Badge className="bg-gray-500 text-white">Inactive</Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `OMR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Table columns definition
  const columns: Column<Customer>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (customer) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-primary text-white font-medium">
              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{customer.name}</div>
            <div className="text-sm text-muted-foreground">{customer.company}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (customer) => (
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {customer.email}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {customer.phone}
          </div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (customer) => (
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {customer.location}
        </div>
      )
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (customer) => (
        <div className="text-sm">
          <div className="font-medium">{customer.totalOrders} orders</div>
          <div className="text-muted-foreground">{formatCurrency(customer.totalSpent)}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (customer) => getStatusBadge(customer.status)
    },
    {
      key: 'created',
      header: 'Created',
      render: (customer) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(customer.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (customer) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            icon={Edit}
            tooltip="Edit Customer"
            color="blue"
            onClick={() => handleEditCustomer(customer)}
          />
          <ActionButton
            icon={Trash2}
            tooltip="Delete Customer"
            color="red"
            onClick={() => handleDeleteCustomer(customer)}
          />
        </div>
      )
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database (This feature is coming soon)</p>
        </div>
        <Button
          className="bg-gradient-primary hover:scale-105 transition-all duration-200"
          onClick={() =>
            toast({
              title: 'Info',
              description: 'This feature will be available when API is fully implemented.',
              variant: 'info',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </motion.div>
      
      <Card className="border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <CardDescription>
            Manage customer information, orders, and communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={customers}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search customers by name, email, or company..."
            onRowSelect={setSelectedCustomerIds}
            emptyMessage="No customers available."
            idKey="id"
          />
        </CardContent>
      </Card>

      {/* Delete modal disabled until feature is implemented */}
    </div>
  );
};