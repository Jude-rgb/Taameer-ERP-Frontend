// Dummy data for the application

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  image: string;
  description: string;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
  creditLimit: number;
  balance: number;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  issueDate: Date;
  items: InvoiceItem[];
  notes?: string;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  discount: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  amount: number;
  validUntil: Date;
  createdAt: Date;
  items: InvoiceItem[];
  notes?: string;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  discount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Received' | 'Cancelled';
  amount: number;
  orderDate: Date;
  expectedDate: Date;
  items: POItem[];
  notes?: string;
}

export interface POItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  receivedQuantity: number;
}

export interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  customerId: string;
  customerName: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  totalItems: number;
  deliveryDate: Date;
  createdAt: Date;
  items: DeliveryItem[];
  notes?: string;
}

export interface DeliveryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  deliveredQuantity: number;
}

// Dummy Products
export const dummyProducts: Product[] = [
  {
    id: '1',
    sku: 'STL-ROD-10MM',
    name: 'Steel Rod 10mm',
    category: 'Steel Products',
    price: 12.5,
    stock: 250,
    minStock: 50,
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150&h=150&fit=crop',
    description: 'High-grade steel rod 10mm diameter',
    supplier: 'Oman Steel Company',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    sku: 'CEM-BAG-50KG',
    name: 'Cement Bag 50kg',
    category: 'Cement',
    price: 3.2,
    stock: 150,
    minStock: 30,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&h=150&fit=crop',
    description: 'Portland cement 50kg bags',
    supplier: 'Gulf Cement Industries',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '3',
    sku: 'BLK-CON-200',
    name: 'Concrete Block 200mm',
    category: 'Blocks',
    price: 1.8,
    stock: 5,
    minStock: 100,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=150&h=150&fit=crop',
    description: 'Standard concrete blocks 200mm',
    supplier: 'Al-Bina Block Factory',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '4',
    sku: 'WIRE-GAL-2MM',
    name: 'Galvanized Wire 2mm',
    category: 'Wire Products',
    price: 8.5,
    stock: 75,
    minStock: 20,
    image: 'https://images.unsplash.com/photo-1609840214419-5c6d5ac3b98b?w=150&h=150&fit=crop',
    description: 'Galvanized steel wire 2mm gauge',
    supplier: 'Wire Tech LLC',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-30'),
  },
];

// Dummy Customers
export const dummyCustomers: Customer[] = [
  {
    id: '1',
    name: 'Al-Rashid Trading LLC',
    email: 'info@alrashidtrading.om',
    phone: '+968 2123 4567',
    address: 'Building 45, Street 12, Industrial Area',
    city: 'Muscat',
    country: 'Oman',
    taxNumber: 'OM1234567890',
    creditLimit: 10000,
    balance: 2500,
    createdAt: new Date('2023-06-15'),
  },
  {
    id: '2',
    name: 'Al-Zahra Construction',
    email: 'projects@alzahra.om',
    phone: '+968 2987 6543',
    address: 'Plot 78, Industrial Zone',
    city: 'Sohar',
    country: 'Oman',
    taxNumber: 'OM9876543210',
    creditLimit: 25000,
    balance: 8750,
    createdAt: new Date('2023-08-22'),
  },
  {
    id: '3',
    name: 'Gulf Hardware Stores',
    email: 'orders@gulfhardware.om',
    phone: '+968 2456 7890',
    address: 'Commercial Complex, Main Road',
    city: 'Nizwa',
    country: 'Oman',
    creditLimit: 15000,
    balance: 0,
    createdAt: new Date('2023-09-10'),
  },
];

