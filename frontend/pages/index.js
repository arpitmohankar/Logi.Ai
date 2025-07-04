import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Truck, MapPin, Users, ChevronRight, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Layout from '../components/common/Layout';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Home() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track?code=${trackingCode.trim()}`);
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Real-time Route Optimization',
      description: 'AI-powered route planning that adapts to traffic conditions in real-time'
    },
    {
      icon: Truck,
      title: 'Live Tracking',
      description: 'Track your deliveries in real-time with accurate location updates'
    },
    {
      icon: Package,
      title: 'Smart Delivery Management',
      description: 'Efficiently manage multiple deliveries with priority-based routing'
    },
    {
      icon: Users,
      title: 'Multi-User Portals',
      description: 'Dedicated portals for admins, delivery partners, and customers'
    }
  ];

  return (
    <Layout title="Home">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-walmart-blue flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="font-bold text-xl">Walmart Delivery</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" asChild>
                <Link href="/admin/login">Admin</Link>
              </Button>
              <Button asChild>
                <Link href="/delivery/login">Delivery Partner</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Optimized Delivery Routes,<br />
              <span className="text-walmart-blue">Delivered Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Revolutionary route optimization system that reduces delivery time by 30% 
              with real-time traffic adaptation
            </p>
            
            {/* Tracking Form */}
            <form onSubmit={handleTrack} className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter tracking code (e.g., ABC123)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  maxLength={6}
                />
                <Button type="submit" size="lg">
                  <Search className="mr-2 h-4 w-4" />
                  Track
                </Button>
              </div>
            </form>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/delivery/login">
                  Start Delivering
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/admin/login">
                  Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-walmart-blue mb-2">30%</div>
                <p className="text-muted-foreground">Faster Deliveries</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-walmart-blue mb-2">50K+</div>
                <p className="text-muted-foreground">Daily Deliveries</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-walmart-blue mb-2">98%</div>
                <p className="text-muted-foreground">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-4">
          <div className="container mx-auto text-center text-muted-foreground">
            <p>&copy; 2024 Walmart Delivery Optimization. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
