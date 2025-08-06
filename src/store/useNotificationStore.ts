import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Lorem Ipsum',
      message: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolor',
      type: 'info',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      title: 'Lorem Ipsum',
      message: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolor',
      type: 'warning',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
    },
    {
      id: '3',
      title: 'Lorem Ipsum',
      message: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolor',
      type: 'success',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
    {
      id: '4',
      title: 'Lorem Ipsum',
      message: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolor',
      type: 'error',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: false,
    },
  ],
  unreadCount: 3,
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
      unreadCount: 0,
    }));
  },
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const isUnread = notification && !notification.read;
      
      return {
        notifications: state.notifications.filter((notif) => notif.id !== id),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },
}));