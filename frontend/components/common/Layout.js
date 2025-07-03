import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from './Header';
import MobileNav from './MobileNav';
import { useAuthContext } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils';

const Layout = ({ children, title = '', className = '' }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  
  // Check if current page should show header/nav
  const showHeader = !router.pathname.includes('/login') && router.pathname !== '/' && router.pathname !== '/track';
  const showMobileNav = showHeader && (user?.role === 'delivery' || user?.role === 'admin');

  return (
    <>
      <Head>
        <title>{title ? `${title} | Walmart Delivery` : 'Walmart Delivery Optimization'}</title>
        <meta name="description" content="Walmart delivery route optimization system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background">
        {showHeader && <Header />}
        
        <main className={cn(
          'flex-1',
          showHeader && 'pt-16', // Account for fixed header
          showMobileNav && 'pb-16 md:pb-0', // Account for mobile nav
          className
        )}>
          {children}
        </main>
        
        {showMobileNav && <MobileNav />}
      </div>
    </>
  );
};

export default Layout;
