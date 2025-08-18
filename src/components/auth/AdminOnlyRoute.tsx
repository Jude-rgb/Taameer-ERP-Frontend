import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { normalizeRole } from '@/lib/rbac';

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * AdminOnlyRoute component that only allows ADMIN users
 * Redirects non-admin users to dashboard
 */
export const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const role = normalizeRole(user?.role);

  // Only ADMIN users can access documentation
  if (role !== 'ADMIN') {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if user is ADMIN
  return <>{children}</>;
};

export default AdminOnlyRoute;
