"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Sparkles } from 'lucide-react';

const TIER_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  model: string;
  credits: string;
  compute: string;
  icon: string;
}> = {
  free: {
    label: 'FREE',
    color: '#9CA3AF',
    bg: '#1a1a22',
    border: '#9CA3AF30',
    model: 'SAL Mini',
    credits: '100 credits/mo',
    compute: 'Standard · Shared inference',
    icon: '✦',
  },
  starter: {
    label: 'STARTER',
    color: '#818CF8',
    bg: '#1a1a2e',
    border: '#818CF830',
    model: 'SAL Pro',
    credits: '500 credits/mo',
    compute: 'Standard · Priority queue',
    icon: '◈',
  },
  pro: {
    label: 'PRO',
    color: '#F59E0B',
    bg: '#1c1800',
    border: '#F59E0B30',
    model: 'SAL Max',
    credits: '2,000 credits/mo',
    compute: 'High-performance · Claude Sonnet',
    icon: '⭐',
  },
  teams: {
    label: 'TEAMS',
    color: '#22C55E',
    bg: '#001a08',
    border: '#22C55E30',
    model: 'SAL Max Fast',
    credits: '10,000 credits/mo',
    compute: 'Burst-capable · 10 seats · GHL CRM',
    icon: '🌟',
  },
  enterprise: {
    label: 'ENTERPRISE',
    color: '#EC4899',
    bg: '#1a001a',
    border: '#EC489930',
    model: 'All Models',
    credits: 'Unlimited',
    compute: 'Dedicated · HACP™ Protocol · White-label',
    icon: '🕋',
  },
};

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState('');
  const [activeTierKey, setActiveTierKey] = useState('free');
  const [ready, setReady] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const planParam = searchParams.get('plan') || 'free';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth');
        return;
      }

      const user = session.user;
      const name =
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'there';
      setDisplayName(name as string);
      setIsConfirmed(!!user.email_confirmed_at);

      supabase
        .from('profiles')
        .select('full_name, tier, compute_tier')
        .eq('id', user.id)
        .single()
        .then(({ data, error: _err }) => {
          if (data?.full_name) setDisplayName(data.full_name as string);
          const tierFromDb = (data?.tier as string) || planParam;
          setActiveTierKey(tierFromDb);
          setReady(true);
        });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsConfirmed(!!session.user.email_confirmed_at);
      } else if (event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, planParam]);

  const handleResendConfirmation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email: session.user.email });
      alert(error ? 'Error sending confirmation. Try again.' : 'Confirmation email sent! Check your inbox.');
    }
  };

  const tier = TIER_CONFIG[activeTierKey] || TIER_CONFIG.free;

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0C0C0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0C0C0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300,
        background: `radial-gradient(ellipse at center, ${tier.color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `linear-gradient(135deg, ${tier.color}30, transparent)`,
          border: `1px solid ${tier.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, margin: '0 auto',
        }}>
          ⚡
        </div>
      </div>

      {/* Greeting */}
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' }}>
        WELCOME TO SAINTSAL™
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 800, color: '#E8E6E1', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5, lineHeight: 1.15 }}>
        Ready, {displayName}.
      </h1>

      {/* Tier badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginTop: 20, marginBottom: 28,
        paddingInline: 16, paddingBlock: 8,
        borderRadius: 999,
        backgroundColor: tier.bg,
        border: `1px solid ${tier.border}`,
      }}>
        <span style={{ fontSize: 14 }}>{tier.icon}</span>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: tier.color }}>
          {tier.label}
        </span>
      </div>

      {/* Compute allocation card */}
      <div style={{
        width: '100%', maxWidth: 400,
        backgroundColor: '#111116',
        border: `1px solid ${tier.border}`,
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
      }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#444455', marginBottom: 16, textTransform: 'uppercase' }}>
          YOUR COMPUTE ALLOCATION
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'AI Model', value: tier.model },
            { label: 'Credits', value: tier.credits },
            { label: 'Compute', value: tier.compute },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#E8E6E1', fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Email confirmation notice if not confirmed */}
      {!isConfirmed && (
        <div style={{
          width: '100%', maxWidth: 400,
          backgroundColor: '#1a1500',
          border: '1px solid #F59E0B30',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
            📧 Confirm your email to unlock all features.
          </p>
          <button
            onClick={handleResendConfirmation}
            style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 12, whiteSpace: 'nowrap' }}
          >
            Resend →
          </button>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => router.push('/chat')}
        style={{
          width: '100%', maxWidth: 400,
          height: 54,
          borderRadius: 14,
          backgroundColor: tier.color,
          color: '#0C0C0F',
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 0.5,
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Sparkles size={16} />
        Enter SAL →
      </button>

      <p style={{ marginTop: 24, fontSize: 10, color: '#333344', letterSpacing: 1 }}>
        US Patent #10,290,222 · HACP Protocol · Saint Vision Technologies LLC
      </p>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0C0C0F' }} />}>
      <WelcomeContent />
    </Suspense>
  );
}
