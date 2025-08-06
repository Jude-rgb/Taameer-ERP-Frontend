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

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { theme } = useThemeStore();
  const [showMyData, setShowMyData] = useState(false);
  
  // Zustand stores
  const { 
    quotationSummary, 
    fetchQuotationSummary, 
    isLoading: quotationLoading 
  } = useQuotationStore();
  
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
  const currentUserId = showMyData ? storedUser?.id : null;
  
  // Calculate KPIs from real data
  const totalSales = getTotalSales(currentUserId);
  const totalInvoices = invoices.length;
  const outstandingPayments = getOutstandingPayments(currentUserId);
  const lowStockItems = dummyProducts.filter(product => product.stock <= product.minStock).length;
  
  // Get real data for charts
  const salesTrends = getSalesTrends(currentUserId, 'monthly');
  const invoiceStatusData = getInvoiceStatusBreakdown(currentUserId) as {
    done: number;
    pending: number;
    partially: number;
    overdue: number;
  };
  const recentInvoices = getRecentInvoices(currentUserId);
  
  // Updated KPI cards with proper dark mode support and contrast ratios
  const kpiCards = [
    {
      title: 'Total Sales',
      value: formatOMRCurrency(totalSales),
      change: invoiceLoading ? 'Loading...' : 'From invoices',
      trend: 'up',
      icon: Receipt,
      // Dark mode: blue-600 (#2563eb), Light mode: blue-500
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-br from-blue-600 to-blue-700' 
        : 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-white',
      subtitleColor: 'text-white/75'
    },
    {
      title: 'Total Quotations',
      value: quotationSummary.total_number_of_quotations.toString(),
      change: quotationLoading ? 'Loading...' : 'Total count',
      trend: 'up',
      icon: Quote,
      // Dark mode: purple-600 (#7c3aed), Light mode: purple-500
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
        : 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-white',
      subtitleColor: 'text-white/75'
    },
    {
      title: 'Outstanding Payments',
      value: formatOMRCurrency(outstandingPayments),
      change: 'Pending amounts',
      trend: 'down',
      icon: AlertTriangle,
      // Dark mode: red-600 (#dc2626), Light mode: red-500
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-br from-red-600 to-red-700' 
        : 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-white',
      subtitleColor: 'text-white/75'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      change: 'Needs attention',
      trend: 'warning',
      icon: Package,
      // Dark mode: pink-600 (#db2777), Light mode: pink-500
      gradient: theme === 'dark' 
        ? 'bg-gradient-to-br from-pink-600 to-pink-700' 
        : 'bg-gradient-to-br from-pink-500 to-pink-600',
      textColor: 'text-white',
      subtitleColor: 'text-white/75'
    }
  ];

  const quickActions = [
    { title: 'Create Quotation', icon: Quote, color: 'bg-gradient-primary', description: 'New quote for customers' },
    { title: 'Add Product', icon: Package, color: 'bg-gradient-success', description: 'Expand inventory' },
    { title: 'View Reports', icon: BarChart, color: 'bg-gradient-warning', description: 'Business analytics' },
    { title: 'Manage Users', icon: Users, color: 'bg-gradient-teal', description: 'Team management' },
  ];

  // Function to capitalize status
  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch quotation summary
        const userId = showMyData ? storedUser?.id : null;
        await fetchQuotationSummary(userId);
        
        // Fetch invoices
        await fetchInvoices();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchDashboardData();
  }, [showMyData, fetchQuotationSummary, fetchInvoices, toast, storedUser?.id]);

  // Handle My Data toggle
  const handleMyDataToggle = async () => {
    const newShowMyData = !showMyData;
    setShowMyData(newShowMyData);
    
    try {
      const userId = newShowMyData ? storedUser?.id : null;
      await fetchQuotationSummary(userId);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch quotation data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="show-my-data" className="text-sm font-medium">
              Show My Data Only
            </label>
            <Switch
              id="show-my-data"
              checked={showMyData}
              onCheckedChange={handleMyDataToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((card, index) => (
          <motion.div key={card.title} variants={item}>
            <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 ${card.gradient} ${card.textColor} group cursor-pointer hover:brightness-110`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-white">
                  {card.title}
                </CardTitle>
                <motion.div 
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <card.icon className="h-5 w-5 text-white" />
                </motion.div>
              </CardHeader>
              
              <CardContent className="relative">
                <motion.div 
                  className="text-3xl font-bold mb-2 text-white"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {card.value}
                </motion.div>
                <div className="flex items-center space-x-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {card.trend === 'up' && <TrendingUp className="h-4 w-4 text-white" />}
                  {card.trend === 'down' && <TrendingDown className="h-4 w-4 text-white" />}
                  {card.trend === 'warning' && <AlertTriangle className="h-4 w-4 text-white" />}
                  <span>{card.change}</span>
                </div>
              </CardContent>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse transition-all duration-700" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <Card className="border-0 bg-card hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Sales Trends</CardTitle>
                <CardDescription>
                  Performance over the last 6 months 
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart 
                  data={salesTrends} 
                  period="monthly"
                  isLoading={invoiceLoading}
                />
              </CardContent>
            </Card>

            <Card className="border-0 bg-card hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
                <CardDescription>
                  Best performing by units sold (monthly)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductChart 
                  data={getTopProducts(currentUserId)} 
                  monthlyData={getTopProductsByMonth(currentUserId)}
                  isLoading={invoiceLoading}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>
                  Latest transactions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Recent Invoices & Stats */}
        <div className="space-y-6">
          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Invoices
                </CardTitle>
                <CardDescription>
                  Latest 5 invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentInvoices 
                  invoices={recentInvoices} 
                  isLoading={invoiceLoading}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Invoice Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Invoice Status</CardTitle>
                <CardDescription>
                  Current status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoiceStatusChart 
                  data={invoiceStatusData}
                  isLoading={invoiceLoading}
                />
                
                {/* Status Legend */}
                <div className="mt-6 space-y-3">
                  {Object.entries(invoiceStatusData || {}).map(([status, count]) => (
                    count > 0 && (
                      <motion.div 
                        key={status} 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'done' ? 'bg-green-500' :
                            status === 'pending' ? 'bg-yellow-500' :
                            status === 'partially' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="text-sm font-medium capitalize">{capitalizeStatus(status)}</span>
                        </div>
                        <Badge variant="outline" className="bg-muted/50">
                          {count}
                        </Badge>
                      </motion.div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className={`border-0 ${action.color} text-white cursor-pointer transition-all duration-300 hover:shadow-2xl group overflow-hidden relative hover:brightness-110`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              
              <CardContent className="p-6 relative">
                <motion.div
                  className="flex items-center gap-3 mb-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold">{action.title}</h3>
                </motion.div>
                <p className="text-sm opacity-90">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};