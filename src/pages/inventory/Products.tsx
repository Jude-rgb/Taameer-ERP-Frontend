import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Edit, Trash2, Package, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/ui/data-table';
import { ActionButton } from '@/components/ui/action-button';
import { ProductModal } from '@/components/modals/ProductModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { ProductDetailsModal } from '@/components/modals/ProductDetailsModal';
import ProductFilter from '@/components/ProductFilter';
import { useProductStore } from '@/store/useProductStore';
import { useToast } from '@/hooks/use-toast';
import { exportProductsToExcel } from '@/utils/exportToExcel';

// Product interface based on API response
interface Product {
  id: number;
  product_code: string;
  product_brand: string;
  product_name: string;
  description: string;
  product_image?: string;
  total_stock: number;
  warehouse_stock: number;
  sold_stock: number;
  unit_price_shop: number;
  unit_price_customer: number;
  product_weight: string;
  product_unit: string;
  cost_price: number | null;
  first_stock_updated_date: string | null;
  updated_at: string;
  created_at: string;
}

export const Products = () => {
  const { products, fetchProducts, deleteProduct, isLoading, error, getUniqueBrands } = useProductStore();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number | string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: null, brand: null });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchProducts();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch products",
          variant: "destructive",
        });
      }
    };

    loadProducts();
  }, [fetchProducts, toast]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

         // Apply status filter
     if (filters.status) {
       filtered = filtered.filter(product => {
         const stock = Number(product.warehouse_stock) || 0;
         switch (filters.status) {
           case 'in_stock':
             return stock > 0;
           case 'out_of_stock':
             return stock <= 0;
           default:
             return true;
         }
       });
     }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.product_brand === filters.brand
      );
    }

    return filtered;
  }, [products, filters]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleRowClick = (product: Product) => {
    setSelectedProductForDetails(product);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsEdit = (product: Product) => {
    setIsDetailsModalOpen(false);
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDetailsDelete = (product: Product) => {
    setIsDetailsModalOpen(false);
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "success",
        });
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete product",
          variant: "destructive",
        });
      }
    }
  };

  const getStockStatus = (product: Product) => {
    const stock = Number(product.warehouse_stock) || 0;
    if (stock > 0) {
      return { label: 'In Stock', variant: 'default' as const, className: 'bg-green-500 text-white' };
    } else if (stock <= 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, className: 'bg-red-500 text-white' };
    }
  };

  const getStockDuration = (product: Product) => {
    if (!product.updated_at || Number(product.warehouse_stock) <= 0) return '-';
    
    const updatedDate = new Date(product.updated_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - updatedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const formatCurrency = (amount: number) => {
    return `OMR ${Number(amount || 0).toFixed(3)}`;
  };

  const handleExportToExcel = async () => {
    try {
      await exportProductsToExcel(filteredProducts);
      toast({
        title: "Success",
        description: "Products exported to Excel successfully",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export products",
        variant: "destructive",
      });
    }
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({ status: null, brand: null });
  };

  // Table columns definition
  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product',
      width: 'w-64',
      render: (product) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-lg flex-shrink-0">
            <AvatarImage 
              src={product.product_image} 
              alt={product.product_name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg">
              <Package className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
                     <div className="min-w-0 flex-1">
             <div className="font-medium text-foreground truncate max-w-[400px]" title={product.product_name}>
               {product.product_name}
             </div>
             <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={product.product_brand}>
               {product.product_brand}
             </div>
             <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]" title={product.product_code}>
               {product.product_code}
             </div>
           </div>
        </div>
      )
    },
    {
      key: 'total_stock',
      header: 'Total Stock',
      render: (product) => (
        <span className="font-semibold">
          {product.total_stock || 0}
        </span>
      )
    },
    {
      key: 'warehouse_stock',
      header: 'Warehouse Stock',
      render: (product) => (
        <span className="font-semibold">
          {product.warehouse_stock || 0}
        </span>
      )
    },
    {
      key: 'sold_stock',
      header: 'Sold Stock',
      render: (product) => (
        <span className="font-semibold">
          {product.sold_stock || 0}
        </span>
      )
    },
    {
      key: 'unit_price_shop',
      header: 'Unit Price (Shop)',
      render: (product) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(product.unit_price_shop)}
        </span>
      )
    },
    {
      key: 'unit_price_customer',
      header: 'Unit Price (Customer)',
      render: (product) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(product.unit_price_customer)}
        </span>
      )
    },
         {
       key: 'status',
       header: 'Status',
       render: (product) => {
         const status = getStockStatus(product);
         return (
                       <Badge className={`${status.className} text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap min-h-[20px] flex items-center justify-center`}>
              {status.label}
            </Badge>
         );
       }
     },
         {
       key: 'stock_duration',
       header: 'Stock Duration',
       render: (product) => (
                 <div className="text-xs text-muted-foreground">
          {getStockDuration(product)}
        </div>
       )
     },
    {
      key: 'actions',
      header: 'Actions',
      width: 'text-right',
      render: (product) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            icon={Edit}
            tooltip="Edit Product"
            color="blue"
            onClick={(e) => {
              e.stopPropagation();
              handleEditProduct(product);
            }}
          />
          <ActionButton
            icon={Trash2}
            tooltip="Delete Product"
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(product);
            }}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Products</h1>
        <p className="text-muted-foreground">
          Manage your inventory and product catalog
        </p>
      </motion.div>

      {/* Active Filters Display */}
      {(filters.status || filters.brand) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.status && (
            <Badge variant="secondary">
              Status: {filters.status.replace('_', ' ')}
            </Badge>
          )}
          {filters.brand && (
            <Badge variant="secondary">
              Brand: {filters.brand}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </motion.div>
      )}

      {/* Products Table */}
      <Card className="border-0 bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="mb-2">Product Inventory</CardTitle>
              <CardDescription>
                {filteredProducts.length} products in your catalog
                {filters.status || filters.brand ? ' (filtered)' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button 
                variant="outline"
                onClick={handleExportToExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button 
                onClick={handleAddProduct}
                className="bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredProducts}
            columns={columns}
            searchKey="product_name"
            searchPlaceholder="Search products by brand, code, or name..."
            onRowSelect={setSelectedProductIds}
            onRowClick={handleRowClick}
            emptyMessage="No products available."
            idKey="id"
            pageSizeOptions={[10, 20, 50, 100]}
            defaultPageSize={10}
          />
        </CardContent>
      </Card>

      {/* Filter Modal */}
      <ProductFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        availableBrands={getUniqueBrands()}
      />

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
      />

             <DeleteConfirmModal
         isOpen={isDeleteModalOpen}
         onClose={() => setIsDeleteModalOpen(false)}
         onConfirm={confirmDelete}
         title="Delete Product"
         description={`Are you sure you want to delete "${productToDelete?.product_name}"? This action cannot be undone.`}
       />

       <ProductDetailsModal
         isOpen={isDetailsModalOpen}
         onClose={() => setIsDetailsModalOpen(false)}
         product={selectedProductForDetails}
         onEdit={handleDetailsEdit}
         onDelete={handleDetailsDelete}
       />
    </div>
  );
};