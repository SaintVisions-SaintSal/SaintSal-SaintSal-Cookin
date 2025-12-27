"use client";

import { useEffect, useState } from 'react';

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [clientVars, setClientVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Server-side env vars (won't work in client, but let's try)
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set (hidden)' : '❌ MISSING',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? '✅ Set (hidden)' : '❌ MISSING',
      SUPABASE_URL: process.env.SUPABASE_URL || '❌ MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set (hidden)' : '❌ MISSING',
    });

    // Try to get from window (won't work, but shows what's available)
    setClientVars({
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A',
      hasWindow: typeof window !== 'undefined' ? 'Yes' : 'No',
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Environment Variables Test</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Client-Side Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-80 text-gray-400">{key}:</span>
                <span className={value.includes('❌') ? 'text-red-400' : 'text-green-400'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Client Info</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(clientVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-80 text-gray-400">{key}:</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📋 What to Check</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>If <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> shows ❌, add it in Vercel</li>
            <li>If all keys show ❌, the variables aren't being exposed to the browser</li>
            <li>Variables MUST have <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_</code> prefix to work in browser</li>
            <li>After adding variables, you MUST redeploy in Vercel</li>
            <li>Clear browser cache after redeploying</li>
          </ol>
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔧 Quick Fix</h2>
          <div className="space-y-2 text-sm">
            <p>1. Go to Vercel → Settings → Environment Variables</p>
            <p>2. Add: <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> = <code className="bg-gray-800 px-2 py-1 rounded">https://euxrlpuegeiggedqbkiv.supabase.co</code></p>
            <p>3. Make sure it's set for <strong>Production</strong> environment</p>
            <p>4. Redeploy your project</p>
            <p>5. Clear cache and refresh this page</p>
          </div>
        </div>
      </div>
    </div>
  );
}

