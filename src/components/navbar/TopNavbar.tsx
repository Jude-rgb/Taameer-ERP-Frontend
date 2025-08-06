import { useState } from 'react';
import { Search, Bell, Moon, Sun, Languages, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { ProfileSettingsModal } from '@/components/profile/ProfileSettingsModal';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useSystemStore } from '@/store/useSystemStore';

export const TopNavbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, isRTL, toggleTheme, toggleRTL } = useThemeStore();
  const { settings } = useSystemStore();

  return (
    <>
      <header className="h-16 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Navigation */}
            <MobileNavigation>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="w-5 h-5" />
              </Button>
            </MobileNavigation>

            {/* Company Info - hidden on mobile */}
            <div className="hidden lg:block">
              <h2 className="font-semibold text-foreground">{settings?.companyName || 'Taameer'}</h2>
              <p className="text-xs text-muted-foreground">Construction Materials</p>
            </div>
            
            {/* Search - responsive */}
            <div className="relative flex-1 max-w-sm lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-background/60 border-border/50 h-9 text-sm focus-brand"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 hover:bg-accent/50 focus-brand"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            {/* RTL Toggle - hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRTL}
              className="relative h-9 w-9 hover:bg-accent/50 focus-brand hidden sm:flex"
              aria-label="Toggle text direction"
            >
              <Languages className="w-4 h-4" />
              {isRTL && (
                <Badge variant="secondary" className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-primary">
                </Badge>
              )}
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-brand">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {user?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutButton 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  showIcon={true}
                >
                  Log out
                </LogoutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>

    <ProfileSettingsModal 
      open={profileOpen} 
      onOpenChange={setProfileOpen} 
    />
  </>);
};