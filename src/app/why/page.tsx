'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Star, Shield, Zap, Globe, Brain, Lock, Target, Sparkles, Key, Crown, Heart, User, GraduationCap, BarChart3, Rocket, Gem, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WhyPage() {
  const router = useRouter();

  const timeline = [
    {
      year: '2016',
      title: 'The Vision Begins',
      description: 'Founded our vision and filed patent 10,290,222, marking the beginning of our journey to create AI that serves humanity with purpose.',
      icon: Sparkles
    },
    {
      year: '2019',
      title: 'Patent Approval',
      description: 'Secured full patent approval for our foundational technology, establishing our intellectual property foundation.',
      icon: Key
    },
    {
      year: '2022',
      title: 'HACP Research Initiative',
      description: 'Advanced our technology development and initiated comprehensive research on the Human-AI Collaboration Protocol.',
      icon: Rocket
    },
    {
      year: '2024',
      title: 'Saint Vision Group LLC Launch',
      description: 'Launched Saint Vision Group LLC as an AI brokerage platform. Established Saint Vision Tech and secured patent 10,290,222 assignment. Filed HACP patent.',
      icon: Gem
    },
    {
      year: '2025',
      title: 'HACP Trademark & Patent Approval',
      description: 'Achieved HACP trademark and patent approval, ushering in a new era of advanced AI collaboration technology.',
      icon: Trophy
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </motion.button>
            <h1 className="text-xl font-bold text-white">Why SaintVision</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                What Separates
              </h2>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-400 mb-6">
                SaintVision AI™
              </h3>
              <p className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                We&apos;re not just building AI. We&apos;re building the future of human potential, where technology serves purpose and intelligence serves the heart.
              </p>
              
              {/* Feature Chips */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <motion.div
                  className="px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-full text-white text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <Key size={16} className="inline mr-1" /> Patented HACP™ Technology
                </motion.div>
                <motion.div
                  className="px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full text-white text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart size={16} className="inline mr-1" /> Faith-Guided Innovation
                </motion.div>
                <motion.div
                  className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-white text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown size={16} className="inline mr-1" /> Enterprise-Grade Solutions
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket size={16} className="inline mr-1" /> Start Your Journey
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <Key size={48} className="text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Patented HACP™ Technology</h3>
                <p className="text-gray-300">U.S. Patent 10,290,222. Adaptive emotional intelligence with intelligent escalation.</p>
              </motion.div>

              <motion.div
                className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Heart size={48} className="text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Faith-Guided Innovation</h3>
                <p className="text-gray-300">Technology with purpose, built on service, integrity, and care.</p>
              </motion.div>

              <motion.div
                className="p-8 bg-green-500/5 border border-green-500/20 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Shield size={48} className="text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Enterprise-Grade Security</h3>
                <p className="text-gray-300">GDPR, CCPA, SOC 2 with AES-256 and zero-trust architecture.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Additional Capabilities */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <Zap size={48} className="text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Adaptive Intelligence</h3>
                <p className="text-gray-300">SaintSal doesn&apos;t just respond—it learns, adapts, and grows with you. Real-time emotional calibration ensures every interaction feels personal and meaningful.</p>
              </motion.div>

              <motion.div
                className="p-8 bg-purple-500/5 border border-purple-500/20 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Globe size={48} className="text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Global Impact Focus</h3>
                <p className="text-gray-300">From healthcare to education and enterprise—deployed where it matters most, changing lives at scale.</p>
              </motion.div>

              <motion.div
                className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-2xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <User size={48} className="text-orange-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Human-Centered Design</h3>
                <p className="text-gray-300">Every interface and interaction is designed with human dignity at its core.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                className="text-center p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-2">$75M+</div>
                <div className="text-gray-300 text-sm">Patent Portfolio Value</div>
              </motion.div>

              <motion.div
                className="text-center p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-2">99.9%</div>
                <div className="text-gray-300 text-sm">Uptime Guarantee</div>
              </motion.div>

              <motion.div
                className="text-center p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-2">25+</div>
                <div className="text-gray-300 text-sm">AI Tools & Features</div>
              </motion.div>

              <motion.div
                className="text-center p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
                <div className="text-gray-300 text-sm">Purpose-Driven</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Company Timeline */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-white text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              Our Journey
            </motion.h2>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-6"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                      {item.year}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-600 mt-4"></div>
                    )}
                  </div>
                  <div className="flex-1 p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      {React.createElement(item.icon, { size: 24, className: "text-yellow-400" })}
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Effortlessly Powerful */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Effortlessly Powerful</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Complex AI technology made simple. Our interfaces are designed for humans, not engineers.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-white mb-8">One-Click AI Deployment</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check size={14} className="text-black font-bold" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Instant Setup</h4>
                      <p className="text-gray-300">Deploy enterprise-grade AI in under 5 minutes. No technical expertise required.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check size={14} className="text-black font-bold" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Intuitive Interface</h4>
                      <p className="text-gray-300">Natural conversation flows that feel like talking to your smartest colleague.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check size={14} className="text-black font-bold" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Zero Learning Curve</h4>
                      <p className="text-gray-300">Start getting value immediately. Our AI adapts to you, not the other way around.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="p-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl backdrop-blur-sm">
                  <div className="text-6xl font-bold text-blue-400 mb-4">5min</div>
                  <div className="text-xl font-semibold text-white mb-2">Average Setup Time</div>
                  <div className="text-gray-300">From zero to AI-powered in minutes</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Technology Stack</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built on Azure Cognitive Services with patented HACP™ protocol and military-grade security.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <Brain size={32} className="text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">Azure AI</h3>
                <p className="text-gray-300 text-sm">Microsoft&apos;s enterprise AI infrastructure powers our cognitive engine</p>
              </motion.div>

              <motion.div
                className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Key size={48} className="text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">HACP™ Protocol</h3>
                <p className="text-gray-300 text-sm">Patented adaptive escalation technology (US 10,290,222)</p>
              </motion.div>

              <motion.div
                className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Zap size={32} className="text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">Real-Time Sync</h3>
                <p className="text-gray-300 text-sm">Millisecond response times with global edge deployment</p>
              </motion.div>

              <motion.div
                className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Target size={32} className="text-green-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">Multi-Modal AI</h3>
                <p className="text-gray-300 text-sm">Text, voice, image, and gesture recognition in one platform</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Detail Lists */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Lock size={24} className="text-white" />
                  <h3 className="text-lg font-bold text-white">Security & Compliance</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• SOC 2 Type II Certified</li>
                  <li>• GDPR & CCPA Compliant</li>
                  <li>• AES-256 Encryption</li>
                  <li>• Zero-Trust Architecture</li>
                </ul>
              </motion.div>

              <motion.div
                className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Star size={24} className="text-white" />
                  <h3 className="text-lg font-bold text-white">Performance & Scale</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• 99.9% Uptime SLA</li>
                  <li>• Auto-scaling Infrastructure</li>
                  <li>• Global CDN Distribution</li>
                  <li>• Millisecond Response Times</li>
                </ul>
              </motion.div>

              <motion.div
                className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={24} className="text-white" />
                  <h3 className="text-lg font-bold text-white">AI Capabilities</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>• OpenAI ChatGPT & Claude Integration</li>
                  <li>• Custom Model Training</li>
                  <li>• Emotional Intelligence</li>
                  <li>• Adaptive Learning</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Real-World Applications */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Real-World <span className="text-green-400">Applications</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                See how Saint Vision AI transforms industries and changes lives across healthcare, education, and enterprise.
              </p>
            </motion.div>

            <div className="space-y-12">
              {/* Healthcare & Therapy */}
              <motion.div
                className="p-8 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Heart size={24} className="text-red-400" />
                  <h3 className="text-xl font-bold text-white">Healthcare & Therapy</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Athena.ai revolutionizes patient care with adaptive therapy protocols and emotional intelligence that helps stroke patients, ADHD management, and autism support programs.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>40% faster recovery rates in stroke rehabilitation</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>85% patient engagement improvement</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>HIPAA-compliant with family integration</span>
                  </div>
                </div>
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="text-3xl font-bold text-red-400 mb-2">95%</div>
                  <div className="text-white font-semibold mb-1">Patient Satisfaction</div>
                  <div className="text-gray-300 text-sm">Athena.ai therapy programs</div>
                </div>
              </motion.div>

              {/* Enterprise Operations */}
              <motion.div
                className="p-8 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 size={24} className="text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Enterprise Operations</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  PartnerTech.ai and our WarRoom platform streamline business operations, automate workflows, and provide intelligent insights that drive growth and efficiency.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>Automated CRM routing and lead qualification</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>Real-time business intelligence dashboards</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>24/7 AI-powered customer support</span>
                  </div>
                </div>
                <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="text-3xl font-bold text-blue-400 mb-2">300%</div>
                  <div className="text-white font-semibold mb-1">ROI Increase</div>
                  <div className="text-gray-300 text-sm">Enterprise implementations</div>
                </div>
              </motion.div>

              {/* Education & Training */}
              <motion.div
                className="p-8 bg-gray-900/50 border border-gray-700 rounded-xl backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap size={24} className="text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Education & Training</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  SVTTeach.ai transforms learning with adaptive curricula that scale from individual tutoring to enterprise training programs, all powered by our HACP™ escalation protocol.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>Personalized learning paths for every student</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>Real-time progress tracking and insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span>Scalable from 1 to 10,000+ learners</span>
                  </div>
                </div>
                <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <div className="text-3xl font-bold text-purple-400 mb-2">67%</div>
                  <div className="text-white font-semibold mb-1">Learning Speed</div>
                  <div className="text-gray-300 text-sm">Improvement vs traditional methods</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience the Difference?</h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Join organizations discovering what happens when AI meets purpose.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket size={16} className="inline mr-1" /> Start Your Journey
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
