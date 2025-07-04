import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, Package, MapPin, Clock, User } from 'lucide-react';
import { useAuthContext } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils';

const MobileNav = () => {
  const router = useRouter();
  const { isAdmin, isDelivery } = useAuthContext();

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Home', icon: Home },
    { href: '/admin/deliveries', label: 'Deliveries', icon: Package },
    { href: '/admin/settings', label: 'Profile', icon: User },
  ];

  const deliveryNavItems = [
    { href: '/delivery/dashboard', label: 'Home', icon: Home },
    { href: '/delivery/route', label: 'Route', icon: MapPin },
    { href: '/delivery/history', label: 'History', icon: Clock },
  ];

  const navItems = isAdmin ? adminNavItems : deliveryNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-3 gap-1">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 text-xs transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
