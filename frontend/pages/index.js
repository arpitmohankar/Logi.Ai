import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Truck, MapPin, Users, ChevronRight, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Layout from '../components/common/Layout';
import SplitText from '../components/common/SplitText';

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
      title: 'Multi Stop Route Optimization',
      description: 'Intelligently plans multi-stop routes using real-time traffic, weather, and distance data, cutting delivery times and slashing fuel costs for seamless B2B logistics.'
    },
    {
      icon: Truck,
      title: 'Dynamic Re-routing',
      description: "Adapt on the fly with Logi.AI's dynamic re-routing. Real-time traffic and weather updates ensure your drivers take the fastest, most cost-effective paths, every time."
    },
    {
      icon: Package,
      title: 'Live Tracking',
      description: 'Live tracking empowers multiple users - drivers, managers, and clients - with real-time delivery updates, ensuring transparency and coordination across your operations.'
    },
    {
      icon: Users,
      title: 'Smart Delivery Management',
      description: 'Priority-based routing optimizes schedules to meet critical deadlines, balancing urgency and efficiency to enhance customer satisfaction and streamline operations.'
    }
  ];

  return (
    <Layout title="Home">
      <div className="aurora-bg min-h-screen" style={{ position: 'relative', zIndex: 0 }}>
        {/* Strong yellow/blue aurora background effect */}
        <div className="aurora-bg-after2" style={{ opacity: 0.85, zIndex: 1 }} />
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur z-10 relative">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl"><img src="/route.png" alt="" className="h-6 w-6" /></span>
              </div>
              <span className="font-bold text-xl text-blue-900">Logi.AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-slate-100 text-blue-900 hover:bg-slate-200 font-semibold rounded-xl px-6 py-2 shadow-none">
                <Link href="/admin/login">Admin</Link>
              </Button>
              <Button asChild className="bg-slate-100 text-blue-900 hover:bg-slate-200 font-semibold rounded-xl px-6 py-2 shadow-none">
                <Link href="/delivery/login">Delivery Partner</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-24 px-4 relative z-10">
          <div className="container mx-auto text-center">
            <h1 className="gt-super-like text-5xl md:text-7xl font-bold mb-6 text-blue-900 drop-shadow-lg" aria-label="Optimize. Deliver. Save.">
              <SplitText text="Optimize. Deliver. Save." className="text-blue-900" splitType="chars" />
            </h1>
            <p className="text-lg md:text-2xl text-blue-700 mb-8 max-w-2xl mx-auto" style={{ textShadow: '0 2px 12px rgba(60, 60, 120, 0.10)' }}>
              Slash delivery times by 25% with our intelligent route optimization. Harness real-time traffic, weather, and multi-stop planning to save fuel, reduce costs and deliver smarter to ensure your B2B logistics are more efficient.
            </p>
            {/* Tracking Form */}
            <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-10">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter tracking code (e.g., ABC123)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#e6e98a] border-2 border-[#bfc13d] text-black text-lg md:text-xl py-4 px-6 rounded-xl shadow-lg placeholder:text-[#7a7a3a] font-semibold"
                  maxLength={6}
                />
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg md:text-xl px-8 py-4 rounded-xl">
                  <Search className="mr-2 h-6 w-6" />
                  Track
                </Button>
              </div>
            </form>
            <div className="flex gap-6 justify-center">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-lg md:text-xl px-10 py-4 rounded-xl">
                <Link href="/delivery/login">
                  Start Delivering
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-blue-600 text-blue-700 hover:bg-blue-50 text-lg md:text-xl px-10 py-4 rounded-xl bg-[#f7f7c6]/60 border-2">
                <Link href="/admin/login">
                  Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-blue-50/60 relative z-10">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-white/90 shadow-lg border-0 hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 shadow">
                      {feature.title === 'Multi Stop Route Optimization' ? (
                        <img src="/multistop.png" alt="Multi Stop Route" className="h-6 w-6" />
                      ) : feature.title === 'Dynamic Re-routing' ? (
                        <img src="/rerouting.png" alt="Dynamic Re-routing" className="h-6 w-6" />
                      ) : feature.title === 'Live Tracking' ? (
                        <img src="/livetracking.png" alt="Live Tracking" className="h-6 w-6" />
                      ) : feature.title === 'Smart Delivery Management' ? (
                        <img src="/truck.png" alt="Smart Delivery Management" className="h-6 w-6" />
                      ) : (
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg text-blue-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-700">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2 drop-shadow">30%</div>
                <p className="text-blue-700">Faster Deliveries</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-700 mb-2 drop-shadow">100+</div>
                <p className="text-blue-700">Daily Deliveries</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2 drop-shadow">98%</div>
                <p className="text-blue-700">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-4 bg-white/80 backdrop-blur relative z-10">
          <div className="container mx-auto text-center text-blue-400">
            <p>&copy; 2024 Logi.AI All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
