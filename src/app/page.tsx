"use client";

import * as motion from "motion/react-client";
import Image from 'next/image';
import { Heart, Users, Zap, Clock, ArrowRight, CheckCircle, Play, BarChart3, MessageSquare, TrendingUp, Users2, Shield, Sparkles, Send, Target, Zap as Lightning, Lock, Building2, Crown, UserCheck, Tag, MessageCircle, Mic, FileText, Palette, Save, Star, User, Menu, X, Mail, Phone, Smartphone } from "lucide-react";
import CompanyMarquee from "@/components/CompanyMarquee";
import StrategyCards from "@/components/StrategyCards";
import EnterpriseContactModal from "@/components/EnterpriseContactModal";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);
  const [showMobileAppBanner, setShowMobileAppBanner] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
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
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when mobile menu is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);


  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/20 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <motion.div 
              className="flex items-center gap-2 text-xl font-bold text-white"
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
                { name: 'Web Assistant', href: '/screen-share' },
                { name: 'Agent Hub', href: '/agent-hub' },
                { name: 'API Guide', href: '/api-guide' },
                { name: 'Support', href: '/help' },
                { name: 'Pricing', href: '/pricing' },
                // { name: 'Payment Test', href: '/payment-test' } // Commented out - can be re-enabled if needed
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
                { name: 'Web Assistant', href: '/screen-share' },
                { name: 'Agent Hub', href: '/agent-hub' },
                { name: 'API Guide', href: '/api-guide' },
                { name: 'Support', href: '/help' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Payment Test', href: '/payment-test' }
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

      {/* Mobile App Banner */}
      {showMobileAppBanner && (
        <motion.div
          className="fixed top-16 md:top-14 left-0 right-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-xl border-b border-white/20 shadow-2xl"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Smartphone size={20} className="text-white flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    🎉 New Mobile App Now Available!
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://apps.apple.com/us/app/saintsal/id6752356451"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/30 hover:bg-black/50 rounded-lg border border-white/30 transition-all duration-200 text-white text-xs sm:text-sm font-medium"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 2.18 7.59 9.5 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      App Store
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.saintvision.faithfulapp&hl=en_US"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/30 hover:bg-black/50 rounded-lg border border-white/30 transition-all duration-200 text-white text-xs sm:text-sm font-medium"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      Google Play
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMobileAppBanner(false)}
                className="text-white/80 hover:text-white transition-colors p-1 flex-shrink-0"
                aria-label="Close banner"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section id="home" className={`min-h-screen flex items-center justify-center relative overflow-hidden ${showMobileAppBanner ? 'pt-20 md:pt-16' : ''}`}>
        <div className="relative z-10 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Sparkles size={16} />
            New
          </motion.div>
          
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
              <Image 
                src="/logo.png" 
                alt="SaintSal™ Logo" 
                width={80}
                height={80}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl"
              />
              <div className="text-center sm:text-left">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white">
                  SaintSal™
                </div>
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light text-center">
                  Cookin&apos; Knowledge
                </div>
              </div>
            </div>
            <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Responsible Intelligence
            </span>
          </motion.h1>
          
          <motion.p
            className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed font-light px-6 sm:px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Powered by patented HACP™ technology. Your playground to test and train agents, customize AI assistants, and get hands-free help with 24/7 AI and human support.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={() => router.push('/why')}
              className="group w-full max-w-xs sm:w-auto px-6 py-4 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-base sm:text-sm mx-auto sm:mx-0"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Why SaintSal
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.a
              href="/auth?redirect=/warroom"
              className="group w-full max-w-xs sm:w-auto px-6 py-4 sm:py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-base sm:text-sm mx-auto sm:mx-0"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} className="group-hover:scale-110 transition-transform" />
              Try WarRoom
            </motion.a>
          </motion.div>

          {/* Trust Section */}
          <motion.div
            className="text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-gray-400 mb-6 text-base">Over 50+ businesses trust us</p>
            <div className="max-w-4xl mx-auto">
              <CompanyMarquee />
            </div>
          </motion.div>
        </div>
      </section>


      {/* Interactive Dashboard Section */}
      <section className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Our Services
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI Solutions That Take Your
              <span className="block bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Business to the Next Level
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We design, develop, and implement automation tools that help you work smarter, not harder with our patented HACP™ technology.
            </p>
          </motion.div>

          {/* Strategy Cards Component */}
          <StrategyCards />
        </div>
      </section>

      {/* WarRoom Section */}
      <section id="warroom" className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              WarRoom
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Playground to Test and
              <span className="block bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Train Your Agents
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Interactive command center where you can test, train, and perfect your AI agents before deployment. Experiment with different configurations and see real-time results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* WarRoom Features */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Target size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Agent Testing Lab</h3>
              <p className="text-gray-300 mb-6">
                Test your AI agents in a controlled environment with real-time feedback, performance metrics, and instant deployment capabilities.
              </p>
              <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                <li>Real-time agent testing</li>
                <li>Performance analytics</li>
                <li>Instant deployment</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Lightning size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Training Ground</h3>
              <p className="text-gray-300 mb-6">
                Train your agents with custom datasets, fine-tune responses, and optimize performance before going live.
              </p>
              <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                <li>Custom training data</li>
                <li>Response optimization</li>
                <li>Performance tuning</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Live Experimentation</h3>
              <p className="text-gray-300 mb-6">
                Experiment with different agent configurations, test various scenarios, and see immediate results in a safe environment.
              </p>
              <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                <li>Live configuration testing</li>
                <li>Scenario simulation</li>
                <li>Safe experimentation</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section id="ai-assistant" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - AI Assistant Description */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              AI Assistant
            </div>
              
              <h3 className="text-4xl font-bold text-white mb-6">
                Hands-Free AI Help
              </h3>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Get instant help with voice commands, text chat, and real-time streaming. Our AI assistant provides 
                24/7 support for all your business needs with patented HACP™ technology.
              </p>
              
              <div className="flex gap-4 mb-8">
                <button className="px-6 py-3 bg-gray-800/50 border border-gray-600 text-white rounded-xl font-medium hover:bg-gray-700/50 transition-all duration-300">
                  Voice Chat
                </button>
                <button className="px-6 py-3 bg-gray-800/50 border border-gray-600 text-white rounded-xl font-medium hover:bg-gray-700/50 transition-all duration-300">
                  Real-time Streaming
                </button>
                <button className="px-6 py-3 bg-gray-800/50 border border-gray-600 text-white rounded-xl font-medium hover:bg-gray-700/50 transition-all duration-300">
                  24/7 Support
                </button>
              </div>
            </motion.div>

            {/* Right Side - AI Chat Interface */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-6">
                <h4 className="text-white text-lg font-semibold mb-2">What can I help with?</h4>
                <p className="text-gray-400 text-sm">
                  Whether you want help in customer handling or make changes in your system just give me command
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                  <MessageSquare size={20} className="text-indigo-400" />
                  <span className="text-white">Add document</span>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gray-800/50 backdrop-blur-md border border-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-all duration-300">
                    Analyze
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-800/50 backdrop-blur-md border border-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-all duration-300">
                    Generate Image
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-800/50 backdrop-blur-md border border-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-all duration-300">
                    Research
                  </button>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                  <input
                    type="text"
                    placeholder="Type your command here..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                  />
                  <Send size={20} className="text-indigo-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Web Assistant Section */}
      <section id="web-assistant" className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Web Assistant
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI Help on
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Any Webpage
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get instant AI assistance while browsing any website. Our web assistant can analyze page content, extract insights, and provide intelligent help without leaving your current page.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Web Assistant Features */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Page Analysis</h3>
                    <p className="text-gray-300">
                      Instantly analyze any webpage content, extract key information, and get intelligent insights about what you&apos;re viewing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Real-time Assistance</h3>
                    <p className="text-gray-300">
                      Get instant help with questions about the current page, find specific information, or get recommendations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Target size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Context-Aware Help</h3>
                    <p className="text-gray-300">
                      Our AI understands the context of the page you&apos;re viewing and provides relevant, targeted assistance.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Web Assistant Preview */}
            <motion.div
              className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">Web Assistant - Current Page</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">What&apos;s the main topic of this page?</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">This page discusses AI automation for businesses, focusing on workflow optimization and team collaboration tools.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">Find contact information</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">Contact info found: support@saintvision.com, +1-555-0123. Located in the footer section.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
                  <div className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-sm">Ask about this page...</span>
                  </div>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Ask
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents-hub" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Agents Hub
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Customize Your Agents
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Based on Your Needs
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Create specialized AI agents for different business functions with our advanced customization platform. Choose from multiple agent modes and tailor them to your specific requirements.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Agent Modes */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 h-90 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Building2 size={20} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Enterprise Agent</h3>
              <p className="text-gray-300 mb-4 text-sm flex-1">
                Strategic business intelligence and executive decision support for enterprise operations.
              </p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Market analysis</li>
                <li>• Executive insights</li>
                <li>• Strategic planning</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 h-90 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Crown size={20} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Founder Agent</h3>
              <p className="text-gray-300 mb-4 text-sm flex-1">
                Personal strategic advisor with warm, confident New York style for founders and entrepreneurs.
              </p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Personal counsel</li>
                <li>• Strategic advice</li>
                <li>• Business guidance</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 h-90 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <UserCheck size={20} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Customer Agent</h3>
              <p className="text-gray-300 mb-4 text-sm flex-1">
                Professional customer service and support agent for handling client interactions.
              </p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Customer support</li>
                <li>• Issue resolution</li>
                <li>• Service excellence</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 h-90 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <Tag size={20} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">White Label</h3>
              <p className="text-gray-300 mb-4 text-sm flex-1">
                Customizable enterprise solution for partners with client branding integration.
              </p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Custom branding</li>
                <li>• Partner integration</li>
                <li>• Scalable deployment</li>
              </ul>
            </motion.div>

            {/* AI Development Card with Scrolling Code */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 relative overflow-hidden h-90 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <FileText size={20} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">AI Development</h3>
              <p className="text-gray-300 mb-4 text-sm flex-1">
                Our team builds intelligent automation systems tailored to your business processes.
              </p>
              
              {/* Code Editor Window */}
              <div className="bg-gray-800/80 rounded-lg border border-gray-600 overflow-hidden flex-1">
                {/* Window Header */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-700/50 border-b border-gray-600">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-400 text-xs font-mono">main.py</div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded"></div>
                  </div>
                </div>
                
                {/* Scrolling Code Content */}
                <div className="relative overflow-hidden h-24">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-800 to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-800 to-transparent z-10 pointer-events-none"></div>
                  <motion.div
                    className="p-2 text-xs font-mono"
                    animate={{ y: [0, -30, -60, -90, -120, -150, -180, -210, -240, -270, -300, 0] }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div className="text-purple-400 mb-2">class AutomationTrigger:</div>
                    <div className="text-gray-300 ml-4">
                      <div>def __init__(self, threshold):</div>
                      <div className="ml-4">self.threshold = threshold</div>
                      <div className="ml-4">self.status = &quot;inactive&quot;</div>
                      <div className="mt-2">def check_trigger(self, value):</div>
                      <div className="ml-4">if value &gt; self.threshold:</div>
                      <div className="ml-8">self.status = &quot;active&quot;</div>
                      <div className="ml-8">return &quot;Automation triggered!&quot;</div>
                      <div className="ml-4">else:</div>
                      <div className="ml-8">return &quot;No action taken.&quot;</div>
                    </div>
                    <div className="h-8"></div>
                    <div className="text-purple-400 mb-2">def get_status(self):</div>
                    <div className="text-gray-300 ml-4">
                      <div>return f&quot;Status: {`{`}self.status{`}`}&quot;</div>
                    </div>
                    <div className="h-8"></div>
                    <div className="text-purple-400 mb-2"># Initialize automation</div>
                    <div className="text-gray-300">
                      <div>trigger = AutomationTrigger(threshold=0.8)</div>
                      <div>result = trigger.check_trigger(0.9)</div>
                      <div>print(result)  # Automation triggered!</div>
                    </div>
                    <div className="h-8"></div>
                    <div className="text-purple-400 mb-2">class AutomationTrigger:</div>
                    <div className="text-gray-300 ml-4">
                      <div>def __init__(self, threshold):</div>
                      <div className="ml-4">self.threshold = threshold</div>
                      <div className="ml-4">self.status = &quot;inactive&quot;</div>
                      <div className="mt-2">def check_trigger(self, value):</div>
                      <div className="ml-4">if value &gt; self.threshold:</div>
                      <div className="ml-8">self.status = &quot;active&quot;</div>
                      <div className="ml-8">return &quot;Automation triggered!&quot;</div>
                      <div className="ml-4">else:</div>
                      <div className="ml-8">return &quot;No action taken.&quot;</div>
                    </div>
                    <div className="h-8"></div>
                    <div className="text-purple-400 mb-2">def get_status(self):</div>
                    <div className="text-gray-300 ml-4">
                      <div>return f&quot;Status: {`{`}self.status{`}`}&quot;</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Benefits Section */}
      <section className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Benefits
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Key Benefits of AI for Your
              <span className="block bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Business Growth
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how AI automation enhances efficiency, reduces costs, and drives business growth with smarter, faster processes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Increased Productivity",
                description: "Gain actionable insights with AI-driven analytics to improve decision-making and strategy.",
                icon: Zap,
                gradient: "from-indigo-500 to-purple-500"
              },
              {
                title: "Better Customer Experience",
                description: "Personalized AI interactions improve response times, customer engagement, and overall satisfaction.",
                icon: Heart,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "24/7 Availability",
                description: "AI-powered systems operate around the clock, ensuring seamless support and execution without downtime.",
                icon: Clock,
                gradient: "from-pink-500 to-red-500"
              },
              {
                title: "Cost Reduction",
                description: "AI automation minimizes manual work, cuts operational costs, and optimizes resource allocation for better profitability.",
                icon: TrendingUp,
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "Data-Driven Insights",
                description: "Leverage AI to analyze vast data sets, identify trends, and make smarter, faster, and more accurate business decisions.",
                icon: BarChart3,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Scalability & Growth",
                description: "AI adapts to your business needs, allowing you to scale efficiently without increasing workload or costs.",
                icon: Users2,
                gradient: "from-orange-500 to-yellow-500"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-gray-700 p-8 shadow-2xl hover:shadow-3xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="mb-6">
                    <benefit.icon size={48} className="text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teams Section */}
      <section className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Teams
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Collaborate with
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Your Team
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Create teams, manage members, and collaborate on AI projects with enterprise-grade team management features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Features */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Users size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Team Management</h3>
              <p className="text-gray-300 mb-6">
                Create and manage teams with up to 5 members, assign roles, and control access to AI agents and features.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Up to 5 team members</li>
                <li>• Role-based permissions</li>
                <li>• Admin controls</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Users2 size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Collaboration</h3>
              <p className="text-gray-300 mb-6">
                Share AI agents, collaborate on projects, and work together on automation workflows with your team.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Shared AI agents</li>
                <li>• Project collaboration</li>
                <li>• Workflow sharing</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Lock size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Security & Control</h3>
              <p className="text-gray-300 mb-6">
                Enterprise-grade security with team-level permissions, audit logs, and secure data sharing.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Team permissions</li>
                <li>• Audit trails</li>
                <li>• Secure sharing</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Why Businesses Love Our
              <span className="block bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                AI Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real businesses, real results with AI automation.
            </p>
          </motion.div>

          {/* Horizontal Marquee Container */}
          <div className="relative overflow-hidden">
            {/* Fade overlay at left */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            
            {/* Fade overlay at right */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            
            {/* Marquee Content */}
            <motion.div
              className="flex gap-8 py-8"
              animate={{ 
                x: [0, -400, -400, -800, -800, -1200, -1200, -1600, -1600, -2000, -2000, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
              }}
            >
              {/* Duplicate the testimonials for seamless loop */}
              {[
                {
                  quote: "AI automation transformed our operations by eliminating repetitive tasks and improving efficiency. Scaling our workflow has never been easier!",
                  author: "James Carter",
                  role: "CEO at TechFlow Solutions",
                  avatar: "JC",
                  rating: 5
                },
                {
                  quote: "With AI, we cut manual work and improved accuracy. Our team now focuses on high-impact tasks while automation handles the rest!",
                  author: "Sophia Martinez",
                  role: "Operations Manager at NexaCorp",
                  avatar: "SM",
                  rating: 5
                },
                {
                  quote: "AI-driven insights doubled our sales efficiency. We now engage leads at the right time with smarter, data-backed decisions!",
                  author: "David Reynolds",
                  role: "Head of Sales at GrowthPeak",
                  avatar: "DR",
                  rating: 5
                },
                {
                  quote: "Customer support is now seamless. Our response time improved drastically, and satisfaction levels are at an all-time high, thanks to SaintVision™ AI™",
                  author: "Emily Wong",
                  role: "Customer Success Lead at SupportHive",
                  avatar: "EW",
                  rating: 5
                },
                {
                  quote: "The HACP™ protocol gives us confidence that our AI interactions are ethical and responsible. It&apos;s exactly what we needed for our enterprise deployment.",
                  author: "Michael Chen",
                  role: "CTO at Enterprise Solutions Inc.",
                  avatar: "MC",
                  rating: 5
                },
                {
                  quote: "SaintVision™ AI™ helped us automate our entire customer onboarding process. What used to take days now happens in minutes!",
                  author: "Sarah Johnson",
                  role: "VP of Operations at ScaleCorp",
                  avatar: "SJ",
                  rating: 5
                }
              ].concat([
                {
                  quote: "AI automation transformed our operations by eliminating repetitive tasks and improving efficiency. Scaling our workflow has never been easier!",
                  author: "James Carter",
                  role: "CEO at TechFlow Solutions",
                  avatar: "JC",
                  rating: 5
                },
                {
                  quote: "With AI, we cut manual work and improved accuracy. Our team now focuses on high-impact tasks while automation handles the rest!",
                  author: "Sophia Martinez",
                  role: "Operations Manager at NexaCorp",
                  avatar: "SM",
                  rating: 5
                },
                {
                  quote: "AI-driven insights doubled our sales efficiency. We now engage leads at the right time with smarter, data-backed decisions!",
                  author: "David Reynolds",
                  role: "Head of Sales at GrowthPeak",
                  avatar: "DR",
                  rating: 5
                },
                {
                  quote: "Customer support is now seamless. Our response time improved drastically, and satisfaction levels are at an all-time high, thanks to SaintVision™ AI™",
                  author: "Emily Wong",
                  role: "Customer Success Lead at SupportHive",
                  avatar: "EW",
                  rating: 5
                },
                {
                  quote: "The HACP™ protocol gives us confidence that our AI interactions are ethical and responsible. It&apos;s exactly what we needed for our enterprise deployment.",
                  author: "Michael Chen",
                  role: "CTO at Enterprise Solutions Inc.",
                  avatar: "MC",
                  rating: 5
                },
                {
                  quote: "SaintVision™ AI™ helped us automate our entire customer onboarding process. What used to take days now happens in minutes!",
                  author: "Sarah Johnson",
                  role: "VP of Operations at ScaleCorp",
                  avatar: "SJ",
                  rating: 5
                }
              ]).map((testimonial, index) => (
                <div
                  key={`${testimonial.author}-${index}`}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl flex-shrink-0 w-96"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center text-black font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{testimonial.author}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  {/* Star Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        size={16}
                        className="text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-300 text-lg leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Chat Interface
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Intelligent
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Conversations
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Chat with SAINTSAL™ AI assistant using text or voice. Get instant responses with advanced natural language processing.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Chat Features */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageCircle size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Text Chat</h3>
                    <p className="text-gray-300">
                      Natural language conversations with SAINTSAL™ AI assistant for instant responses and support.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Voice Chat</h3>
                    <p className="text-gray-300">
                      Speak naturally with voice-to-text and text-to-speech capabilities for hands-free interaction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Real-time Streaming</h3>
                    <p className="text-gray-300">
                      Get instant responses with real-time streaming and WebSocket connections for seamless conversations.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat Interface Preview */}
            <motion.div
              className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-4">SAINTSAL™ Chat</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">How can you help me with my business operations?</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">I can help you automate workflows, analyze data, manage teams, and optimize your business processes. What specific area would you like to focus on?</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">Set up automated customer onboarding</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">I&apos;ll create an automated customer onboarding workflow for you. This will include welcome emails, account setup, and progress tracking...</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
                  <div className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2">
                    <span className="text-gray-400 text-sm">Type your message...</span>
                  </div>
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky Notes Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Sticky Notes
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Digital
              <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Productivity
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Capture ideas, organize thoughts, and boost productivity with our digital sticky notes system.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sticky Notes Features */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Quick Notes</h3>
                    <p className="text-gray-300">
                      Capture ideas instantly with colorful sticky notes that sync across all your devices.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Palette size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Color Coding</h3>
                    <p className="text-gray-300">
                      Organize your notes with different colors for different categories and priorities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Save size={16} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Auto-Save</h3>
                    <p className="text-gray-300">
                      Never lose your ideas with automatic saving and cloud synchronization.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sticky Notes Preview */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
                  <span className="text-gray-400 text-sm">My Sticky Notes</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-200 rounded-lg p-4 shadow-lg">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Meeting Notes</h4>
                    <p className="text-gray-700 text-xs">Discuss project timeline with team</p>
                  </div>
                  
                  <div className="bg-pink-200 rounded-lg p-4 shadow-lg">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Ideas</h4>
                    <p className="text-gray-700 text-xs">New feature for mobile app</p>
                  </div>
                  
                  <div className="bg-blue-200 rounded-lg p-4 shadow-lg">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Tasks</h4>
                    <p className="text-gray-700 text-xs">Review quarterly reports</p>
                  </div>
                  
                  <div className="bg-green-200 rounded-lg p-4 shadow-lg">
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Reminders</h4>
                    <p className="text-gray-700 text-xs">Client call at 3 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-700">
                  <button className="bg-gray-800/50 border border-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-all duration-300">
                    + Add Note
                  </button>
                  <button className="bg-gray-800/50 border border-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700/50 transition-all duration-300">
                    Organize
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 24/7 AI Support Section */}
      <section id="support" className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Support
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              24/7 AI and
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Human Support
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get help whenever you need it with our round-the-clock support system. AI assistance for instant answers, human experts for complex issues.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Support */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Instant AI Support</h3>
              <p className="text-gray-300 mb-6">
                Get immediate answers to your questions with our AI-powered support system that&apos;s available 24/7.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Instant responses</li>
                <li>• 24/7 availability</li>
                <li>• Context-aware help</li>
              </ul>
            </motion.div>

            {/* Human Support */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Users size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Human Experts</h3>
              <p className="text-gray-300 mb-6">
                Connect with our team of experts for complex issues, custom solutions, and personalized assistance.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Expert consultation</li>
                <li>• Custom solutions</li>
                <li>• Priority support</li>
              </ul>
            </motion.div>

            {/* Best-in-Class Pricing */}
            <motion.div
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Best-in-Class Pricing</h3>
              <p className="text-gray-300 mb-6">
                Get enterprise-grade AI solutions at competitive prices with transparent, value-driven pricing models.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Transparent pricing</li>
                <li>• No hidden fees</li>
                <li>• Value-driven plans</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white/2 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-full text-gray-300 text-sm font-medium mb-8">
              Pricing
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your AI Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From free exploration to enterprise solutions, find the perfect plan for your needs
            </p>
          </motion.div>

          {/* Pricing Cards - Compact 5-card horizontal layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                name: "Free",
                price: "$0",
                period: "/month",
                description: "Perfect for getting started",
                features: [
                  "Basic AI chat",
                  "Limited interactions",
                  "Community support"
                ],
                buttonText: "Get Started",
                paymentUrl: "https://buy.stripe.com/7sY5kDdmc2Ype0YdTe4Vy03",
                popular: false
              },
              {
                name: "Unlimited",
                price: "$27",
                period: "/month",
                description: "Unlimited AI features",
                features: [
                  "Unlimited interactions",
                  "Priority support",
                  "Custom AI agents"
                ],
                buttonText: "Start Unlimited",
                paymentUrl: "https://buy.stripe.com/14A9ATgyogPf0a84iE4Vy09",
                popular: false
              },
              {
                name: "Pro",
                price: "$97",
                originalPrice: "$197",
                period: "/month",
                description: "Professional solutions",
                features: [
                  "Everything in Unlimited",
                  "Advanced analytics",
                  "API access",
                  "Team collaboration"
                ],
                buttonText: "Get Pro",
                paymentUrl: "https://buy.stripe.com/bJefZh0zqdD3aOMdTe4Vy05",
                popular: true
              },
              {
                name: "Teams",
                price: "$297",
                period: "/month",
                description: "Team collaboration",
                features: [
                  "Everything in Pro",
                  "5 team seats",
                  "Team dashboard",
                  "Admin controls"
                ],
                buttonText: "Get Teams",
                paymentUrl: "https://buy.stripe.com/4gM9ATaa0buVaOM7uQ4Vy06",
                popular: false
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "Enterprise solutions",
                features: [
                  "Everything in Teams",
                  "Unlimited seats",
                  "Dedicated manager",
                  "24/7 support"
                ],
                buttonText: "Buy Now",
                paymentUrl: "https://buy.stripe.com/8wMeY9gage6j7eg4gh",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`relative rounded-2xl p-4 border-2 flex flex-col ${
                  plan.popular 
                    ? 'border-yellow-400 bg-yellow-400/5' 
                    : 'border-white/20 bg-white/5'
                } backdrop-blur-xl shadow-2xl`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    {plan.originalPrice && (
                      <span className="text-sm text-gray-400 line-through mr-1">{plan.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold text-yellow-400">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-300 text-xs">{plan.description}</p>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={async () => {
                    // For Enterprise, open contact modal
                    if (plan.name === 'Enterprise') {
                      setIsEnterpriseModalOpen(true);
                      return;
                    }
                    
                    // For teams, redirect to external pricing page
                    if (plan.name === 'Teams') {
                      window.open(plan.paymentUrl, '_blank', 'noopener,noreferrer');
                      return;
                    }

                    // For other tiers, redirect to Stripe with success/cancel URLs pointing to backend
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com';
                    
                    // Get current user session
                    const { data: { session } } = await supabase.auth.getSession();
                    const userId = session?.user?.id || '';
                    
                    const successUrl = `${backendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&role=${plan.name.toLowerCase()}&tier=${plan.name.toLowerCase()}&user_id=${userId}`;
                    const cancelUrl = `${backendUrl}/payment-cancelled`;
                    
                    // Create Stripe payment URL with success and cancel redirects
                    const stripeUrl = new URL(plan.paymentUrl);
                    stripeUrl.searchParams.set('success_url', successUrl);
                    stripeUrl.searchParams.set('cancel_url', cancelUrl);
                    
                    // Redirect to Stripe payment page
                    window.location.href = stripeUrl.toString();
                  }}
                  className={`w-full py-2 px-3 rounded-lg font-semibold transition-all duration-300 block text-center text-sm mt-auto ${
                    plan.popular
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : plan.buttonText}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        {/* Enhanced Background gradients */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-pink-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 rounded-full blur-3xl"></div>
        
        {/* Gradient Banner Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="relative bg-gradient-to-r from-purple-900/60 via-black/80 to-purple-900/60 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {/* Inner gradient overlay - darker in the middle */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-black/40 to-purple-500/5 rounded-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Let AI do the Work so you can
                <span className="block bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Scale Faster
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Book a Call Today and Start Automating
              </p>
              
              <div className="flex justify-center">
                <motion.button
                  onClick={() => router.push('/auth')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/20 py-12 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center gap-2 text-2xl font-bold text-white mb-4 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-white" />
              </div>
              SaintVision™ AI™
            </motion.div>
            
            <motion.div
              className="flex flex-col md:flex-row gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-center md:text-left">
                <h4 className="text-white font-semibold mb-2">Features</h4>
                <div className="space-y-1">
                  <a href="/auth" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">WarRoom</a>
                  <a href="/chat" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">AI Chat</a>
                  <a href="/agent-hub" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Agent Hub</a>
                  <a href="/api-guide" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">API Guide</a>
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h4 className="text-white font-semibold mb-2">Resources</h4>
                <div className="space-y-1">
                  <a href="/pricing" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Pricing</a>
                  <a href="/api-guide" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Documentation</a>
                  <a href="/help" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Support</a>
                  <a href="/privacy-policy" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Privacy Policy</a>
                  <a href="/account" className="block text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded-lg">Account</a>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-white font-semibold mb-2">Contact</h4>
                <div className="space-y-2">
                  <a href="mailto:support@hacpglobal.ai" className="block w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg border border-gray-600/50 hover:border-gray-500/50">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-cyan-400" />
                      <span className="text-sm">support@hacpglobal.ai</span>
                    </div>
                  </a>
                  <a href="tel:+19494169971" className="block w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg border border-gray-600/50 hover:border-gray-500/50">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-cyan-400" />
                      <span className="text-sm">+1 949-416-9971</span>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            className="mt-8 pt-8 border-t border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-gray-400">
              © 2024 SaintVision™ AI™. Automate Smarter, Optimize Faster, and Grow Stronger.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Enterprise Contact Modal */}
      <EnterpriseContactModal 
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
      />
    </div>
  );
}