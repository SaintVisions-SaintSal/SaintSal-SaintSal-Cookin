"use client";

import React from 'react';
import * as motion from "motion/react-client";
import { CreditCard, ExternalLink, TestTube } from "lucide-react";
import { useRouter } from 'next/navigation';

const testPaymentLinks = [
  {
    id: 'test-1',
    name: 'Test Payment 1',
    url: 'https://buy.stripe.com/test_7sY5kDdmc2Ype0YdTe4Vy03',
    description: 'First test payment link',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'test-2',
    name: 'Test Payment 2',
    url: 'https://buy.stripe.com/test_00w9ATeqg2YpaOMeXi4Vy02',
    description: 'Second test payment link',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'test-3',
    name: 'Test Payment 3',
    url: 'https://buy.stripe.com/test_bJe8wP2HycyZ3mk6qM4Vy01',
    description: 'Third test payment link',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'test-4',
    name: 'Test Payment 4',
    url: 'https://buy.stripe.com/test_00w4gzdmc42te0YeXi4Vy00',
    description: 'Fourth test payment link',
    color: 'from-orange-500 to-red-500'
  }
];

export default function PaymentTestPage() {
  const router = useRouter();

  const handlePaymentClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center mb-6"
            >
              <TestTube className="h-12 w-12 text-yellow-400 mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Payment Test Links
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Test Stripe payment links for development and testing purposes
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
            >
              ← Back
            </motion.button>
          </div>
        </div>
      </div>

      {/* Payment Test Buttons */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testPaymentLinks.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${payment.color} mr-4`}>
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{payment.name}</h3>
                      <p className="text-gray-300">{payment.description}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Test URL:</p>
                  <div className="bg-black/20 rounded-lg p-3 border border-gray-600">
                    <code className="text-xs text-gray-300 break-all">
                      {payment.url}
                    </code>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePaymentClick(payment.url)}
                  className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r ${payment.color} text-white font-semibold text-lg hover:shadow-lg hover:shadow-${payment.color.split('-')[1]}-500/25 transition-all duration-300 flex items-center justify-center`}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Test Payment {index + 1}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8"
        >
          <div className="flex items-start">
            <TestTube className="h-6 w-6 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Testing Instructions</h3>
              <div className="space-y-3 text-gray-300">
                <p>• These are test Stripe payment links for development purposes</p>
                <p>• Use test card numbers: 4242 4242 4242 4242 (Visa), 4000 0000 0000 0002 (Visa declined)</p>
                <p>• Use any future expiry date (e.g., 12/34) and any 3-digit CVC</p>
                <p>• Test payments will not charge real money</p>
                <p>• Check your Stripe dashboard for test payment records</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
