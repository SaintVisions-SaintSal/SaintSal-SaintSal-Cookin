"use client";

import * as motion from "motion/react-client";
import Image from 'next/image';
import { User, Menu, X } from "lucide-react";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu when clicking outside and handle body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/20 shadow-2xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <motion.div 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-xl font-bold text-white cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <Image 
              src="/logo.png" 
              alt="SaintSal™ Logo" 
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
            />
            SaintSal™
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {[
              { name: 'WarRoom', href: '/warroom' },
              { name: 'AI Chat', href: '/chat' },
              { name: 'Web Assistant', href: '/web-assistant' },
              { name: 'Agent Hub', href: '/agent-hub' },
              { name: 'API Guide', href: '/api-guide' },
              { name: 'Support', href: '/help' },
              { name: 'Pricing', href: '/pricing' },
            ].map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-white hover:text-indigo-400 transition-colors"
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            {user ? (
              <motion.button
                onClick={() => router.push('/account')}
                className="group px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                title="My Account"
              >
                <User size={18} />
                Account
              </motion.button>
            ) : (
              <motion.button
                onClick={() => router.push('/auth')}
                className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 text-white hover:text-indigo-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/20 shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-6 space-y-4">
            {[
              { name: 'WarRoom', href: '/warroom' },
              { name: 'AI Chat', href: '/chat' },
              { name: 'Web Assistant', href: '/web-assistant' },
              { name: 'Agent Hub', href: '/agent-hub' },
              { name: 'API Guide', href: '/api-guide' },
              { name: 'Support', href: '/help' },
              { name: 'Pricing', href: '/pricing' },
            ].map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="block text-white hover:text-indigo-400 transition-colors py-2 text-lg font-medium"
                onClick={() => setMobileMenuOpen(false)}
                whileHover={{ x: 10 }}
              >
                {item.name}
              </motion.a>
            ))}
              
            {/* Mobile Auth Button */}
            <div className="pt-4 border-t border-white/20">
              {user ? (
                <motion.button
                  onClick={() => {
                    router.push('/account');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User size={18} />
                  My Account
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    router.push('/auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}