// Dummy Invoices
export const dummyInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customerName: 'Al-Rashid Trading LLC',
    status: 'Paid',
    amount: 156.25,
    paidAmount: 156.25,
    remainingAmount: 0,
    dueDate: new Date('2024-02-15'),
    issueDate: new Date('2024-01-15'),
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Steel Rod 10mm',
        quantity: 10,
        unitPrice: 12.5,
        total: 125,
      },
      {
        id: '2',
        productId: '2',
        productName: 'Cement Bag 50kg',
        quantity: 5,
        unitPrice: 3.2,
        total: 16,
      },
    ],
    taxRate: 0.05,
    taxAmount: 7.05,
    subtotal: 141,
    discount: 0,
    notes: 'Payment terms: 30 days',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '2',
    customerName: 'Al-Zahra Construction',
    status: 'Overdue',
    amount: 875,
    paidAmount: 0,
    remainingAmount: 875,
    dueDate: new Date('2024-01-20'),
    issueDate: new Date('2023-12-20'),
    items: [
      {
        id: '3',
        productId: '3',
        productName: 'Concrete Block 200mm',
        quantity: 500,
        unitPrice: 1.8,
        total: 900,
      },
    ],
    taxRate: 0.05,
    taxAmount: 42.86,
    subtotal: 832.14,
    discount: 25,
  },
];

// Dummy Quotations
export const dummyQuotations: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QUO-2024-001',
    customerId: '3',
    customerName: 'Gulf Hardware Stores',
    status: 'Sent',
    amount: 425,
    validUntil: new Date('2024-02-28'),
    createdAt: new Date('2024-02-01'),
    items: [
      {
        id: '1',
        productId: '4',
        productName: 'Galvanized Wire 2mm',
        quantity: 50,
        unitPrice: 8.5,
        total: 425,
      },
    ],
    taxRate: 0.05,
    taxAmount: 20.24,
    subtotal: 404.76,
    discount: 0,
    notes: 'Bulk order discount available for orders over 100 units',
  },
];

// Dummy Purchase Orders
export const dummyPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplier: 'Oman Steel Company',
    status: 'Confirmed',
    amount: 3125,
    orderDate: new Date('2024-02-01'),
    expectedDate: new Date('2024-02-15'),
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Steel Rod 10mm',
        quantity: 250,
        unitPrice: 12.5,
        total: 3125,
        receivedQuantity: 0,
      },
    ],
    notes: 'Urgent order for ongoing project',
  },
];

// Dummy Delivery Notes
export const dummyDeliveryNotes: DeliveryNote[] = [
  {
    id: '1',
    deliveryNumber: 'DN-2024-001',
    customerId: '1',
    customerName: 'Al-Rashid Trading LLC',
    status: 'Delivered',
    totalItems: 15,
    deliveryDate: new Date('2024-01-16'),
    createdAt: new Date('2024-01-15'),
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Steel Rod 10mm',
        quantity: 10,
        deliveredQuantity: 10,
      },
      {
        id: '2',
        productId: '2',
        productName: 'Cement Bag 50kg',
        quantity: 5,
        deliveredQuantity: 5,
      },
    ],
    notes: 'Delivered successfully to warehouse',
  },
];

// Sales Report Data
export const salesReportData = {
  daily: [
    { date: '2024-02-01', sales: 1250 },
    { date: '2024-02-02', sales: 875 },
    { date: '2024-02-03', sales: 2100 },
    { date: '2024-02-04', sales: 950 },
    { date: '2024-02-05', sales: 1800 },
  ],
  monthly: [
    { month: 'Jan 2024', sales: 25000 },
    { month: 'Feb 2024', sales: 18500 },
    { month: 'Mar 2024', sales: 32000 },
    { month: 'Apr 2024', sales: 28000 },
  ],
  topProducts: [
    { name: 'Steel Rod 10mm', sales: 15000 },
    { name: 'Cement Bag 50kg', sales: 8500 },
    { name: 'Concrete Block 200mm', sales: 6200 },
    { name: 'Galvanized Wire 2mm', sales: 4100 },
  ],
};
export const formatOMRCurrency = (amount: number): string => {
  return `${amount.toFixed(3)} OMR`;
};
