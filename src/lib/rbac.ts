// Role-based access control utilities

export type Role = 'ADMIN' | 'Marketing_Officer' | 'Accounts' | 'Warehouse';

// Canonical module ids used across app
export const MODULES = {
  Dashboard: 'dashboard',
  Products: 'inventory/products',
  PurchaseOrders: 'inventory/purchase-orders',
  Stock: 'inventory/stock',
  Quotations: 'sales/quotations',
  Invoices: 'sales/invoices',
  DeliveryNotes: 'sales/delivery-notes',
  Customers: 'customers',
  Suppliers: 'suppliers',
  Reports: 'reports',
  Users: 'users',
  Settings: 'settings',
} as const;

export type ModuleId = (typeof MODULES)[keyof typeof MODULES];

// Action ids used for per-page button level permissions
export type ActionId =
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'invoice.refund'
  | 'quotation.create'
  | 'quotation.update';

const ALL_MODULES: ModuleId[] = [
  MODULES.Dashboard,
  MODULES.Products,
  MODULES.PurchaseOrders,
  MODULES.Stock,
  MODULES.Quotations,
  MODULES.Invoices,
  MODULES.DeliveryNotes,
  MODULES.Customers,
  MODULES.Suppliers,
  MODULES.Reports,
  MODULES.Users,
  MODULES.Settings,
];

const ROLE_MODULES: Record<Role, ModuleId[]> = {
  ADMIN: ALL_MODULES,
  Marketing_Officer: ALL_MODULES.filter((m) =>
    ![
      MODULES.Settings, // system setup
      MODULES.Users, // user management
      MODULES.Reports, // reports
      MODULES.Suppliers, // suppliers
      MODULES.Stock, // stock management
      MODULES.PurchaseOrders, // purchase order
    ].includes(m)
  ),
  Warehouse: [MODULES.DeliveryNotes], // only delivery notes
  Accounts: ALL_MODULES.filter((m) =>
    ![
      MODULES.Settings, // system setup
      MODULES.Users, // user management
      MODULES.Products, // product module hidden
      MODULES.Stock, // stock management hidden
    ].includes(m)
  ),
};

const ROLE_ACTIONS_DENY: Record<Role, ActionId[]> = {
  ADMIN: [],
  Marketing_Officer: [
    'product.create',
    'product.update',
    'product.delete',
    'invoice.refund',
  ],
  Warehouse: [
    // Warehouse doesn't manage products/quotations in this app
    'product.create',
    'product.update',
    'product.delete',
    'invoice.refund',
    'quotation.create',
    'quotation.update',
  ],
  Accounts: [
    // As requested: no create/update quotation
    'quotation.create',
    'quotation.update',
    // Products module hidden entirely, but keep explicit denies for safety
    'product.create',
    'product.update',
    'product.delete',
  ],
};

export function normalizeRole(role: unknown): Role | null {
  if (role === 'ADMIN' || role === 'Marketing_Officer' || role === 'Accounts' || role === 'Warehouse') {
    return role;
  }
  return null;
}

export function getAllowedModules(role: Role | null | undefined): ModuleId[] {
  if (!role) return [];
  return ROLE_MODULES[role] || [];
}

export function canAccessModule(role: Role | null | undefined, moduleId: ModuleId): boolean {
  if (!role) return false;
  return getAllowedModules(role).includes(moduleId);
}

export function canPerform(role: Role | null | undefined, actionId: ActionId): boolean {
  if (!role) return false;
  return !(ROLE_ACTIONS_DENY[role] || []).includes(actionId);
}

// Convert a route path to a module id
export function pathToModuleId(pathname: string): ModuleId | null {
  const path = (pathname || '').trim();
  if (path === '/' || path === '' || path === '/dashboard') return MODULES.Dashboard;
  const cleaned = path.replace(/^\//, '');
  // Known routes map directly
  if ((ALL_MODULES as string[]).includes(cleaned)) return cleaned as ModuleId;
  // For any index routes under base path, attempt best-effort mapping
  if (cleaned.startsWith('inventory/')) {
    if (cleaned.includes('products')) return MODULES.Products;
    if (cleaned.includes('purchase-orders')) return MODULES.PurchaseOrders;
    if (cleaned.includes('stock')) return MODULES.Stock;
  }
  if (cleaned.startsWith('sales/')) {
    if (cleaned.includes('quotations')) return MODULES.Quotations;
    if (cleaned.includes('invoices')) return MODULES.Invoices;
    if (cleaned.includes('delivery-notes')) return MODULES.DeliveryNotes;
  }
  if (cleaned === 'customers') return MODULES.Customers;
  if (cleaned === 'suppliers') return MODULES.Suppliers;
  if (cleaned === 'reports') return MODULES.Reports;
  if (cleaned === 'users') return MODULES.Users;
  if (cleaned === 'settings') return MODULES.Settings;
  return null;
}


