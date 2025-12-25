"use client";

import React, { useState } from 'react';
import * as motion from "motion/react-client";
import { 
  Check,
  Star,
  Zap,
  Users,
  Building,
  CreditCard,
  Shield,
  AlertCircle
} from "lucide-react";
import { useRouter } from 'next/navigation';
import EnterpriseContactModal from '@/components/EnterpriseContactModal';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/lib/supabase';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  buttonText: string;
  paymentUrl: string;
  isPopular?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'SaintSal™ FREE',
    price: '$0',
    description: 'Perfect for getting started with AI assistance',
    features: [
      '50 monthly requests',
      'Basic AI models (GPT-4o-mini)',
      'Standard response time',
      'Community support',
      'Basic features access'
    ],
    buttonText: 'Get Started Free',
    paymentUrl: 'https://buy.gohighlevel.com/694671739e4922feddcc3e1e',
    icon: Zap,
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'starter',
    name: '🫧 SaintSal™ Starter - Unlimited',
    price: '$27',
    description: 'Unlimited access to core AI features',
    features: [
      '500 monthly requests',
      'Advanced AI models (GPT-4o-mini, GPT-4o)',
      'Voice capabilities',
      'Priority response time',
      'Email support',
      'All basic features'
    ],
    buttonText: 'Start Unlimited',
    paymentUrl: 'https://buy.gohighlevel.com/69464c136d52f05832acd6d5',
    icon: Star,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'pro',
    name: '🏆 SaintSal™ PRO',
    price: '$97',
    description: 'Professional AI solutions for businesses',
    features: [
      '2,000 monthly requests',
      'All AI models (GPT-4o, Claude-3, Gemini)',
      'Voice capabilities',
      'WarRoom access',
      'API access',
      'Priority support',
      'Advanced analytics',
      'Custom integrations'
    ],
    buttonText: 'Get Pro',
    paymentUrl: 'https://buy.gohighlevel.com/694677961e9e6a5435be0d10',
    isPopular: true,
    icon: Building,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'teams',
    name: '🌟 SaintSal™ Ai Pro – Teams',
    price: '$297',
    description: 'Team collaboration with 10 seats included',
    features: [
      '10,000 monthly requests',
      'All AI models',
      'Voice capabilities',
      'WarRoom access',
      '10 team member seats',
      'Team management dashboard',
      'Shared AI resources',
      'Team analytics',
      'Admin controls',
      'Bulk operations'
    ],
    buttonText: 'Get Teams',
    paymentUrl: 'https://buy.gohighlevel.com/69467a30d0aaf6f7a96a8d9b',
    icon: Users,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'enterprise',
    name: '🕋 SaintSal™ Custom Enterprise Systems',
    price: '$497',
    description: 'Enterprise-grade AI solutions with unlimited capabilities',
    features: [
      'Unlimited requests (999,999+)',
      'All AI models + custom training',
      'Voice capabilities',
      'WarRoom access',
      'Unlimited team seats',
      'Dedicated account manager',
      'Custom AI training & fine-tuning',
      '99.9% SLA guarantees',
      'On-premise deployment options',
      'Advanced compliance (HIPAA, SOC2, GDPR)',
      '24/7 priority phone support',
      'Custom integrations & API access',
      'White-label solutions',
      '$100 complimentary credits monthly'
    ],
    buttonText: 'Buy Now',
    paymentUrl: 'https://buy.gohighlevel.com/69467bdcccecbd04ba5f18a7',
    icon: Building,
    color: 'from-gray-600 to-gray-800'
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  const formatFeatureValue = (value: string) => {
    if (value === 'Yes') {
      return <span className="text-green-400 flex items-center justify-center gap-1"><Check size={16} /> Yes</span>;
    }
    if (value === 'No') {
      return <span className="text-red-400">No</span>;
    }
    return <span className="text-gray-400">{value}</span>;
  };

  const handleSelectPlan = async (tier: PricingTier) => {
    setIsProcessing(true);
    setSelectedTier(tier.id);
    setError(null);
    
    try {
      // For all GHL payments, redirect directly to GHL payment link
      // GHL will handle the success/cancel redirects back to our app
      window.location.href = tier.paymentUrl;
      
    } catch (error) {
      setError('Failed to open payment page. Please try again.');
      setIsProcessing(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* App Header */}
      <AppHeader />
      
      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="p-6 pt-24 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose What&apos;s <span className="text-cyan-400">Best for You</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From personal use to enterprise solutions, find the perfect plan for your needs. All plans include our core AI features with no hidden fees.
          </p>
        </div>

        {/* Personal Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Personal Plans</h3>
            <p className="text-gray-400">Perfect for individuals and small teams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.filter(tier => ['free', 'starter', 'pro'].includes(tier.id)).map((tier, index) => (
            <motion.div
              key={tier.id}
              className={`relative bg-gray-800/50 rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col h-full ${
                tier.isPopular 
                  ? 'border-yellow-400/50 bg-gradient-to-b from-gray-800/70 to-gray-800/50' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                  <tier.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  {tier.originalPrice && (
                    <span className="text-lg text-gray-400 line-through ml-2">{tier.originalPrice}</span>
                  )}
                  {tier.id !== 'enterprise' && tier.price !== 'Contact Sales' && (
                    <span className="text-gray-400 text-sm block">per month</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              {tier.id === 'enterprise' ? (
                <div className="space-y-3">
                  <motion.button
                    onClick={() => handleSelectPlan(tier)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-lg font-semibold transition-all duration-300 min-h-[48px] flex items-center justify-center bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing && selectedTier === tier.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      tier.buttonText
                    )}
                  </motion.button>
                  
                  {/* Contact Information */}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-2">Or Contact Sales:</p>
                    <div className="space-y-2">
                      <a 
                        href="tel:+19494169971"
                        className="block w-full py-2 px-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                      >
                        📞 +1 949-416-9971
                      </a>
                      <a 
                        href="mailto:support@hacpglobal.ai"
                        className="block w-full py-2 px-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                      >
                        ✉️ support@hacpglobal.ai
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 min-h-[48px] flex items-center justify-center ${
                    tier.isPopular
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing && selectedTier === tier.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    tier.buttonText
                  )}
                </motion.button>
              )}
            </motion.div>
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="mx-6 px-4 py-2 bg-gray-800/50 rounded-full border border-white/20">
            <span className="text-gray-400 text-sm font-medium">Business Solutions</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Business Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Business Plans</h3>
            <p className="text-gray-400">Designed for teams and enterprise organizations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {pricingTiers.filter(tier => ['teams', 'enterprise'].includes(tier.id)).map((tier, index) => (
            <motion.div
              key={tier.id}
              className={`relative bg-gray-800/50 rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col h-full ${
                tier.isPopular 
                  ? 'border-yellow-400/50 bg-gradient-to-b from-gray-800/70 to-gray-800/50' 
                  : 'border-white/20 hover:border-white/40'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                  <tier.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  {tier.originalPrice && (
                    <span className="text-lg text-gray-400 line-through ml-2">{tier.originalPrice}</span>
                  )}
                  {tier.id !== 'enterprise' && tier.price !== 'Contact Sales' && (
                    <span className="text-gray-400 text-sm block">per month</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              {tier.id === 'enterprise' ? (
                <div className="space-y-3">
                  <motion.button
                    onClick={() => handleSelectPlan(tier)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-lg font-semibold transition-all duration-300 min-h-[48px] flex items-center justify-center bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing && selectedTier === tier.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      tier.buttonText
                    )}
                  </motion.button>
                  
                  {/* Contact Information */}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-2">Or Contact Sales:</p>
                    <div className="space-y-2">
                      <a 
                        href="tel:+19494169971"
                        className="block w-full py-2 px-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                      >
                        📞 +1 949-416-9971
                      </a>
                      <a 
                        href="mailto:support@hacpglobal.ai"
                        className="block w-full py-2 px-3 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                      >
                        ✉️ support@hacpglobal.ai
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 min-h-[48px] flex items-center justify-center ${
                    tier.isPopular
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing && selectedTier === tier.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    tier.buttonText
                  )}
                </motion.button>
              )}
            </motion.div>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Feature Comparison
          </h3>
          
          <div className="bg-gray-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-4 text-white font-semibold">Features</th>
                    {pricingTiers.map((tier) => (
                      <th key={tier.id} className="text-center p-4 text-white font-semibold">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { 
                      feature: 'AI Chat Interactions', 
                      free: 'Limited', 
                      unlimited: 'Unlimited', 
                      pro: 'Unlimited', 
                      teams: 'Unlimited',
                      enterprise: 'Unlimited'
                    },
                    { 
                      feature: 'Response Time', 
                      free: 'Standard', 
                      unlimited: 'Priority', 
                      pro: 'Priority', 
                      teams: 'Priority',
                      enterprise: 'Ultra Priority'
                    },
                    { 
                      feature: 'AI Models', 
                      free: 'Basic', 
                      unlimited: 'Advanced', 
                      pro: 'All Models', 
                      teams: 'All Models',
                      enterprise: 'All + Custom'
                    },
                    { 
                      feature: 'Support', 
                      free: 'Community', 
                      unlimited: 'Email', 
                      pro: 'Priority', 
                      teams: 'Priority',
                      enterprise: '24/7 Phone'
                    },
                    { 
                      feature: 'API Access', 
                      free: 'No', 
                      unlimited: 'No', 
                      pro: 'Yes', 
                      teams: 'Yes',
                      enterprise: 'Advanced API'
                    },
                    { 
                      feature: 'Analytics', 
                      free: 'Basic', 
                      unlimited: 'Basic', 
                      pro: 'Advanced', 
                      teams: 'Advanced',
                      enterprise: 'Custom Analytics'
                    },
                    { 
                      feature: 'Team Members', 
                      free: '1', 
                      unlimited: '1', 
                      pro: '1', 
                      teams: '5',
                      enterprise: 'Unlimited'
                    },
                    { 
                      feature: 'Custom Integrations', 
                      free: 'No', 
                      unlimited: 'No', 
                      pro: 'Yes', 
                      teams: 'Yes',
                      enterprise: 'Full Custom'
                    },
                    { 
                      feature: 'SLA Guarantee', 
                      free: 'No', 
                      unlimited: 'No', 
                      pro: 'No', 
                      teams: 'No',
                      enterprise: '99.9% Uptime'
                    },
                    { 
                      feature: 'Dedicated Support', 
                      free: 'No', 
                      unlimited: 'No', 
                      pro: 'No', 
                      teams: 'No',
                      enterprise: 'Account Manager'
                    }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-gray-700/20">
                      <td className="p-4 text-gray-300 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">{formatFeatureValue(row.free)}</td>
                      <td className="p-4 text-center">{formatFeatureValue(row.unlimited)}</td>
                      <td className="p-4 text-center">{formatFeatureValue(row.pro)}</td>
                      <td className="p-4 text-center">{formatFeatureValue(row.teams)}</td>
                      <td className="p-4 text-center text-cyan-400 font-medium">{formatFeatureValue(row.enterprise)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-700/30 border-t border-white/10">
              <p className="text-center text-gray-400 text-sm">
                <span className="text-cyan-400 font-medium">Enterprise</span> features are fully customizable based on your organization&apos;s specific needs. 
                Contact our sales team to discuss your requirements.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-white font-semibold mb-3">Can I change my plan anytime?</h4>
              <p className="text-gray-400 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we&apos;ll prorate any billing differences.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-white font-semibold mb-3">Is there a free trial?</h4>
              <p className="text-gray-400 text-sm">
                Our Free plan gives you access to basic features with limited usage. No credit card required to get started.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-white font-semibold mb-3">What payment methods do you accept?</h4>
              <p className="text-gray-400 text-sm">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe payment processor.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-white font-semibold mb-3">Can I cancel anytime?</h4>
              <p className="text-gray-400 text-sm">
                Absolutely. You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-white font-semibold mb-3">Do you offer custom pricing?</h4>
              <p className="text-gray-400 text-sm">
                Yes! For enterprise customers and custom requirements, we offer tailored solutions. Contact our sales team to discuss your specific needs.
              </p>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h4 className="text-white font-semibold mb-3">What&apos;s included in Enterprise?</h4>
              <p className="text-gray-400 text-sm">
                Enterprise plans include unlimited seats, dedicated account management, custom AI training, SLA guarantees, and 24/7 support.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Trust */}
        <div className="bg-gray-800/30 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={24} className="text-green-400" />
            <h3 className="text-xl font-bold text-white">Secure & Trusted</h3>
          </div>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Your payments are processed securely through Stripe, the same payment processor used by millions of businesses worldwide. 
            We never store your payment information on our servers.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CreditCard size={16} />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} />
              <span>Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Contact Modal */}
      <EnterpriseContactModal 
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
      />
    </div>
  );
}
