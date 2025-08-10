import { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { canAccessModule, getAllowedModules, normalizeRole, pathToModuleId } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks authentication
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, initializeAuth, user } = useAuthStore();
  const location = useLocation();

  const role = useMemo(() => normalizeRole(user?.role), [user?.role]);

  useEffect(() => {
    // Initialize auth state from localStorage on component mount
    initializeAuth();
  }, [initializeAuth]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Module-level RBAC: if current path corresponds to a module the role cannot access, redirect
  const moduleId = pathToModuleId(location.pathname);
  if (moduleId && !canAccessModule(role, moduleId)) {
    // Find first allowed module to redirect
    const allowed = getAllowedModules(role);
    const fallback = (allowed[0] || 'dashboard') as string;
    const path = fallback === 'dashboard' ? '/dashboard' : `/${fallback}`;
    return <Navigate to={path} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 