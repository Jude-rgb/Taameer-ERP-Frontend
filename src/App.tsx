import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory/products" element={<Products />} />
            <Route path="inventory/purchase-orders" element={<PurchaseOrders />} />
            <Route path="inventory/stock" element={<StockManagement />} />
            <Route path="sales/quotations" element={<Quotations />} />
            <Route path="sales/invoices" element={<Invoices />} />
            <Route path="sales/delivery-notes" element={<DeliveryNotes />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
