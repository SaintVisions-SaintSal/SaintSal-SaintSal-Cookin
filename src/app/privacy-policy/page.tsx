"use client";

import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  Shield,
  Trash2,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

type CardProps = {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
};

const SectionCard = ({ title, icon: Icon, children }: CardProps) => (
  <div className="bg-gray-800/50 border border-white/10 rounded-xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <Icon size={22} className="text-blue-400" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const lastUpdated = "December 11, 2025";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-5 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            Legal
          </p>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-xs text-gray-500 mt-1">Last updated {lastUpdated}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            We protect what matters most: your data and trust.
          </h2>
          <p className="text-sm text-blue-100">
            Saint Vision™ Group LLC (including SaintSal™, PartnerTech.ai, Athen.ai,
            EbyTech.ai, SVTlegal.ai, SVTteach.ai) follows strict privacy practices
            and only processes the minimum data required to deliver our services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SectionCard title="Data We Collect" icon={Lock}>
            <ul className="space-y-2">
              <li>• Account basics you provide (name, email, team details).</li>
              <li>• Supabase auth/session data (tokens, anonymous request counters, metadata you set).</li>
              <li>• Chat content you submit (messages, context files, saved chats) when you choose to save or process them.</li>
              <li>• Files you upload for PDF/text processing; extracted text is stored with your account.</li>
              <li>• Optional integrations you connect (e.g., CRM, calendar, storage).</li>
            </ul>
          </SectionCard>

          <SectionCard title="How We Use Data" icon={Shield}>
            <ul className="space-y-2">
              <li>• Deliver and improve Saint Vision™ services you request.</li>
              <li>• Secure accounts, prevent abuse, and detect fraud.</li>
              <li>• Provide support, billing, and product communications.</li>
              <li>• Process AI responses and file extraction you ask us to run.</li>
              <li>• Train internal systems only with explicit opt-in.</li>
            </ul>
          </SectionCard>

          <SectionCard title="What We Don’t Do" icon={Trash2}>
            <ul className="space-y-2">
              <li>• No selling personal data.</li>
              <li>• No third-party ad tracking pixels on core apps.</li>
              <li>• No sharing of customer content without consent or legal duty.</li>
              <li>• No using your prompts to train external foundation models.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Data Sharing" icon={Globe}>
            <ul className="space-y-2">
              <li>• Providers that help us operate: Supabase (auth/storage), backend hosting, support tools.</li>
              <li>• AI vendors we call on your behalf via our backend (OpenAI, Anthropic, Google Gemini) receive only the content needed to generate responses.</li>
              <li>• PDF extraction is handled by our backend API; uploaded PDFs are sent only for the extraction you request.</li>
              <li>• Disclosures required by law, regulatory request, or to prevent harm.</li>
              <li>• Cross-border transfers follow contractual and regional safeguards.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Security & Retention" icon={CheckCircle2}>
            <ul className="space-y-2">
              <li>• Encryption in transit (TLS) and at rest (AES-256).</li>
              <li>• Role-based access with logging and least-privilege controls.</li>
              <li>• Default log retention: 30 days for standard users, up to 365 days for Pro/Enterprise unless deleted sooner.</li>
              <li>• Chat history, uploaded files, and extracted text are stored with your account until you delete them or ask us to remove them (subject to legal holds).</li>
              <li>• Data deleted when you close your account or request removal, subject to legal holds.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Your Controls" icon={UserCheck}>
            <ul className="space-y-2">
              <li>• Request access, correction, or deletion of your data.</li>
              <li>• Export transcripts and uploaded files you own.</li>
              <li>• Manage consents for marketing, training, and integrations.</li>
              <li>• Opt out of non-essential cookies where applicable.</li>
            </ul>
          </SectionCard>
        </div>

        <div className="bg-gray-800/60 border border-white/10 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Mail size={22} className="text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white">Questions or requests</h3>
              <p className="text-sm text-gray-300 mb-3">
                Contact the Saint Vision™ privacy team and we will respond promptly.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href="mailto:privacy@saintvisionai.com"
                  className="text-blue-300 underline hover:text-blue-200 transition-colors"
                >
                  privacy@saintvisionai.com
                </a>
                <span className="text-gray-500">•</span>
                <a
                  href="mailto:legal@saintvisionai.com"
                  className="text-blue-300 underline hover:text-blue-200 transition-colors"
                >
                  legal@saintvisionai.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
