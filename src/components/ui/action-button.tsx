import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  tooltip: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  color?: 'default' | 'red' | 'green' | 'blue' | 'yellow' | 'purple';
}

export function ActionButton({
  icon: Icon,
  tooltip,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className = '',
  disabled = false,
  color = 'default'
}: ActionButtonProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950';
      case 'green':
        return 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950';
      case 'blue':
        return 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950';
      case 'yellow':
        return 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950';
      case 'purple':
        return 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950';
      default:
        return '';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={onClick}
          disabled={disabled}
          className={`hover:scale-105 transition-all duration-200 ${getColorClasses()} ${className}`}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
} 