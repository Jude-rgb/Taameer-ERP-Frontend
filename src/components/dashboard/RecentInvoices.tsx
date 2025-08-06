import { motion } from 'framer-motion';
import { FileText, Calendar, User, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatOMRCurrency, getInvoiceStatusColor } from '@/utils/formatters';
import { useThemeStore } from '@/store/useThemeStore';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  quotation_total: string;
  invoice_payment_status: string;
  created_at: string;
  user_id: number;
  user_name: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

// Function to capitalize status
const capitalizeStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Function to get status badge styling for dark mode
const getStatusBadgeStyle = (status: string, theme: 'light' | 'dark') => {
  const baseClasses = 'text-xs font-medium';
  
  switch (status.toLowerCase()) {
    case 'done':
      return `${baseClasses} bg-green-500 text-white`;
    case 'pending':
      return theme === 'dark' 
        ? `${baseClasses} bg-yellow-500 text-black` 
        : `${baseClasses} bg-yellow-500 text-black`;
    case 'partially':
      return `${baseClasses} bg-orange-500 text-white`;
    case 'overdue':
      return `${baseClasses} bg-red-500 text-white`;
    default:
      return `${baseClasses} bg-gray-500 text-white`;
  }
};

export const RecentInvoices: React.FC<RecentInvoicesProps> = ({ 
  invoices, 
  isLoading = false 
}) => {
  const { theme } = useThemeStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 animate-pulse"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No recent invoices found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice, index) => (
        <motion.div
          key={invoice.id}
          className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] ${
            theme === 'dark' 
              ? 'bg-gray-800 hover:bg-gray-700' 
              : 'bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm hover:bg-white/40'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ x: 5 }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-primary/20 group-hover:bg-primary/30' 
                : 'bg-primary/20 group-hover:bg-primary/30'
            }`}>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{invoice.invoice_number}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{invoice.customer_name}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-3 h-3 text-muted-foreground" />
              <span className="font-bold text-sm text-foreground">
                {formatOMRCurrency(parseFloat(invoice.quotation_total))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={getStatusBadgeStyle(invoice.invoice_payment_status, theme)}
              >
                {capitalizeStatus(invoice.invoice_payment_status)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(invoice.created_at)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 