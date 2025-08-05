import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { TopNavbar } from '@/components/navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';

export const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme, isRTL } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply RTL on mount
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [theme, isRTL]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full bg-gradient-to-br from-background via-muted/20 to-background ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`${isRTL ? 'order-2' : 'order-1'}`}>
          <AppSidebar />
        </div>
        
        <div className={`flex-1 flex flex-col ${isRTL ? 'order-1' : 'order-2'}`}>
          <TopNavbar />
          
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};