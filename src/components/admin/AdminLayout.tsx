'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import { getCurrentAdmin, setCurrentAdmin, AdminUser } from '@/lib/admin-store';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentAdmin, setCurrentAdminState] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check local admin session or demo access
    const auth = localStorage.getItem('peptrabio_admin_auth');
    if (auth === 'true' || pathname === '/admin/login') {
      setIsAuthenticated(true);
      setCurrentAdminState(getCurrentAdmin());
    } else {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    setCurrentAdmin(null);
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return <div className="p-12 text-center font-orbitron text-xs text-purple-300">Checking credentials...</div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products Catalog', href: '/admin/products', icon: Package },
    { name: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
    { name: 'Authenticity Codes', href: '/admin/verification', icon: ShieldCheck },
    { name: 'Support Tickets', href: '/admin/tickets', icon: LifeBuoy },
    { name: 'Orders Management', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#160E24] text-white p-4 flex items-center justify-between border-b border-purple-900/60">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-7 h-7 bg-white rounded-lg p-0.5">
            <Image src="/images/logo.png" alt="Peptra Bio" fill className="object-contain" />
          </div>
          <span className="font-orbitron font-bold text-sm">PEPTRA BIO ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#120B1D] text-gray-300 flex flex-col justify-between border-r border-purple-900/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0 overflow-y-auto ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-white p-1 shadow-purple-sm shrink-0">
              <Image src="/images/logo.png" alt="Peptra Bio" fill className="object-contain" priority />
            </div>
            <div>
              <div className="font-orbitron font-bold text-sm text-white tracking-wider">
                PEPTRA<span className="text-purple-400">ADMIN</span>
              </div>
              <div className="text-[10px] font-orbitron text-purple-300">Catalog & Orders</div>
            </div>
          </div>

          {/* Logged in Admin Profile Badge */}
          {currentAdmin && (
            <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-800/80 flex items-center space-x-2.5 shadow-inner">
              <div className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-orbitron font-bold text-xs shrink-0">
                {currentAdmin.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {currentAdmin.name}
                </div>
                <div className="text-[10px] text-purple-300 font-orbitron truncate">
                  {currentAdmin.role}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all ${
                    active
                      ? 'bg-brand text-white shadow-purple-sm'
                      : 'text-gray-400 hover:text-white hover:bg-purple-950/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-purple-900/40 space-y-3 shrink-0">
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center justify-between text-xs text-purple-300 hover:text-white transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Store</span>
            </span>
            <span className="text-[10px] font-mono bg-purple-900 px-1.5 py-0.5 rounded">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-orbitron text-gray-400 hover:text-accent-danger hover:bg-purple-950/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </main>

    </div>
  );
}
