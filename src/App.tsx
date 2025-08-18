import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/inventory/Products";
import { PurchaseOrders } from "./pages/inventory/PurchaseOrders";
import { StockManagement } from "./pages/inventory/StockManagement";
import { Quotations } from "./pages/sales/Quotations";
import { Invoices } from "./pages/sales/Invoices";
import { DeliveryNotes } from "./pages/sales/DeliveryNotes";
import { Customers } from "./pages/Customers";
import { Reports } from "./pages/Reports";
import { UserManagement } from "./pages/UserManagement";
import { SystemSettings } from "./pages/SystemSettings";
import { Suppliers } from "./pages/Suppliers";
import { Documentation } from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminOnlyRoute } from "./components/auth/AdminOnlyRoute";
import { useAuthStore } from '@/store/useAuthStore';
import { canAccessModule, normalizeRole, MODULES } from '@/lib/rbac';

const queryClient = new QueryClient();

const RoleAware = ({ children }: { children: React.ReactNode }) => {
  // Force mount to allow ProtectedRoute to redirect; per-route checks handled there
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory/products" element={<RoleAware><Products /></RoleAware>} />
          <Route path="inventory/purchase-orders" element={<RoleAware><PurchaseOrders /></RoleAware>} />
          <Route path="inventory/stock" element={<RoleAware><StockManagement /></RoleAware>} />
          <Route path="sales/quotations" element={<RoleAware><Quotations /></RoleAware>} />
          <Route path="sales/invoices" element={<RoleAware><Invoices /></RoleAware>} />
          <Route path="sales/delivery-notes" element={<RoleAware><DeliveryNotes /></RoleAware>} />
          <Route path="customers" element={<RoleAware><Customers /></RoleAware>} />
          <Route path="suppliers" element={<RoleAware><Suppliers /></RoleAware>} />
          <Route path="reports" element={<RoleAware><Reports /></RoleAware>} />
          <Route path="documentation" element={<AdminOnlyRoute><Documentation /></AdminOnlyRoute>} />
          <Route path="users" element={<AdminOnlyRoute><UserManagement /></AdminOnlyRoute>} />
          <Route path="settings" element={<AdminOnlyRoute><SystemSettings /></AdminOnlyRoute>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
