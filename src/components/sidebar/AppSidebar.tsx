import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  Receipt,
  Truck,
  Users,
  BarChart3,
  Settings,
  ShoppingCart,
  ClipboardList,
  ChevronDown,
  Building2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventory',
    icon: Package,
    items: [
      { title: 'Products', url: '/inventory/products' },
      { title: 'Purchase Orders', url: '/inventory/purchase-orders' },
      { title: 'Stock Management', url: '/inventory/stock' },
    ],
  },
  {
    title: 'Sales',
    icon: Receipt,
    items: [
      { title: 'Quotations', url: '/sales/quotations' },
      { title: 'Invoices', url: '/sales/invoices' },
      { title: 'Delivery Notes', url: '/sales/delivery-notes' },
    ],
  },
  {
    title: 'Customers',
    url: '/customers',
    icon: Users,
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3,
  },
  {
    title: 'User Management',
    url: '/users',
    icon: Users,
  },
  {
    title: 'System Setup',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>(['Inventory', 'Sales']);

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: { url: string }[]) => 
    items.some((item) => currentPath.startsWith(item.url));

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar className={cn(
      "transition-all duration-300",
      state === "collapsed" ? "w-16" : "w-64"
    )}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">InvoicePro</h2>
              <p className="text-xs text-sidebar-foreground/70">Hardware Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      open={openGroups.includes(item.title)}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between",
                            isGroupActive(item.items) && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4" />
                            {state !== "collapsed" && <span>{item.title}</span>}
                          </div>
                          {state !== "collapsed" && (
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform",
                              openGroups.includes(item.title) && "rotate-180"
                            )} />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {state !== "collapsed" && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                  <NavLink to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild isActive={isActive(item.url!)}>
                      <NavLink to={item.url!}>
                        <item.icon className="w-4 h-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}