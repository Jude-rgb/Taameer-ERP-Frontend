import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { dummyDeliveryNotes, DeliveryNote } from '@/data/dummyData';
import { format } from 'date-fns';

export const DeliveryNotes = () => {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(dummyDeliveryNotes);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeliveryNotes = deliveryNotes.filter(note =>
    note.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Notes</h1>
          <p className="text-muted-foreground">
            Track and manage product deliveries
          </p>
        </div>
        <Button className="bg-gradient-primary hover:scale-105 transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Create Delivery Note
        </Button>
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by delivery number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </motion.div>

      {/* Delivery Notes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>Delivery Notes</CardTitle>
            <CardDescription>
              {filteredDeliveryNotes.length} delivery notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveryNotes.map((note, index) => (
                    <motion.tr
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {note.deliveryNumber}
                      </TableCell>
                      <TableCell>{note.customerName}</TableCell>
                      <TableCell>
                        {format(note.createdAt, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(note.deliveryDate, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{note.totalItems} items</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(note.status)}
                          className={`${getStatusColor(note.status)} text-white`}
                        >
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};