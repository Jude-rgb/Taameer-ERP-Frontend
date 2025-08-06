import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, Receipt, Users, BarChart3, Settings, X, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard
  },
  {
    title: 'Inventory',
    icon: Package,
    items: [
      { title: 'Products', url: '/inventory/products' },
      { title: 'Purchase Orders', url: '/inventory/purchase-orders' },
      { title: 'Stock Management', url: '/inventory/stock' }
    ]
  },
  {
    title: 'Sales',
    icon: Receipt,
    items: [
      { title: 'Quotations', url: '/sales/quotations' },
      { title: 'Invoices', url: '/sales/invoices' },
      { title: 'Delivery Notes', url: '/sales/delivery-notes' }
    ]
  },
  {
    title: 'Customers',
    url: '/customers',
    icon: Users
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3
  },
  {
    title: 'User Management',
    url: '/users',
    icon: Users
  },
  {
    title: 'System Setup',
    url: '/settings',
    icon: Settings
  }
];

interface MobileNavigationProps {
  children: React.ReactNode;
}

export function MobileNavigation({ children }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['Inventory', 'Sales']);
  const { settings } = useSystemStore();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: { url: string }[]) => 
    items.some(item => currentPath.startsWith(item.url));

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-card">
        <SheetHeader className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <img 
              src="/saas-uploads/Logo-01.png" 
              alt="Logo" 
              className="w-auto h-8 object-contain" 
            />
            <div className="flex flex-col text-left">
              <SheetTitle className="text-sm font-semibold text-foreground">
                {settings?.companyName || 'SaaS Platform'}
              </SheetTitle>
              <span className="text-xs text-muted-foreground">Invoice System</span>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.items ? (
                  <Collapsible 
                    open={openGroups.includes(item.title)} 
                    onOpenChange={() => toggleGroup(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between h-12 px-4 rounded-lg transition-all duration-200 focus-brand",
                          (isGroupActive(item.items)) && "bg-primary text-primary-foreground hover:bg-primary-hover"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <ChevronDown 
                          className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            openGroups.includes(item.title) && "rotate-180"
                          )} 
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-8 mt-2 space-y-1"
                      >
                        {item.items.map((subItem) => (
                          <NavLink
                            key={subItem.url}
                            to={subItem.url}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center h-10 px-4 rounded-lg text-sm transition-all duration-200 focus-brand",
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )
                            }
                          >
                            {subItem.title}
                          </NavLink>
                        ))}
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <NavLink
                    to={item.url!}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 h-12 px-4 rounded-lg font-medium transition-all duration-200 focus-brand",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}