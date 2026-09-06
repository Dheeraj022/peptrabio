'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/layout/Logo';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
  LogIn,
  UserPlus,
  LogOut,
  LifeBuoy,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Verify', href: '/verify' },
    ...(user ? [{ name: 'Support', href: '/support' }] : []),
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Policies', href: '/policies' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 sm:h-28 py-2">
          
          {/* Brand Logo */}
          <Logo size="header" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-full font-orbitron text-xs font-semibold tracking-wider transition-all ${
                    active
                      ? 'bg-brand-light text-brand shadow-sm'
                      : 'text-content-secondary hover:text-brand hover:bg-brand-subtle'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Tools (Search, User Auth, Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full text-content-secondary hover:text-brand hover:bg-brand-subtle transition-colors"
              aria-label="Search catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* User Login / Register or Account Dropdown */}
            {user ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand-light/60 hover:bg-brand-light text-brand text-xs font-orbitron font-semibold transition-all shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-brand-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-brand-border">
                      <div className="font-orbitron font-bold text-xs text-content-primary truncate">{user.name}</div>
                      <div className="text-[10px] text-content-muted truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-content-primary hover:bg-brand-subtle hover:text-brand font-orbitron font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Account</span>
                    </Link>
                    <Link
                      href="/support"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-content-primary hover:bg-brand-subtle hover:text-brand font-orbitron font-medium transition-colors"
                    >
                      <LifeBuoy className="w-3.5 h-3.5" />
                      <span>Support Tickets</span>
                    </Link>
                    <div className="border-t border-brand-border my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-accent-danger hover:bg-red-50 font-orbitron font-medium transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5">
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-brand-border bg-surface-soft hover:border-brand text-content-secondary hover:text-brand text-xs font-orbitron font-medium transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-brand hover:bg-brand-dark text-white text-xs font-orbitron font-semibold transition-all shadow-purple-sm hover:shadow-purple-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>REGISTER</span>
                </Link>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 bg-brand hover:bg-brand-dark text-white rounded-full shadow-purple-sm transition-all hover:scale-105"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-brand border border-brand text-[10px] font-orbitron font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-content-primary hover:bg-brand-light transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input Row */}
        {searchOpen && (
          <div className="py-3 border-t border-brand-border animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peptide by name, sequence, CAS, or keyword (e.g. Selank, BPC-157)..."
                className="w-full pl-10 pr-24 py-2.5 bg-brand-subtle border border-brand-border rounded-full text-xs font-sans text-content-primary placeholder-content-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                autoFocus
              />
              <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-brand text-white font-orbitron text-[11px] font-medium rounded-full hover:bg-brand-dark transition-colors"
              >
                FIND
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white p-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-orbitron text-sm font-semibold ${
                  isActive(link.href)
                    ? 'bg-brand text-white'
                    : 'text-content-primary hover:bg-brand-subtle'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Link>
            ))}
          </nav>

          {/* User Auth Section in Mobile Drawer */}
          <div className="pt-4 border-t border-brand-border space-y-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-brand-light rounded-xl flex items-center justify-between">
                  <div className="font-orbitron text-xs font-bold text-brand">{user.name}</div>
                  <span className="text-[10px] text-content-muted">{user.email}</span>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-brand-border text-xs font-orbitron font-semibold text-content-primary hover:bg-brand-subtle"
                >
                  <span className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-brand" />
                    <span>My Account</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-content-muted" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-orbitron font-semibold text-accent-danger hover:bg-red-50"
                >
                  <span className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-brand-border text-xs font-orbitron font-medium text-content-primary hover:bg-brand-subtle text-center"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-brand text-white text-xs font-orbitron font-semibold text-center shadow-purple-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>REGISTER</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

