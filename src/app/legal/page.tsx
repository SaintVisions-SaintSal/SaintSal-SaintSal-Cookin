"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft,
  Shield,
  Lock,
  FileText,
  Heart,
  Building,
  Mail,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useRouter } from 'next/navigation';

export default function LegalPage() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    hacp: true,
    privacy: false,
    terms: false,
    ethics: false,
    ip: false,
    security: false,
    contact: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const LegalSection = ({ 
    title, 
    icon: Icon, 
    children, 
    sectionKey, 
    isExpanded 
  }: { 
    title: string; 
    icon: React.ComponentType<{ size?: number; className?: string }>; 
    children: React.ReactNode; 
    sectionKey: string; 
    isExpanded: boolean;
  }) => (
    <div className="mb-6 bg-gray-800/50 rounded-xl overflow-hidden border border-white/10">
      <button 
        className="w-full flex items-center justify-between p-6 bg-gray-700/50 hover:bg-gray-700/70 transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-3">
          <Icon size={24} className="text-blue-400" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/20 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Legal & Compliance</h1>
            <p className="text-sm text-gray-400">Saint Vision™ Group LLC</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* HACP™ Patent Technology */}
        <LegalSection 
          title="HACP™ Patent Technology" 
          icon={Shield}
          sectionKey="hacp"
          isExpanded={expandedSections.hacp}
        >
          <div className="bg-blue-600/20 p-6 rounded-lg mb-6 text-center border border-blue-500/30">
            <h4 className="text-xl font-bold text-white mb-2">U.S. Patent No. 10,290,222</h4>
            <p className="text-blue-200">Issued: May 2019 • Fully Enforceable</p>
          </div>
          
          <p className="text-gray-300 mb-4">
            The Human-AI Connection Protocol (HACP™) is the core adaptive intelligence framework that powers every Saint Vision™ interface — from SaintSal™&apos;s coaching flows to immersive therapy apps, onboarding flows, PartnerTech routing, and executive dashboards.
          </p>
          
          <p className="text-gray-300 mb-6">
            More than just a UX philosophy or prompting technique, HACP is a structured, adaptive, real-time escalation engine that tunes itself based on user ability, emotional state, task complexity, and timing feedback loops.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-blue-400 font-semibold mb-3">Adaptive Response System</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Escalating prompts (hint → cue → example → intervention)</li>
                <li>• Context-aware persona shifts</li>
                <li>• Multimodal inputs (gesture, text, gaze, sensor)</li>
                <li>• Real-time emotional calibration</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-blue-400 font-semibold mb-3">Patent Protection</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Issued: May 2019</li>
                <li>• Fully enforceable - no PTAB challenges</li>
                <li>• Covers adaptive tutoring systems</li>
                <li>• AR/VR rehabilitation guides</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-blue-400 font-semibold mb-3">Commercial Significance</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• $10M-$75M Licensing Value</li>
                <li>• Enterprise CRM Integration</li>
                <li>• Healthcare Therapy Ready</li>
              </ul>
            </div>
          </div>
        </LegalSection>

        {/* Privacy Policy */}
        <LegalSection 
          title="Privacy Policy" 
          icon={Lock}
          sectionKey="privacy"
          isExpanded={expandedSections.privacy}
        >
          <h4 className="text-green-400 text-lg font-semibold mb-4 text-center">We Protect What Matters</h4>
          <p className="text-gray-300 mb-6">
            Saint Vision™ Group LLC and its associated platforms (SaintSal™™, PartnerTech.ai, Athen.ai, EbyTech.ai, SVTlegal.ai, SVTteach.ai) are committed to the highest standards of privacy, data protection, and ethical conduct.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-green-400 font-semibold mb-3">🔒 What We Collect</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Name, email, phone (if you submit them)</li>
                <li>• Activity logs from SaintSal™ interactions</li>
                <li>• Optional CRM, calendar, financial data you connect</li>
                <li>• AI prompt content (with user opt-in only)</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-green-400 font-semibold mb-3">🤖 What We NEVER Do</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Sell your data</li>
                <li>• Share personal info without consent</li>
                <li>• Train external models with your inputs</li>
                <li>• Track you across other websites</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-green-400 font-semibold mb-3">💼 How We Protect It</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Encryption: AES-256 for stored data</li>
                <li>• Access Control: Supabase RLS</li>
                <li>• Infrastructure: Zero-trust architecture</li>
                <li>• Hosting: SOC 2-aligned stack</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-green-400 font-semibold mb-3">🌍 Global Compliance</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• GDPR (EU)</li>
                <li>• CCPA (California)</li>
                <li>• PIPEDA (Canada)</li>
                <li>• LGPD (Brazil)</li>
                <li>• UK DPA 2018</li>
              </ul>
            </div>
          </div>
        </LegalSection>

        {/* Terms of Service */}
        <LegalSection 
          title="Terms of Service" 
          icon={FileText}
          sectionKey="terms"
          isExpanded={expandedSections.terms}
        >
          <div className="space-y-6">
            <div>
              <h5 className="text-yellow-400 font-semibold mb-3">Service Usage</h5>
              <p className="text-gray-300 text-sm">
                By using SaintVision™ AI services, you agree to use our platform responsibly and in accordance with applicable laws and regulations. Our services are designed for legitimate business purposes and professional collaboration.
              </p>
            </div>

            <div>
              <h5 className="text-yellow-400 font-semibold mb-3">Account Responsibilities</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Maintain accurate account information</li>
                <li>• Protect your login credentials</li>
                <li>• Report security vulnerabilities</li>
                <li>• Use services in good faith</li>
              </ul>
            </div>

            <div>
              <h5 className="text-yellow-400 font-semibold mb-3">Intellectual Property</h5>
              <p className="text-gray-300 text-sm mb-2">
                All content, features, and functionality are owned by Saint Vision™ Group LLC and are protected by international copyright, trademark, and patent laws, including:
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• HACP™ Human-AI Connection Protocol</li>
                <li>• SaintSal™™ Adaptive AI Assistant</li>
                <li>• PartnerTech.ai CRM Integration</li>
                <li>• Patent No. 10,290,222 and pending CIP filings</li>
              </ul>
            </div>

            <div>
              <h5 className="text-yellow-400 font-semibold mb-3">Limitation of Liability</h5>
              <p className="text-gray-300 text-sm">
                Saint Vision™ Group LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability is limited to the amount paid for services in the 12 months preceding the claim.
              </p>
            </div>
          </div>
        </LegalSection>

        {/* AI Ethics & Disclosure */}
        <LegalSection 
          title="AI Ethics & Disclosure" 
          icon={Heart}
          sectionKey="ethics"
          isExpanded={expandedSections.ethics}
        >
          <div className="bg-purple-600/20 p-6 rounded-lg mb-6 text-center border border-purple-500/30">
            <p className="text-lg font-semibold text-white italic">
              &ldquo;This isn&apos;t AI. This is assistance. Intelligent. Accountable. Adaptive.&rdquo;
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-purple-400 font-semibold mb-3">✅ What SaintSal™™ Is</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• An always-on adaptive AI assistant</li>
                <li>• Trained with proprietary HACP™ logic</li>
                <li>• Designed to escalate when needed</li>
                <li>• Remembers only what matters to you</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-purple-400 font-semibold mb-3">❌ What SaintSal™™ Is NOT</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• A replacement for licensed professionals</li>
                <li>• A surveillance tool</li>
                <li>• A black-box language model</li>
                <li>• Disconnected from human oversight</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="text-purple-400 font-semibold mb-3">🧭 Ethical Principles</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Clarity over manipulation</li>
              <li>• Adaptation over interruption</li>
              <li>• Uplift over optimization</li>
              <li>• Transparency over performance</li>
              <li>• Emotional intelligence over raw data</li>
              <li>• Human dignity in every interaction</li>
            </ul>
          </div>
        </LegalSection>

        {/* IP Governance & Legal Structure */}
        <LegalSection 
          title="IP Governance & Legal Structure" 
          icon={Building}
          sectionKey="ip"
          isExpanded={expandedSections.ip}
        >
          <div className="space-y-6">
            <div>
              <h5 className="text-red-400 font-semibold mb-3">Corporate Structure</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Delaware LP IP Holding Structure: All patents held separately for risk isolation</li>
                <li>• Operational LLC: Day-to-day business operations with full licensing control</li>
                <li>• International Compliance: KYC + AML protocols for global operations</li>
                <li>• Fund Segregation: Investor and user funds separated under compliance firewall</li>
              </ul>
            </div>

            <div>
              <h5 className="text-red-400 font-semibold mb-3">Patent Portfolio</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• U.S. Patent No. 10,290,222</li>
                <li>• Interactive Tutorial with Escalating Prompts</li>
                <li>• Issued: May 2019</li>
                <li>• Status: Fully enforceable</li>
              </ul>
            </div>

            <div>
              <h5 className="text-red-400 font-semibold mb-3">Pending Filings</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• CIP extensions for HACP execution</li>
                <li>• Memory modules and persona systems</li>
                <li>• Advanced behavioral tier logic</li>
                <li>• Enterprise integration protocols</li>
              </ul>
            </div>

            <div>
              <h5 className="text-red-400 font-semibold mb-3">Licensed Technologies</h5>
              <p className="text-sm text-gray-300 mb-2">All operational tools are fully licensed and under Saint Vision™ Group control:</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• GoHighLevel CRM</li>
                <li>• Supabase Database</li>
                <li>• Azure Cloud Services</li>
                <li>• Twilio Communications</li>
                <li>• OpenAI API</li>
                <li>• Stripe Payments</li>
              </ul>
            </div>
          </div>
        </LegalSection>

        {/* Security & Compliance */}
        <LegalSection 
          title="Security & Compliance" 
          icon={Shield}
          sectionKey="security"
          isExpanded={expandedSections.security}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-cyan-400 font-semibold mb-3">Security Standards</h5>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• SOC 2 Type II Compliance</li>
                <li>• AES-256 Military-grade encryption</li>
                <li>• Zero Trust Network architecture</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-cyan-400 font-semibold mb-3">Regulatory Compliance</h5>
              <p className="text-sm text-gray-300 mb-2">
                Our services comply with international data protection regulations and industry standards to ensure your privacy rights and business requirements are fully protected.
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• GDPR (EU Compliance)</li>
                <li>• CCPA (California Privacy)</li>
                <li>• PIPEDA (Canada Privacy)</li>
                <li>• LGPD (Brazil Privacy)</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="text-cyan-400 font-semibold mb-3">Data Retention</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Default Users: 30 days for chat logs, immediate deletion upon request</li>
              <li>• Pro/Enterprise: Up to 365 days unless deleted, full user control</li>
            </ul>
          </div>
        </LegalSection>

        {/* Legal Contact */}
        <LegalSection 
          title="Legal Contact" 
          icon={Mail}
          sectionKey="contact"
          isExpanded={expandedSections.contact}
        >
          <p className="text-gray-300 mb-6">
            For legal inquiries, privacy concerns, compliance questions, or IP licensing opportunities, please contact our legal team:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-lime-400 font-semibold mb-3">General Legal</h5>
              <button
                onClick={() => openExternalLink('mailto:legal@saintvisionai.com')}
                className="text-blue-400 underline hover:text-blue-300 transition-colors"
              >
                legal@saintvisionai.com
              </button>
              <p className="text-sm text-gray-400 mt-2 italic">Privacy, compliance, general legal matters</p>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h5 className="text-lime-400 font-semibold mb-3">IP & Licensing</h5>
              <button
                onClick={() => openExternalLink('mailto:ip@saintvisionai.com')}
                className="text-blue-400 underline hover:text-blue-300 transition-colors"
              >
                ip@saintvisionai.com
              </button>
              <p className="text-sm text-gray-400 mt-2 italic">Patent licensing, IP partnerships</p>
            </div>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h5 className="text-lime-400 font-semibold mb-3">Corporate Information</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Entity: Saint Vision™ Group LLC</li>
              <li>• Jurisdiction: Delaware, United States</li>
              <li>• Registration: IP Holding Company + Operating LLC structure</li>
            </ul>
          </div>
        </LegalSection>

        {/* Footer */}
        <div className="bg-gray-800/50 rounded-xl p-6 text-center mt-8">
          <h4 className="text-white font-semibold mb-2">© 2025 Saint Vision™ Group LLC</h4>
          <p className="text-gray-400 text-sm mb-3">
            We protect your data. We respect your time. We serve your purpose. Built with patent-protected technology and faith-aligned values.
          </p>
          <p className="text-gray-500 text-xs italic">
            Protected by U.S. Patent No. 10,290,222
          </p>
        </div>
      </div>
    </div>
  );
}
