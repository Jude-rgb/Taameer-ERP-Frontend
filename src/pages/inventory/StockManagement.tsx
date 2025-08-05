import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { dummyProducts, formatOMRCurrency } from '@/data/dummyData';

export const StockManagement = () => {
  const totalProducts = dummyProducts.length;
  const lowStockProducts = dummyProducts.filter(p => p.stock <= p.minStock);
  const totalStockValue = dummyProducts.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const outOfStockProducts = dummyProducts.filter(p => p.stock === 0);

  const stockStats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts.length,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Stock Value',
      value: formatOMRCurrency(totalStockValue),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
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
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <p className="text-muted-foreground">
          Monitor your inventory levels and stock alerts
        </p>
      </motion.div>

      {/* Stock Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {stockStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 bg-gradient-card hover:shadow-lg transition-all duration-300">
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
          </motion.div>
        ))}
      </motion.div>

      {/* Low Stock Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card className="border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Products that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No low stock alerts
              </p>
            ) : (
              lowStockProducts.map((product) => {
                const stockPercentage = (product.stock / product.minStock) * 100;
                return (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {product.stock} / {product.minStock}
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(stockPercentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Stock Movement */}
        <Card className="border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle>Recent Stock Movement</CardTitle>
            <CardDescription>
              Latest inventory transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                product: 'Steel Rod 10mm',
                type: 'IN',
                quantity: 50,
                date: '2 hours ago',
                reference: 'PO-2024-001',
              },
              {
                product: 'Cement Bag 50kg',
                type: 'OUT',
                quantity: 25,
                date: '4 hours ago',
                reference: 'INV-2024-001',
              },
              {
                product: 'Concrete Block 200mm',
                type: 'OUT',
                quantity: 100,
                date: '1 day ago',
                reference: 'INV-2024-002',
              },
            ].map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{movement.product}</h4>
                  <p className="text-sm text-muted-foreground">
                    {movement.reference} • {movement.date}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={movement.type === 'IN' ? 'default' : 'secondary'}
                    className={movement.type === 'IN' ? 'bg-success' : 'bg-warning'}
                  >
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};