import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Receipt, FileText, AlertTriangle, Package, Users, Calendar, BarChart, Quote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SalesChart } from '@/components/charts/SalesChart';
import { ProductChart } from '@/components/charts/ProductChart';
import { InvoiceStatusChart } from '@/components/charts/InvoiceStatusChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { RecentInvoices } from '@/components/dashboard/RecentInvoices';
import { dummyProducts } from '@/data/dummyData';
import { formatOMRCurrency } from '@/utils/formatters';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuotationStore } from '@/store/useQuotationStore';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useToast } from '@/hooks/use-toast';
import { useThemeStore } from '@/store/useThemeStore';

const container = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0
  }
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { toast } = useToast();
  const [showMyData, setShowMyData] = useState(false);
  
  // Test quotation store first
  console.log('About to use quotation store...');
  const { 
    quotationSummary, 
    fetchQuotationSummary, 
    isLoading: quotationLoading 
  } = useQuotationStore();
  console.log('Quotation store used successfully');
  
  // Test invoice store next
  console.log('About to use invoice store...');
  const { 
    invoices, 
    fetchInvoices, 
    getRecentInvoices, 
    getTotalSales,
    getOutstandingPayments,
    getInvoiceStatusBreakdown,
    getSalesTrends,
    getTopProducts,
    getTopProductsByMonth,
    isLoading: invoiceLoading 
  } = useInvoiceStore();
  console.log('Invoice store used successfully');

  // Get user from localStorage for the greeting
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };

  const storedUser = getUserFromStorage();
  const displayName = storedUser?.full_name || user?.full_name || 'Admin';
  
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Dashboard is working - stores loaded successfully!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Quotations: {quotationSummary.total_number_of_quotations} | 
          Invoices: {invoices.length} | 
          Theme: {theme}
        </p>
      </div>
    </div>
  );
};

export { Dashboard };