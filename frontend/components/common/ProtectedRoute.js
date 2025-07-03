import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../providers/AuthProvider';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to appropriate login page
      if (router.pathname.startsWith('/admin')) {
        router.push('/admin/login');
      } else if (router.pathname.startsWith('/delivery')) {
        router.push('/delivery/login');
      } else {
        router.push('/');
      }
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      // User doesn't have required role
      router.push('/');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Check role permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">You dont have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
