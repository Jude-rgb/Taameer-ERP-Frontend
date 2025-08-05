import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, FileText, Receipt, Truck, Users, BarChart3, Settings, ShoppingCart, ClipboardList, ChevronDown, Building2, Menu, X } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';
const menuItems = [{
  title: 'Dashboard',
  url: '/',
  icon: LayoutDashboard
}, {
  title: 'Inventory',
  icon: Package,
  items: [{
    title: 'Products',
    url: '/inventory/products'
  }, {
    title: 'Purchase Orders',
    url: '/inventory/purchase-orders'
  }, {
    title: 'Stock Management',
    url: '/inventory/stock'
  }]
}, {
  title: 'Sales',
  icon: Receipt,
  items: [{
    title: 'Quotations',
    url: '/sales/quotations'
  }, {
    title: 'Invoices',
    url: '/sales/invoices'
  }, {
    title: 'Delivery Notes',
    url: '/sales/delivery-notes'
  }]
}, {
  title: 'Customers',
  url: '/customers',
  icon: Users
}, {
  title: 'Reports',
  url: '/reports',
  icon: BarChart3
}, {
  title: 'User Management',
  url: '/users',
  icon: Users
}, {
  title: 'System Setup',
  url: '/settings',
  icon: Settings
}];
export function AppSidebar() {
  const { state, open, setOpen } = useSidebar();
  const { settings } = useSystemStore();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>(['Inventory', 'Sales']);
  
  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: { url: string; }[]) => 
    items.some(item => currentPath.startsWith(item.url));
  
  const isSubItemActive = (items: { url: string; }[]) =>
    items.some(item => currentPath === item.url);
  
  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  const SidebarTooltip = ({ children, content, side = "right" }: { children: React.ReactNode; content: string; side?: "top" | "right" | "bottom" | "left" }) => {
    if (open) return <>{children}</>;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent side={side} className="bg-popover border-border">
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      <Sidebar 
        className={cn(
          "border-r bg-background transition-all duration-300 ease-in-out",
          !open ? "w-16" : "w-64"
        )}
      >
        <SidebarHeader className="p-4 border-b">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="font-semibold text-sm text-foreground">{settings.companyName}</h2>
              </motion.div>
            )}
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <SidebarTooltip content={item.title}>
                        <Collapsible 
                          open={open && openGroups.includes(item.title)} 
                          onOpenChange={() => open && toggleGroup(item.title)}
                        >
                          <CollapsibleTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                               <SidebarMenuButton 
                                className={cn(
                                  "w-full justify-between rounded-lg h-10 transition-all duration-200 hover:bg-accent",
                                  (isGroupActive(item.items) || isSubItemActive(item.items)) && "bg-primary text-primary-foreground",
                                  !open && "justify-center px-2"
                                )}
                              >
                                 <div className="flex items-center gap-3">
                                   <item.icon className={cn(
                                     "w-5 h-5 transition-colors",
                                     (isGroupActive(item.items) || isSubItemActive(item.items)) ? "text-primary-foreground" : "text-muted-foreground"
                                   )} />
                                   {open && (
                                     <span className="text-sm font-medium">{item.title}</span>
                                   )}
                                 </div>
                                {open && (
                                  <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform duration-300",
                                    openGroups.includes(item.title) && "rotate-180"
                                  )} />
                                )}
                              </SidebarMenuButton>
                            </motion.div>
                          </CollapsibleTrigger>
                          {open && (
                            <CollapsibleContent>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                 <SidebarMenuSub className="ml-6 mt-1 space-y-1">
                                  {item.items.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.url}>
                                      <motion.div
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                         <SidebarMenuSubButton 
                                           asChild 
                                           isActive={isActive(subItem.url)}
                                           className="rounded-lg h-8 hover:bg-accent text-sm"
                                         >
                                          <NavLink to={subItem.url}>
                                             <span className="text-sm">{subItem.title}</span>
                                          </NavLink>
                                        </SidebarMenuSubButton>
                                      </motion.div>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </motion.div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </SidebarTooltip>
                    ) : (
                      <SidebarTooltip content={item.title}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                           <SidebarMenuButton 
                             asChild 
                             isActive={isActive(item.url!)}
                             className={cn(
                               "rounded-lg h-10 transition-all duration-200 hover:bg-accent",
                               isActive(item.url!) && "bg-primary text-primary-foreground",
                               !open && "justify-center px-2"
                             )}
                           >
                             <NavLink to={item.url!}>
                               <item.icon className={cn(
                                 "w-5 h-5 transition-colors",
                                 isActive(item.url!) ? "text-primary-foreground" : "text-muted-foreground"
                               )} />
                               {open && (
                                 <span className="text-sm font-medium">{item.title}</span>
                               )}
                             </NavLink>
                          </SidebarMenuButton>
                        </motion.div>
                      </SidebarTooltip>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </motion.div>
  );
}