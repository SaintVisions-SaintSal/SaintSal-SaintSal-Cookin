"use client";

import React, { useState, useEffect, Suspense } from 'react';
import * as motion from "motion/react-client";
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, ArrowRight, Zap, Brain, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    };
    checkAuth();
  }, [router, redirectTo]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: 'https://saintsal.ai/welcome'
          }
        });

        if (error) throw error;
        setSuccess('Check your email for the confirmation link!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Sign in error:', error);
          console.error('Error details:', {
            message: error.message,
            status: error.status,
            name: error.name
          });
          
          // Provide specific error messages
          if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
            throw new Error('Configuration error: Missing NEXT_PUBLIC_SUPABASE_URL in Vercel. Add it and redeploy.');
          }
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. If you don\'t have an account, please sign up first.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and confirm your account before signing in.');
          }
          if (error.message.includes('User not found')) {
            throw new Error('No account found. Please sign up first by clicking "Sign up" below.');
          }
          
          throw error;
        }

        if (data.session) {
          console.log('✅ Sign in successful!', data.user?.email);
          router.push(redirectTo);
        } else {
          throw new Error('Failed to create session. Please try again.');
        }
      }
    } catch (error: unknown) {
      let errorMessage = 'An error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide user-friendly error messages
        if (errorMessage.includes('Invalid API key') || errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (errorMessage.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        } else if (errorMessage.includes('Password')) {
          errorMessage = 'Invalid password. Please try again or reset your password.';
        }
      }
      
      setError(errorMessage);
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign-in error:', error);
        throw error;
      }
      
      if (data.session) {
        router.push(redirectTo);
      } else {
        throw new Error('Failed to create anonymous session');
      }
    } catch (error: unknown) {
      let errorMessage = 'An error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide user-friendly error messages
        if (errorMessage.includes('Invalid API key')) {
          errorMessage = 'Configuration error. Please contact support.';
        }
      }
      
      setError(errorMessage);
      console.error('Anonymous auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Main Content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image 
                src="/logo.png" 
                alt="SaintSal™ Logo" 
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl"
              />
            </motion.div>
            
            <h1 className="text-3xl font-black text-white mb-2">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                SaintSal™
              </span>
            </h1>
            
            <p className="text-yellow-400 text-sm font-medium mb-2">
              Cookin&apos; Knowledge
            </p>
            
            <p className="text-gray-300 text-sm">
              {isSignUp ? 'Create your account for unlimited WarRoom access' : 'Sign in to access WarRoom'}
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all duration-200"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Anonymous Sign In */}
          <motion.button
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            className="w-full py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield className="w-4 h-4" />
            Continue as Guest (2 free requests)
          </motion.button>

          {/* Privacy Notice */}
          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-300">
                <p className="font-medium text-white mb-1">Privacy & Security</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>We don&apos;t collect or store your personal data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Sign up is completely free - no charges upfront</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Your conversations are encrypted and secure</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">AI-Powered</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Real-time</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">Precise</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AuthLoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Loading Content */}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="bg-gray-900/50 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-gray-400">Please wait while we prepare your authentication</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <AuthForm />
    </Suspense>
  );
}
