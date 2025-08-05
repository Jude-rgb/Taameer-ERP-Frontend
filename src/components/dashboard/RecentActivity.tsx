import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  Package, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { formatOMRCurrency } from '@/data/dummyData';

interface ActivityItem {
  id: string;
  type: 'invoice' | 'payment' | 'product' | 'customer';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
  user?: {
    name: string;
    avatar?: string;
  };
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    description: 'Payment of 156.25 OMR received for Invoice #INV-2024-001',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'success',
    amount: 156.25,
    user: {
      name: 'Al-Rashid Trading LLC',
    },
  },
  {
    id: '2',
    type: 'invoice',
    title: 'New Invoice Created',
    description: 'Invoice #INV-2024-003 created for Gulf Hardware Stores',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    status: 'info',
    amount: 425,
    user: {
      name: 'Ahmed Al-Mansouri',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: '3',
    type: 'product',
    title: 'Low Stock Alert',
    description: 'Concrete Block 200mm stock is critically low (5 units remaining)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'warning',
    user: {
      name: 'System',
    },
  },
  {
    id: '4',
    type: 'customer',
    title: 'New Customer Added',
    description: 'Al-Noor Trading Company has been added to the customer database',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    status: 'info',
    user: {
      name: 'Fatima Al-Zahra',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e1e8?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: '5',
    type: 'invoice',
    title: 'Invoice Overdue',
    description: 'Invoice #INV-2024-002 is now 5 days overdue',
    timestamp: new Date(Date.now() - 180 * 60 * 1000),
    status: 'error',
    amount: 875,
    user: {
      name: 'Al-Zahra Construction',
    },
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'invoice':
      return FileText;
    case 'payment':
      return DollarSign;
    case 'product':
      return Package;
    case 'customer':
      return Users;
    default:
      return Clock;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    case 'error':
      return XCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'text-success bg-success/10';
    case 'warning':
      return 'text-warning bg-warning/10';
    case 'error':
      return 'text-destructive bg-destructive/10';
    default:
      return 'text-info bg-info/10';
  }
};

export const RecentActivity = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        const StatusIcon = getStatusIcon(activity.status);
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:shadow-md bg-card/50"
          >
            <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {activity.amount && (
                    <Badge variant="outline" className="text-xs">
                      {formatOMRCurrency(activity.amount)}
                    </Badge>
                  )}
                  <StatusIcon className={`w-4 h-4 ${getStatusColor(activity.status).split(' ')[0]}`} />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={activity.user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {activity.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {activity.user?.name}
                  </span>
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};