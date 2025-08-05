import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemSettings {
  companyName: string;
  companySlogan: string;
  companyLogo: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  vatPercentage: number;
  currency: string;
  language: 'en' | 'ar';
}

interface RolePermissions {
  'Super Admin': string[];
  'Admin': string[];
  'Marketing Officer': string[];
  'Warehouse Officer': string[];
  'Accounts': string[];
}

interface SystemState {
  settings: SystemSettings;
  rolePermissions: RolePermissions;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  updateRolePermissions: (role: keyof RolePermissions, modules: string[]) => void;
  getAllowedModules: (role: string) => string[];
}

const defaultModules = [
  'dashboard',
  'inventory/products',
  'inventory/purchase-orders',
  'inventory/stock',
  'sales/quotations',
  'sales/invoices',
  'sales/delivery-notes',
  'customers',
  'reports',
  'users',
  'settings'
];

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      settings: {
        companyName: 'InvoicePro',
        companySlogan: 'Hardware & Material Management System',
        companyLogo: '',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
        vatPercentage: 5,
        currency: 'OMR',
        language: 'en',
      },
      rolePermissions: {
        'Super Admin': defaultModules,
        'Admin': defaultModules.filter(m => m !== 'users'),
        'Marketing Officer': ['dashboard', 'sales/quotations', 'sales/invoices', 'customers', 'reports'],
        'Warehouse Officer': ['dashboard', 'inventory/products', 'inventory/purchase-orders', 'inventory/stock', 'sales/delivery-notes'],
        'Accounts': ['dashboard', 'sales/invoices', 'customers', 'reports'],
      },
      updateSettings: (newSettings: Partial<SystemSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      updateRolePermissions: (role: keyof RolePermissions, modules: string[]) => {
        set(state => ({
          rolePermissions: {
            ...state.rolePermissions,
            [role]: modules
          }
        }));
      },
      getAllowedModules: (role: string) => {
        const permissions = get().rolePermissions;
        return permissions[role as keyof RolePermissions] || [];
      },
    }),
    {
      name: 'system-storage',
    }
  )
);