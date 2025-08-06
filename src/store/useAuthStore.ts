import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/auth';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
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
  loginUser: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  sendOTP: (email: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  resetForgotPassword: () => void;
  initializeAuth: () => void;
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
      loginUser: async (email: string, password: string) => {
        try {
          const result = await authService.login(email, password);
          if (result.success) {
            set({ 
              user: result.user, 
              isAuthenticated: true 
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      logout: () => {
        authService.logout();
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
      initializeAuth: () => {
        const user = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        set({ user, isAuthenticated });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);