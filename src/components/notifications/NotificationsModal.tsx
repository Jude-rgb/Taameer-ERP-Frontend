import { motion } from 'framer-motion';
import { Bell, Check, X, Trash2, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNotificationStore, Notification } from '@/store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsModal = ({ open, onOpenChange }: NotificationsModalProps) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '💡';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-info';
    }
  };

  const toggleNotificationRead = (notification: Notification) => {
    if (notification.read) {
      // Mark as unread - in real app this would be implemented
      markAsRead(notification.id); // For now, this just marks as read
    } else {
      markAsRead(notification.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <DialogTitle>All Notifications</DialogTitle>
            </div>
            {notifications.some(n => !n.read) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-8"
              >
                Mark all read
              </Button>
            )}
          </div>
          <DialogDescription>
            View and manage all your notifications. (Future updates coming soon)
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! Check back later for new notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={cn(
                    "p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors relative group",
                    !notification.read && "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={cn(
                          "font-medium text-sm",
                          getNotificationColor(notification.type)
                        )}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleNotificationRead(notification)}
                            title={notification.read ? "Mark as unread" : "Mark as read"}
                          >
                            {notification.read ? 
                              <CircleDot className="w-3 h-3" /> : 
                              <Check className="w-3 h-3" />
                            }
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeNotification(notification.id)}
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                        
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {notification.actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="outline"
                              size="sm"
                              onClick={action.action}
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < notifications.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};