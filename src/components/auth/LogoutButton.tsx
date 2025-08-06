import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

/**
 * LogoutButton component that handles user logout
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'ghost',
  size = 'default',
  className = '',
  showIcon = true,
  children = 'Logout'
}) => {
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "info",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children}
    </Button>
  );
};

export default LogoutButton; 