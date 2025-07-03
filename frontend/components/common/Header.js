import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu, X, LogOut, Settings, User, Package, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '../../store/authStore';
import { useAuthContext } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils';

const Header = () => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { user, isAdmin, isDelivery } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = isAdmin ? [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Package },
    { href: '/admin/deliveries', label: 'Deliveries', icon: Package },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ] : isDelivery ? [
    { href: '/delivery/dashboard', label: 'Dashboard', icon: Package },
    { href: '/delivery/route', label: 'Active Route', icon: MapPin },
    { href: '/delivery/history', label: 'History', icon: Package },
  ] : [];

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link href={isAdmin ? '/admin/dashboard' : '/delivery/dashboard'} className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-walmart-blue flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            Walmart Delivery
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 mx-6 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                router.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} alt={user?.name} />
                  <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-1 p-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent",
                  router.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
