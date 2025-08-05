import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, FileText, Receipt, Truck, Users, BarChart3, Settings, ShoppingCart, ClipboardList, ChevronDown, Building2 } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar, SidebarHeader } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>(['Inventory', 'Sales']);
  
  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: { url: string; }[]) => 
    items.some(item => currentPath.startsWith(item.url));
  
  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
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
          "backdrop-blur-lg bg-glass-background border-glass-border shadow-glass transition-all duration-500 ease-in-out",
          state === "collapsed" ? "w-16" : "w-64"
        )}
        style={{
          background: "var(--glass-background)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--glass-border)"
        }}
      >
        <SidebarHeader className="p-4 border-b border-glass-border">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </motion.div>
            {state !== "collapsed" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="font-bold text-lg text-sidebar-foreground">InvoicePro</h2>
                <p className="text-xs text-sidebar-foreground/70">Smart Business Solutions</p>
              </motion.div>
            )}
          </motion.div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 px-3 mb-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <Collapsible 
                        open={openGroups.includes(item.title)} 
                        onOpenChange={() => toggleGroup(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <SidebarMenuButton 
                              className={cn(
                                "w-full justify-between rounded-xl h-12 transition-all duration-300 hover:bg-sidebar-accent group",
                                isGroupActive(item.items) && "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                  "w-5 h-5 transition-colors",
                                  isGroupActive(item.items) ? "text-white" : "text-sidebar-foreground"
                                )} />
                                {state !== "collapsed" && (
                                  <span className="font-medium">{item.title}</span>
                                )}
                              </div>
                              {state !== "collapsed" && (
                                <ChevronDown className={cn(
                                  "w-4 h-4 transition-transform duration-300",
                                  openGroups.includes(item.title) && "rotate-180"
                                )} />
                              )}
                            </SidebarMenuButton>
                          </motion.div>
                        </CollapsibleTrigger>
                        {state !== "collapsed" && (
                          <CollapsibleContent>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                                {item.items.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.url}>
                                    <motion.div
                                      whileHover={{ x: 4 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <SidebarMenuSubButton 
                                        asChild 
                                        isActive={isActive(subItem.url)}
                                        className="rounded-lg h-10 hover:bg-sidebar-accent/50"
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
                    ) : (
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
                            "rounded-xl h-12 transition-all duration-300 hover:bg-sidebar-accent group",
                            isActive(item.url!) && "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                          )}
                        >
                          <NavLink to={item.url!}>
                            <item.icon className={cn(
                              "w-5 h-5 transition-colors",
                              isActive(item.url!) ? "text-white" : "text-sidebar-foreground"
                            )} />
                            {state !== "collapsed" && (
                              <span className="font-medium">{item.title}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </motion.div>
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