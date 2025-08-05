import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Admin' | 'Marketing Officer' | 'Warehouse Officer' | 'Accounts';
  avatar?: string;
}

interface ForgotPasswordState {
  step: 'email' | 'otp' | 'newPassword';
  email: string;
  otp: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  forgotPassword: ForgotPasswordState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  resetForgotPassword: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      forgotPassword: {
        step: 'email',
        email: '',
        otp: '',
      },
      login: async (email: string, password: string) => {
        // Dummy authentication
        if (email === 'admin@company.com' && password === 'admin123') {
          const user: User = {
            id: '1',
            name: 'Ahmed Al-Mansouri',
            email: 'admin@company.com',
            phone: '+968 9123 4567',
            role: 'Super Admin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },
      changePassword: async (oldPassword: string, newPassword: string) => {
        // Dummy password change - in real app, verify old password
        await new Promise(resolve => setTimeout(resolve, 1000));
        return oldPassword === 'admin123'; // Simple dummy validation
      },
      sendOTP: async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        set(state => ({
          forgotPassword: {
            ...state.forgotPassword,
            step: 'otp',
            email,
          }
        }));
        return true;
      },
      verifyOTP: async (otp: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (otp === '123456') { // Dummy OTP
          set(state => ({
            forgotPassword: {
              ...state.forgotPassword,
              step: 'newPassword',
              otp,
            }
          }));
          return true;
        }
        return false;
      },
      resetPassword: async (newPassword: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        set(state => ({
          forgotPassword: {
            step: 'email',
            email: '',
            otp: '',
          }
        }));
        return true;
      },
      resetForgotPassword: () => {
        set(state => ({
          forgotPassword: {
            step: 'email',
            email: '',
            otp: '',
          }
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);