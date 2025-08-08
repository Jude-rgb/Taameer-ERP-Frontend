import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProductStore } from '@/store/useProductStore';
import { formatOMRCurrency } from '@/utils/formatters';
import { useGrnStore } from '@/store/useGrnStore';
import { DataTable, Column } from '@/components/ui/data-table';
import { GrnDetailsModal } from '@/components/modals/GrnDetailsModal';
import { GrnCreateModal } from '@/components/modals/GrnCreateModal';
import { Button } from '@/components/ui/button';

export const StockManagement = () => {
  const { products, fetchProducts, isLoading } = useProductStore();
  const { grns, fetchGRNs } = useGrnStore();
  const [selectedGrn, setSelectedGrn] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    // Load products and GRNs from API on mount
    fetchProducts();
    fetchGRNs();
  }, [fetchProducts, fetchGRNs]);

  const LOW_STOCK_THRESHOLD = 10; // Adjustable threshold for low stock

  const {
    totalProducts,
    lowStockCount,
    outOfStockProducts,
    stockValueCustomer,
    stockValueShop,
  } = useMemo(() => {
    const parseNumber = (value: any) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    const total = products?.length || 0;

    const outOfStock = (products || []).filter((p: any) => parseNumber(p.warehouse_stock) <= 0);

    const lowStock = (products || []).filter((p: any) => {
      const ws = parseNumber(p.warehouse_stock);
      return ws > 0 && ws <= LOW_STOCK_THRESHOLD;
    });

    let customerTotal = 0;
    let shopTotal = 0;
    (products || []).forEach((p: any) => {
      const ws = parseNumber(p.warehouse_stock);
      if (ws > 0) {
        customerTotal += ws * parseNumber(p.unit_price_customer);
        shopTotal += ws * parseNumber(p.unit_price_shop);
      }
    });

    return {
      totalProducts: total,
      lowStockCount: lowStock.length,
      outOfStockProducts: outOfStock,
      stockValueCustomer: customerTotal,
      stockValueShop: shopTotal,
    };
  }, [products]);

  const stockStats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts.length,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Stock Value (Customer Price)',
      value: formatOMRCurrency(stockValueCustomer),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Stock Value (Shop Price)',
      value: formatOMRCurrency(stockValueShop),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="p-6 space-y-6">
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
                    <p className="text-2xl font-bold">{stat.value as any}</p>
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
        <Card className="border-0 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Out of Stock Products
            </CardTitle>
            <CardDescription>
              Products that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!outOfStockProducts || outOfStockProducts.length === 0) ? (
              <p className="text-center text-muted-foreground py-8">No out of stock products</p>
            ) : (
              <div className="h-[420px] overflow-y-auto pr-2 space-y-3">
                {outOfStockProducts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 dark:bg-gray-900/30">
                    <div>
                      <h4 className="font-medium">{p.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {p.product_code} • {p.product_brand} • {p.product_weight} {p.product_unit}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-center px-3 py-1">Out of Stock</Badge>
                  </div>
                ))}
              </div>
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
            {(grns || [])
              .slice(0, 5)
              .flatMap((g: any) => (g.grn_stock || []).map((s: any) => ({
                product: s.product_name,
                code: s.product_code,
                qty: Number(s.quantity) || 0,
                date: g.created_at,
                before: s.stock_befor_update,
                after: s.stock_after_update,
              })))
              .slice(0, 5)
              .map((mv, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{mv.product}</h4>
                    <p className="text-sm text-muted-foreground">{mv.code} • {new Date(mv.date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success text-white">+{mv.qty}</Badge>
                      <Badge variant="outline" className="hidden sm:inline-flex">{mv.before} → {mv.after}</Badge>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* GRN Table */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Goods Recvied Notes</CardTitle>
              <CardDescription>Search by GRN number, product code, or product name</CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary-hover">Create GRN</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={(grns || []).map((g: any) => ({
              id: g.id,
              grn_number: g.grn_number,
              created_at: g.created_at,
              searchableText: `${g.grn_number} ${(g.grn_stock || []).map((s: any) => `${s.product_code} ${s.product_name}`).join(' ')}`,
              raw: g,
            }))}
            columns={[
              { key: 'grn_number', header: 'GRN Number', render: (row: any) => <span className="font-medium">{row.grn_number}</span> },
              { key: 'created_at', header: 'Date', render: (row: any) => new Date(row.created_at).toLocaleString() },
            ] as Column<any>[]}
            searchKey="searchableText"
            searchPlaceholder="Search by GRN number, product code, or product name..."
            onRowClick={(row: any) => setSelectedGrn(row.raw)}
            emptyMessage="No GRNs available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      <GrnDetailsModal isOpen={!!selectedGrn} onClose={() => setSelectedGrn(null)} grn={selectedGrn} />
      <GrnCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => fetchGRNs()} />
    </div>
  );
};