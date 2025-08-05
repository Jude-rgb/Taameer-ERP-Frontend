import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SalesChart } from '@/components/charts/SalesChart';
import { ProductChart } from '@/components/charts/ProductChart';
import { InvoiceStatusChart } from '@/components/charts/InvoiceStatusChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { formatOMRCurrency, dummyProducts, dummyInvoices } from '@/data/dummyData';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Dashboard = () => {
  // Calculate KPIs
  const totalSales = dummyInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalInvoices = dummyInvoices.length;
  const outstandingPayments = dummyInvoices
    .filter(inv => inv.status !== 'Paid')
    .reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const lowStockItems = dummyProducts.filter(product => product.stock <= product.minStock).length;

  const kpiCards = [
    {
      title: 'Total Sales',
      value: formatOMRCurrency(totalSales),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Invoices',
      value: totalInvoices.toString(),
      change: '+8 this month',
      trend: 'up',
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Outstanding Payments',
      value: formatOMRCurrency(outstandingPayments),
      change: '-5.2%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      change: 'Needs attention',
      trend: 'warning',
      icon: Package,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your business performance.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((card, index) => (
          <motion.div key={card.title} variants={item}>
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-gradient-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {card.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                  {card.trend === 'down' && <TrendingDown className="h-3 w-3 text-success" />}
                  {card.trend === 'warning' && <AlertTriangle className="h-3 w-3 text-warning" />}
                  <span>{card.change}</span>
                </div>
              </CardContent>
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>Sales Trends</CardTitle>
            <CardDescription>
              Your sales performance over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best performing products by sales volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductChart />
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2 border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>
              Current invoice status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceStatusChart />
            
            {/* Status Legend */}
            <div className="mt-4 space-y-2">
              {[
                { label: 'Paid', count: 1, color: 'bg-success' },
                { label: 'Overdue', count: 1, color: 'bg-destructive' },
                { label: 'Pending', count: 0, color: 'bg-warning' },
              ].map((status) => (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span className="text-sm">{status.label}</span>
                  </div>
                  <Badge variant="outline">{status.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="border-0 bg-gradient-primary text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Create New Invoice</h3>
            <p className="text-sm opacity-90">Generate a new invoice for your customers</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-success text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Add New Product</h3>
            <p className="text-sm opacity-90">Expand your inventory with new products</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-warning text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Generate Report</h3>
            <p className="text-sm opacity-90">View detailed business analytics</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};