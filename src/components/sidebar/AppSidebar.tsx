import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, FileText, Receipt, Truck, Users, BarChart3, Settings, ShoppingCart, ClipboardList, ChevronDown, Building2, Menu, X } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="bg-popover border-border">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="relative">
      <Sidebar 
        className={cn(
          "border-r bg-card shadow-sm transition-all duration-300 ease-in-out",
          !open ? "w-16" : "w-64",
          "hidden md:flex", // Hide on mobile, show on tablet+
        )}
      >
        <SidebarHeader className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {open ? (
                  <img src="/saas-uploads/Logo-01.png" alt="Logo" className="w-auto h-8 object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-primary" />
                )}
              </div>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <span className="text-sm font-semibold text-foreground">{settings?.companyName || 'SaaS Platform'}</span>
                  <span className="text-xs text-muted-foreground">Invoice System</span>
                </motion.div>
              )}
            </div>
            <SidebarTrigger className="w-8 h-8 hover:bg-accent/50" />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 overflow-y-auto">
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
                             <div>
                                <SidebarMenuButton 
                                 className={cn(
                                   "w-full justify-between rounded-lg h-10 transition-all duration-200 hover:bg-accent/50 focus-brand",
                                   (isGroupActive(item.items) || isSubItemActive(item.items)) && "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
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
                             </div>
                           </CollapsibleTrigger>
                          {open && (
                             <CollapsibleContent>
                               <div>
                                 <SidebarMenuSub className="ml-6 mt-1 space-y-1">
                                   {item.items.map((subItem) => (
                                     <SidebarMenuSubItem key={subItem.url}>
                                       <div>
                                          <SidebarMenuSubButton 
                                            asChild 
                                            isActive={isActive(subItem.url)}
                                            className={cn(
                                              "rounded-lg h-8 transition-all duration-200 text-sm focus-brand",
                                              isActive(subItem.url) 
                                                ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm" 
                                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                            )}
                                          >
                                          <NavLink to={subItem.url}>
                                             <span className="text-sm">{subItem.title}</span>
                                          </NavLink>
                                         </SidebarMenuSubButton>
                                       </div>
                                     </SidebarMenuSubItem>
                                  ))}
                                 </SidebarMenuSub>
                               </div>
                             </CollapsibleContent>
                          )}
                        </Collapsible>
                      </SidebarTooltip>
                    ) : (
                       <SidebarTooltip content={item.title}>
                         <div>
                            <SidebarMenuButton 
                              asChild 
                              isActive={isActive(item.url!)}
                              className={cn(
                                "rounded-lg h-10 transition-all duration-200 focus-brand",
                                isActive(item.url!) 
                                  ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm" 
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
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
                         </div>
                       </SidebarTooltip>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}