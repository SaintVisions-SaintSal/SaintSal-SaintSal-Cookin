"use client";

import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";
import Image from 'next/image';
import { CheckCircle, ArrowRight, Sparkles, Shield, Users, Target, Brain, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const [user, setUser] = useState<{ email?: string; email_confirmed_at?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Check if user is confirmed
          if (session.user.email_confirmed_at) {
            setIsConfirmed(true);
          }
          
          setIsLoading(false);
        } else {
          // No session, redirect to auth
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        if (session.user.email_confirmed_at) {
          setIsConfirmed(true);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleContinue = () => {
    router.push('/');
  };

  const handleResendConfirmation = async () => {
    try {
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
        });
        
        if (error) {
          console.error('Error resending confirmation:', error);
          alert('Error resending confirmation email. Please try again.');
        } else {
          alert('Confirmation email sent! Please check your inbox.');
        }
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      alert('Error resending confirmation email. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4">
                  <Image
                    src="/logo.png"
                    alt="Saint Vision Logo"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Saint Vision
              </span>
            </h1>

            {isConfirmed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    🎉 Email Confirmed Successfully!
                  </h2>
                  <p className="text-lg text-gray-300 mb-6">
                    Your account has been verified and you&apos;re all set to explore the power of Saint Vision.
                  </p>
                  
                  <motion.button
                    onClick={handleContinue}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Enter Saint Vision
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="h-16 w-16 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    📧 Email Confirmation Required
                  </h2>
                  <p className="text-lg text-gray-300 mb-6">
                    We&apos;ve sent a confirmation email to <strong className="text-white">{user?.email}</strong>. 
                    Please check your inbox and click the confirmation link to activate your account.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={handleResendConfirmation}
                      className="inline-flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-semibold rounded-xl hover:bg-yellow-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Resend Confirmation Email
                    </motion.button>
                    
                    <motion.button
                      onClick={() => router.push('/auth')}
                      className="inline-flex items-center px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back to Login
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6 mt-16"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <Brain className="h-8 w-8 text-blue-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">AI-Powered Analysis</h3>
                </div>
                <p className="text-gray-300">
                  Leverage cutting-edge AI to analyze markets, trends, and strategic opportunities.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-purple-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Strategic Intelligence</h3>
                </div>
                <p className="text-gray-300">
                  Get real-time insights and strategic recommendations for your business decisions.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-green-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Collaborative Platform</h3>
                </div>
                <p className="text-gray-300">
                  Work together with your team in our secure, collaborative environment.
                </p>
              </div>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-400 mr-3" />
                  <h3 className="text-lg font-semibold text-white">Enterprise-Grade Security</h3>
                </div>
                <p className="text-gray-300 text-center">
                  Your data is protected with bank-level security and encryption. 
                  We&apos;re committed to keeping your strategic information safe and confidential.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>
      </header>
    </div>
  );
}
