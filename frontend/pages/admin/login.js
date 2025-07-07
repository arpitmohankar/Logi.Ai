import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import Layout from '../../components/common/Layout';
import useAuthStore from '../../store/authStore';
import { loginSchema } from '../../lib/validators';
import { redirectBasedOnRole } from '../../utils/auth';

export default function AdminLogin() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data);
    
    if (result.success) {
      if (result.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        setError('Access denied. Admin credentials required.');
      }
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <Layout title="Admin Login">
      <div className="aurora-bg min-h-screen">
        <div className="aurora-bg-after2" />
        <div className="flex items-center justify-center px-4 py-12 min-h-screen z-10 relative">
          <Card className="w-full max-w-md bg-white shadow-xl border-0 z-20">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
              </div>
              <CardTitle className="gt-super-like text-3xl text-center text-blue-900">Admin Login</CardTitle>
              <CardDescription className="text-center text-blue-700">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-900 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@walmart.com"
                  {...register('email')}
                  disabled={isLoading}
                    className="bg-[#e6e98a] border-2 border-[#bfc13d] text-lg py-3 px-5 rounded-xl shadow-md placeholder:text-[#7a7a3a] font-semibold"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-900 font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                      className="bg-[#e6e98a] border-2 border-[#bfc13d] text-lg py-3 px-5 rounded-xl shadow-md placeholder:text-[#7a7a3a] font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg px-8 py-3 rounded-xl font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
                <div className="text-sm text-center text-blue-700">
                Delivery partner?{' '}
                  <Link href="/delivery/login" className="text-blue-600 hover:underline font-bold">
                  Login here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        </div>
      </div>
    </Layout>
  );
}
