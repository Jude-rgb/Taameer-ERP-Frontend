import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemSettings {
  companyName: string;
  companySlogan: string;
  companyLogo: string;
  companyAddress: string;
  companyEmail: string;
  crNumber: string;
  vatRegNumber: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  themeMode: 'light' | 'dark' | 'auto';
  logoPlacement: 'left' | 'center' | 'right';
  vatPercentage: number;
  currency: string;
  language: 'en' | 'ar';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  enabledModules: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Marketing Officer' | 'Warehouse Officer' | 'Accounts';
  status: 'Active' | 'Inactive';
  permissions: string[];
  avatar?: string;
  phone?: string;
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
  users: User[];
  updateSettings: (settings: Partial<SystemSettings>) => void;
  updateRolePermissions: (role: keyof RolePermissions, modules: string[]) => void;
  getAllowedModules: (role: string) => string[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
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
        companyAddress: '123 Business Street, Muscat, Oman',
        companyEmail: 'info@invoicepro.om',
        crNumber: 'CR1234567',
        vatRegNumber: 'VAT123456789',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
        themeMode: 'light',
        logoPlacement: 'left',
        vatPercentage: 5,
        currency: 'OMR',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        enabledModules: defaultModules,
      },
      users: [
        {
          id: '1',
          name: 'Ahmed Al-Rashid',
          email: 'ahmed@invoicepro.om',
          role: 'Super Admin',
          status: 'Active',
          permissions: defaultModules,
          phone: '+968 9123 4567'
        },
        {
          id: '2', 
          name: 'Sarah Johnson',
          email: 'sarah@invoicepro.om',
          role: 'Admin',
          status: 'Active',
          permissions: defaultModules.filter(m => m !== 'users'),
          phone: '+968 9234 5678'
        },
        {
          id: '3',
          name: 'Omar Hassan',
          email: 'omar@invoicepro.om',
          role: 'Marketing Officer',
          status: 'Active',
          permissions: ['dashboard', 'sales/quotations', 'sales/invoices', 'customers', 'reports'],
          phone: '+968 9345 6789'
        },
        {
          id: '4',
          name: 'Fatima Ali',
          email: 'fatima@invoicepro.om',
          role: 'Warehouse Officer',
          status: 'Inactive',
          permissions: ['dashboard', 'inventory/products', 'inventory/purchase-orders', 'inventory/stock'],
          phone: '+968 9456 7890'
        }
      ],
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
      addUser: (userData: Omit<User, 'id'>) => {
        set(state => ({
          users: [...state.users, { ...userData, id: Date.now().toString() }]
        }));
      },
      updateUser: (id: string, userData: Partial<User>) => {
        set(state => ({
          users: state.users.map(user => 
            user.id === id ? { ...user, ...userData } : user
          )
        }));
      },
      deleteUser: (id: string) => {
        set(state => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },
      toggleUserStatus: (id: string) => {
        set(state => ({
          users: state.users.map(user => 
            user.id === id 
              ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
              : user
          )
        }));
      },
    }),
    {
      name: 'system-storage',
    }
  )
);