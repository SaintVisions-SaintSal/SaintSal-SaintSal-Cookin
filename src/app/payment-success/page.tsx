"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { userService } from '../../services/userService';
import { profileService } from '../../services/profileService';
import { CheckCircle, Loader2, AlertCircle, ArrowRight, Sparkles, Clock } from 'lucide-react';
import * as motion from "motion/react-client";

interface PaymentSuccessData {
  sessionId: string;
  role: string;
  tier: string;
  status?: string; // 'verified', 'pending_verification', 'completed'
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleUpdateStatus, setRoleUpdateStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false); // Track if we've already processed
  const [countdown, setCountdown] = useState<number | null>(null); // Countdown timer

  // Get tier display name
  const getTierDisplayName = (tierId: string) => {
    const tierNames: { [key: string]: string } = {
      'free': 'SaintSal™ FREE',
      'starter': 'SaintSal™ Starter - Unlimited',
      'pro': '🏆 SaintSal™ PRO',
      'teams': '🌟 SaintSal™ Ai Pro – Teams',
      'enterprise': '🕋 SaintSal™ Custom Enterprise Systems',
      'white-label': 'White Label',
      'custom': 'Custom',
    };
    return tierNames[tierId] || tierId;
  };

  const handleRoleUpdate = useCallback(async () => {
    if (!paymentData || hasProcessed) return;
    
    console.log('[PAYMENT SUCCESS] Starting role update process...');
    setHasProcessed(true); // Prevent re-runs
    setIsUpdatingRole(true);
    setRoleUpdateStatus('pending');

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Check if payment was already verified by backend
      if (paymentData.status === 'verified') {
        console.log('[PAYMENT SUCCESS] Payment already verified by backend, role already updated');
        setRoleUpdateStatus('success');
        
        // Just refresh the session to get updated user data
        console.log('[PAYMENT SUCCESS] Refreshing session to get updated user data...');
        await userService.refreshUserSession();
        console.log('[PAYMENT SUCCESS] Session refreshed');
        
        // Start countdown timer
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              console.log('[PAYMENT SUCCESS] Navigating to home...');
              router.push('/');
              return null;
            }
            return prev - 1;
          });
        }, 667); // ~667ms per count to fit 3 counts in 2 seconds
        
        setIsUpdatingRole(false);
        return;
      }

      // Update tier directly in Supabase using profileService
      console.log('[PAYMENT SUCCESS] Updating tier in Supabase:', paymentData.tier);
      
      const tierUpdated = await profileService.updateTier(
        paymentData.tier as 'free' | 'starter' | 'pro' | 'teams' | 'enterprise'
      );

      if (tierUpdated) {
        console.log('[PAYMENT SUCCESS] Tier updated successfully in Supabase');
        setRoleUpdateStatus('success');
        
        // Start countdown timer to redirect to homepage
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              console.log('[PAYMENT SUCCESS] Redirecting to homepage...');
              router.push('/');
              return null;
            }
            return prev - 1;
          });
        }, 667); // ~667ms per count to fit 3 counts in 2 seconds
      } else {
        throw new Error('Failed to update tier in database');
      }
    } catch (error) {
      console.error('Role update error:', error);
      setRoleUpdateStatus('failed');
      setError(error instanceof Error ? error.message : 'Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  }, [paymentData, router, hasProcessed]);

  // Extract payment data from URL parameters
  useEffect(() => {
    const sessionId = searchParams.get('session_id') || searchParams.get('transaction_id') || `ghl_${Date.now()}`;
    const plan = searchParams.get('plan');
    const tier = searchParams.get('tier') || plan || 'starter';
    const status = searchParams.get('status') || 'completed';

    // For GHL payments, we may not have session_id, so we create one
    if (plan || tier) {
      setPaymentData({
        sessionId,
        role: tier, // Use tier as role
        tier: tier, // Use tier
        status: status as 'verified' | 'pending_verification' | 'completed' | undefined
      });
    } else {
      // Check if this is a direct access (no payment data)
      setError('No payment session found. If you completed a payment, please contact support.');
    }
  }, [searchParams]);

  // Update user role after successful payment (only once)
  useEffect(() => {
    if (paymentData && !hasProcessed) {
      console.log('[PAYMENT SUCCESS] Payment data loaded, triggering role update');
      handleRoleUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData, hasProcessed]); // Only run when paymentData or hasProcessed changes


  const handleRetry = () => {
    setError(null);
    setHasProcessed(false); // Allow retry
    setRoleUpdateStatus('pending');
    handleRoleUpdate();
  };

  const handleContinue = () => {
    router.push('/');
  };

  if (error && !paymentData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Payment Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/pricing')}
            className="w-full bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Confetti Animation */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {typeof window !== 'undefined' && [...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][Math.floor(Math.random() * 5)]
              }}
              initial={{ y: -100, rotate: 0 }}
              animate={{ 
                y: window.innerHeight + 100, 
                rotate: 360,
                x: Math.random() * 200 - 100
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Main Content - Black Glass Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl overflow-hidden"
        >
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-3xl blur-xl" />
          
          {/* Inner glass effect */}
          <div className="absolute inset-[1px] bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
          {/* Success Icon with glow */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="mb-8 relative"
          >
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto relative drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-400" />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Payment Successful!
              </span>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              Welcome to the family!
            </p>
            <p className="text-lg text-gray-400">
              You are now a{' '}
              <span className="text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text font-bold">
                {paymentData ? getTierDisplayName(paymentData.tier) : 'Premium'}
              </span>{' '}
              member
            </p>
          </motion.div>

          {/* Session Info - Glass Card */}
          {paymentData && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 shadow-lg"
            >
              <p className="text-gray-400 text-sm mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Session ID
              </p>
              <p className="text-yellow-400 font-mono text-xs md:text-sm bg-black/30 px-4 py-2 rounded-xl border border-yellow-400/20 break-all">
                {paymentData.sessionId}
              </p>
            </motion.div>
          )}

          {/* Role Update Status - Glass Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <p className="text-gray-400 text-sm mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Account Status
            </p>
            {isUpdatingRole ? (
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                <span className="text-gray-300">Updating your account...</span>
              </div>
            ) : roleUpdateStatus === 'success' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-green-400 font-medium">
                    Account Upgraded!
                  </span>
                </div>
                <div className="bg-black/30 rounded-xl px-4 py-3 border border-green-400/20">
                  <p className="text-sm text-gray-300">
                    New Role: <span className="text-yellow-400 font-semibold">
                      {paymentData?.role ? paymentData.role.charAt(0).toUpperCase() + paymentData.role.slice(1) : 'Premium'}
                    </span>
                  </p>
                </div>
              </div>
            ) : roleUpdateStatus === 'failed' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 py-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Update Failed</span>
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
                )}
                <button
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
                >
                  Retry Update
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                <span className="text-gray-300">Preparing account...</span>
              </div>
            )}
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <p className="text-gray-400 leading-relaxed">
              Welcome to the <span className="text-white font-semibold">SaintVision AI</span> family! 
            </p>
            <p className="text-gray-500 text-sm mt-2">
              You now have access to all premium features
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            {roleUpdateStatus === 'success' ? (
              <div className="relative">
                {/* Countdown Card - Black Glass Design */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 shadow-2xl overflow-hidden">
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl blur-lg" />
                  
                  {/* Animated progress bar at bottom */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 origin-left"
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    {/* Left side - Icon and text */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
                        <ArrowRight className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold text-lg">
                          Redirecting to Home
                        </p>
                        <p className="text-gray-400 text-sm">
                          Preparing your workspace...
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side - Countdown */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400 animate-pulse" />
                      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                        {countdown !== null ? (
                          <motion.span 
                            key={countdown}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent tabular-nums"
                          >
                            {countdown}
                          </motion.span>
                        ) : (
                          <Loader2 className="w-7 h-7 text-yellow-400 animate-spin" />
                        )}
                        <span className="text-gray-400 text-sm font-medium">sec</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Manual continue button below */}
                <button
                  onClick={handleContinue}
                  className="w-full mt-3 backdrop-blur-xl bg-white/5 border border-white/10 text-gray-400 font-medium py-3 px-6 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 text-sm flex items-center justify-center gap-2 group"
                >
                  <span>Skip and continue now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg"
                >
                  Continue to Home
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full bg-transparent border border-white/10 text-gray-400 font-semibold py-3 px-6 rounded-xl hover:bg-white/5 hover:text-gray-300 transition-all duration-300"
                >
                  Back to Pricing
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading payment confirmation...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
