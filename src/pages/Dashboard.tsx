import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertTriangle, Package, Users, Calendar, BarChart, Zap, Shield, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SalesChart } from '@/components/charts/SalesChart';
import { ProductChart } from '@/components/charts/ProductChart';
import { InvoiceStatusChart } from '@/components/charts/InvoiceStatusChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { formatOMRCurrency, dummyProducts, dummyInvoices } from '@/data/dummyData';
import { useAuthStore } from '@/store/useAuthStore';
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
  
  // Calculate KPIs
  const totalSales = dummyInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalInvoices = dummyInvoices.length;
  const outstandingPayments = dummyInvoices.filter(inv => inv.status !== 'Paid').reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const lowStockItems = dummyProducts.filter(product => product.stock <= product.minStock).length;
  
  const kpiCards = [
    {
      title: 'Total Sales',
      value: formatOMRCurrency(totalSales),
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'bg-gradient-primary',
      textColor: 'text-white'
    },
    {
      title: 'Total Invoices',
      value: totalInvoices.toString(),
      change: '+8 this month',
      trend: 'up',
      icon: FileText,
      gradient: 'bg-gradient-blue',
      textColor: 'text-white'
    },
    {
      title: 'Outstanding Payments',
      value: formatOMRCurrency(outstandingPayments),
      change: '-5.2%',
      trend: 'down',
      icon: AlertTriangle,
      gradient: 'bg-gradient-orange',
      textColor: 'text-white'
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      change: 'Needs attention',
      trend: 'warning',
      icon: Package,
      gradient: 'bg-gradient-pink',
      textColor: 'text-white'
    }
  ];

  const quickActions = [
    { title: 'Create Quotation', icon: FileText, color: 'bg-gradient-primary', description: 'New quote for customers' },
    { title: 'Add Product', icon: Package, color: 'bg-gradient-success', description: 'Expand inventory' },
    { title: 'View Reports', icon: BarChart, color: 'bg-gradient-warning', description: 'Business analytics' },
    { title: 'Manage Users', icon: Users, color: 'bg-gradient-teal', description: 'Team management' },
  ];

  const otherFunctions = [
    { title: 'Optimization', icon: Zap, color: 'bg-accent-orange', progress: 87 },
    { title: 'Security', icon: Shield, color: 'bg-accent-teal', progress: 95 },
    { title: 'Performance', icon: Target, color: 'bg-accent-pink', progress: 72 },
  ];
  return (
    <div className="space-y-6 p-6">
      {/* Hero Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-primary text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1 
                  className="text-4xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Hello, {user?.name || 'Admin'}!
                </motion.h1>
                <motion.p 
                  className="text-xl opacity-90 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Welcome back to your dashboard
                </motion.p>
                <motion.p 
                  className="text-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </motion.p>
              </div>
              
              <motion.div
                className="hidden lg:block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-16 h-16 text-white/80" />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
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
            <Card className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 ${card.gradient} ${card.textColor} group cursor-pointer`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-white/90">
                  {card.title}
                </CardTitle>
                <motion.div 
                  className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
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
                <div className="flex items-center space-x-2 text-sm text-white/80">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <Card className="border-0 bg-white/50 backdrop-blur-lg shadow-card hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Sales Trends</CardTitle>
                <CardDescription>
                  Performance over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart />
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 backdrop-blur-lg shadow-card hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
                <CardDescription>
                  Best performing by sales volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductChart />
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="border-0 bg-white/50 backdrop-blur-lg shadow-card">
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

        {/* Right Column - Other Functions & Stats */}
        <div className="space-y-6">
          {/* Other Functions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="border-0 bg-white/50 backdrop-blur-lg shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Other Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {otherFunctions.map((func, index) => (
                  <motion.div
                    key={func.title}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${func.color}`}>
                        <func.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{func.title}</p>
                        <p className="text-sm text-muted-foreground">{func.progress}%</p>
                      </div>
                    </div>
                    <div className="w-16">
                      <Progress value={func.progress} className="h-2" />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Invoice Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="border-0 bg-white/50 backdrop-blur-lg shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Invoice Status</CardTitle>
                <CardDescription>
                  Current status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoiceStatusChart />
                
                {/* Status Legend */}
                <div className="mt-6 space-y-3">
                  {[
                    { label: 'Paid', count: 1, color: 'bg-success' },
                    { label: 'Overdue', count: 1, color: 'bg-destructive' },
                    { label: 'Pending', count: 0, color: 'bg-warning' }
                  ].map((status) => (
                    <motion.div 
                      key={status.label} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/30 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status.color}`} />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
                      <Badge variant="outline" className="bg-white/50">
                        {status.count}
                      </Badge>
                    </motion.div>
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
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
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
            <Card className={`border-0 ${action.color} text-white cursor-pointer transition-all duration-300 hover:shadow-2xl group overflow-hidden relative`}>
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