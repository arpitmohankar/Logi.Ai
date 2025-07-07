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
      description: "Adapt on the on-the-spot dynamic re-routing. Real-time traffic and weather updates ensure your drivers take the fastest, most cost-effective paths, every time."
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
          <div className="container mx-auto px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className="h-8 w-8 rounded flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl"><img src="/route.png" alt="" className="h-6 w-6" /></span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-blue-900">Logi.AI</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-center sm:justify-end">
              <Button asChild className="w-1/2 sm:w-auto bg-slate-100 text-blue-900 hover:bg-slate-200 font-semibold rounded-xl px-3 sm:px-6 py-2 shadow-none text-sm sm:text-base">
                <Link href="/admin/login">Admin</Link>
              </Button>
              <Button asChild className="w-1/2 sm:w-auto bg-slate-100 text-blue-900 hover:bg-slate-200 font-semibold rounded-xl px-3 sm:px-6 py-2 shadow-none text-sm sm:text-base">
                <Link href="/delivery/login">Delivery Partner</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-14 sm:py-24 px-2 sm:px-4 relative z-10">
          <div className="container mx-auto text-center">
            <h1 className="gt-super-like text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 text-blue-900 drop-shadow-lg break-words leading-tight" aria-label="Optimize. Deliver. Save.">
              <SplitText text="Optimize. Deliver. Save." className="text-blue-900" splitType="chars" />
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-blue-700 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto" style={{ textShadow: '0 2px 12px rgba(60, 60, 120, 0.10)' }}>
              Slash delivery times by 25% with our intelligent route optimization. Harness real-time traffic, weather, and multi-stop planning to save fuel, reduce costs and deliver smarter to ensure your B2B logistics are more efficient.
            </p>
            {/* Tracking Form */}
            <form onSubmit={handleTrack} className="max-w-full sm:max-w-xl mx-auto mb-6 sm:mb-10">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                <Input
                  type="text"
                  placeholder="Enter tracking code (e.g., ABC123)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#e6e98a] border-2 border-[#bfc13d] text-black text-base sm:text-lg md:text-xl py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg placeholder:text-[#7a7a3a] font-semibold min-w-0"
                  maxLength={6}
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-base sm:text-lg md:text-xl px-0 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center justify-center">
                  <Search className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Track
                </Button>
              </div>
            </form>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center w-full">
              <Button size="lg" asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-base sm:text-lg md:text-xl px-0 sm:px-10 py-3 sm:py-4 rounded-xl flex items-center justify-center">
                <Link href="/delivery/login">
                  Start Delivering
                  <ChevronRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-blue-600 text-blue-700 hover:bg-blue-50 text-base sm:text-lg md:text-xl px-0 sm:px-10 py-3 sm:py-4 rounded-xl bg-[#f7f7c6]/60 border-2 flex items-center justify-center">
                <Link href="/admin/login">
                  Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Interface Images Showcase */}
        <section className="relative z-20 flex justify-center items-center w-full mb-10 sm:mb-16">
          <div className="relative flex justify-between items-end w-full max-w-7xl h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] mx-auto group px-2 sm:px-8">
            {/* Left (Admin) - Far Left */}
            <img
              id="admin-img"
              src="/admin_interface.png"
              alt="Admin Interface"
              className="z-10 floating-img shadow-xl rounded-2xl border border-slate-200 object-cover object-top transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:z-40 focus:z-40 focus:brightness-110 focus:shadow-2xl"
              style={{ width: '20vw', height: '90%', maxWidth: 260, minWidth: 110, maxHeight: '95%', filter: 'drop-shadow(0 12px 36px rgba(60,60,120,0.14))', background: 'rgba(255,255,255,0.7)', animation: 'floatY 4.2s ease-in-out infinite alternate' }}
              tabIndex={0}
              onMouseEnter={e => {
                e.currentTarget.classList.add('!brightness-110', '!z-40');
                document.getElementById('driver-img').classList.add('opacity-50');
                document.getElementById('web-img').classList.add('opacity-50');
              }}
              onMouseLeave={e => {
                e.currentTarget.classList.remove('!brightness-110', '!z-40');
                document.getElementById('driver-img').classList.remove('opacity-50');
                document.getElementById('web-img').classList.remove('opacity-50');
              }}
            />
            {/* Center (Web) - Wide Rectangle */}
            <img
              id="web-img"
              src="/web_interface.png"
              alt="Web Interface"
              className="z-20 floating-img shadow-2xl rounded-3xl border border-slate-200 object-cover object-top transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:z-40 focus:z-40 focus:brightness-110 focus:shadow-2xl"
              style={{ width: '56vw', height: '70%', aspectRatio: '16/9', maxWidth: 950, minWidth: 260, maxHeight: 420, minHeight: 140, filter: 'drop-shadow(0 16px 48px rgba(60,60,120,0.18))', background: 'rgba(255,255,255,0.7)', animation: 'floatY 3.5s ease-in-out infinite alternate' }}
              tabIndex={0}
              onMouseEnter={e => {
                e.currentTarget.classList.add('!brightness-110', '!z-40');
                document.getElementById('admin-img').classList.add('opacity-50');
                document.getElementById('driver-img').classList.add('opacity-50');
              }}
              onMouseLeave={e => {
                e.currentTarget.classList.remove('!brightness-110', '!z-40');
                document.getElementById('admin-img').classList.remove('opacity-50');
                document.getElementById('driver-img').classList.remove('opacity-50');
              }}
            />
            {/* Right (Driver) - Far Right */}
            <img
              id="driver-img"
              src="/driver_interface.png"
              alt="Driver Interface"
              className="z-10 floating-img shadow-xl rounded-2xl border border-slate-200 object-cover object-top transition-all duration-300 hover:brightness-110 hover:shadow-2xl hover:z-40 focus:z-40 focus:brightness-110 focus:shadow-2xl"
              style={{ width: '20vw', height: '90%', maxWidth: 260, minWidth: 110, maxHeight: '95%', filter: 'drop-shadow(0 12px 36px rgba(60,60,120,0.14))', background: 'rgba(255,255,255,0.7)', animation: 'floatY 3.8s ease-in-out infinite alternate' }}
              tabIndex={0}
              onMouseEnter={e => {
                e.currentTarget.classList.add('!brightness-110', '!z-40');
                document.getElementById('admin-img').classList.add('opacity-50');
                document.getElementById('web-img').classList.add('opacity-50');
              }}
              onMouseLeave={e => {
                e.currentTarget.classList.remove('!brightness-110', '!z-40');
                document.getElementById('admin-img').classList.remove('opacity-50');
                document.getElementById('web-img').classList.remove('opacity-50');
              }}
            />
          </div>
        </section>

        {/* Floating animation keyframes */}
        <style jsx>{`
          @keyframes floatY {
            0% { transform: translateY(0); }
            100% { transform: translateY(-18px); }
          }
        `}</style>

        {/* Features Section */}
        <section className="py-10 sm:py-20 px-2 sm:px-4 bg-blue-50/60 relative z-10">
          <div className="container mx-auto">
            <h2 className="text-xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-blue-900">
              What makes us stand out?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-white/90 shadow-lg border-0 hover:scale-105 transition-transform duration-300 p-4 sm:p-0">
                  <CardHeader>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow">
                      {feature.title === 'Multi Stop Route Optimization' ? (
                        <img src="/multistop.png" alt="Multi Stop Route" className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : feature.title === 'Dynamic Re-routing' ? (
                        <img src="/rerouting.png" alt="Dynamic Re-routing" className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : feature.title === 'Live Tracking' ? (
                        <img src="/livetracking.png" alt="Live Tracking" className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : feature.title === 'Smart Delivery Management' ? (
                        <img src="/truck.png" alt="Smart Delivery Management" className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      )}
                    </div>
                    <CardTitle className="text-base sm:text-lg text-blue-900">{feature.title}</CardTitle>
                    {feature.title === 'Multi Stop Route Optimization' && (
                      <img
                        src="/multistop_map.png"
                        alt="Multi Stop Route Map"
                        className="w-full max-w-[220px] mx-auto mt-2 mb-2 rounded-xl shadow-md object-cover"
                      />
                    )}
                    {feature.title === 'Dynamic Re-routing' && (
                      <img
                        src="/dynamic_rerouting.png"
                        alt="Dynamic Re-routing Map"
                        className="w-full max-w-[220px] mx-auto mt-2 mb-2 rounded-xl shadow-md object-cover"
                      />
                    )}
                    {feature.title === 'Live Tracking' && (
                      <img
                        src="/live_tracking.png"
                        alt="Live Tracking Map"
                        className="w-full max-w-[220px] mx-auto mt-2 mb-2 rounded-xl shadow-md object-cover"
                      />
                    )}
                    {feature.title === 'Smart Delivery Management' && (
                      <img
                        src="/smart_delivery.png"
                        alt="Smart Delivery Management"
                        className="w-full max-w-[220px] mx-auto mt-2 mb-2 rounded-xl shadow-md object-cover"
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-700 text-sm sm:text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 sm:py-20 px-2 sm:px-4 relative z-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2 drop-shadow">30%</div>
                <p className="text-blue-700 text-sm sm:text-base">Faster Deliveries</p>
              </div>
              <div>
                <div className="text-2xl sm:text-4xl font-bold text-blue-700 mb-1 sm:mb-2 drop-shadow">100+</div>
                <p className="text-blue-700 text-sm sm:text-base">Daily Deliveries</p>
              </div>
              <div>
                <div className="text-2xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2 drop-shadow">98%</div>
                <p className="text-blue-700 text-sm sm:text-base">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-6 sm:py-8 px-2 sm:px-4 bg-white/80 backdrop-blur relative z-10">
          <div className="container mx-auto text-center text-blue-400 text-xs sm:text-base">
            <p>&copy; 2024 Logi.AI All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
