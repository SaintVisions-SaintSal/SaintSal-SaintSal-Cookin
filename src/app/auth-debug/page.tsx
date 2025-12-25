"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthDebugPage() {
  const [config, setConfig] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');
  const [email, setEmail] = useState('ryan@cookin.io');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? '✅ Set' : '❌ MISSING',
      SUPABASE_URL: process.env.SUPABASE_URL || '❌ MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING',
    };
    setConfig(envCheck);
  }, []);

  const testConnection = async () => {
    setTestResult('Testing...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setTestResult(`❌ Error: ${error.message}`);
      } else {
        setTestResult(`✅ Connection OK. Session: ${data.session ? 'Active' : 'None'}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Exception: ${err.message}`);
    }
  };

  const testSignIn = async () => {
    setTestResult('Attempting sign in...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setTestResult(`❌ Sign In Error: ${error.message}\n\nCode: ${error.status || 'N/A'}\n\nThis usually means:\n- User doesn't exist (sign up first)\n- Wrong password\n- Email not confirmed\n- Supabase URL/key mismatch`);
      } else {
        setTestResult(`✅ Sign In Success!\n\nUser: ${data.user?.email}\nID: ${data.user?.id}\n\nSession created!`);
      }
    } catch (err: any) {
      setTestResult(`❌ Exception: ${err.message}`);
    }
  };

  const testSignUp = async () => {
    setTestResult('Attempting sign up...');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setTestResult(`❌ Sign Up Error: ${error.message}`);
      } else {
        setTestResult(`✅ Sign Up Success!\n\nUser: ${data.user?.email}\nID: ${data.user?.id}\n\n${data.user ? 'Check your email for confirmation!' : 'User created but needs email confirmation'}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Exception: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Supabase Auth Debug</h1>

        {/* Environment Variables */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>NEXT_PUBLIC_SUPABASE_URL: <span className={config.NEXT_PUBLIC_SUPABASE_URL?.includes('❌') ? 'text-red-400' : 'text-green-400'}>{config.NEXT_PUBLIC_SUPABASE_URL}</span></div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: <span className={config.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('❌') ? 'text-red-400' : 'text-green-400'}>{config.NEXT_PUBLIC_SUPABASE_ANON_KEY}</span></div>
            <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: <span className={config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.includes('❌') ? 'text-red-400' : 'text-green-400'}>{config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}</span></div>
            <div>SUPABASE_URL: <span className={config.SUPABASE_URL?.includes('❌') ? 'text-red-400' : 'text-green-400'}>{config.SUPABASE_URL}</span></div>
            <div>SUPABASE_ANON_KEY: <span className={config.SUPABASE_ANON_KEY?.includes('❌') ? 'text-red-400' : 'text-green-400'}>{config.SUPABASE_ANON_KEY}</span></div>
          </div>
        </div>

        {/* Test Connection */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Connection</h2>
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Test Supabase Connection
          </button>
          {testResult && (
            <div className="mt-4 p-4 bg-gray-800 rounded whitespace-pre-wrap">
              {testResult}
            </div>
          )}
        </div>

        {/* Test Sign In */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Sign In</h2>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 bg-gray-800 rounded text-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 bg-gray-800 rounded text-white"
            />
            <div className="flex gap-4">
              <button
                onClick={testSignIn}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Test Sign In
              </button>
              <button
                onClick={testSignUp}
                className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
              >
                Test Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔧 Fix Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> shows ✅ above</li>
            <li>If ❌, add it in Vercel: <code className="bg-gray-800 px-2 py-1 rounded">https://euxrlpuegeiggedqbkiv.supabase.co</code></li>
            <li>Check if at least ONE of the key variables shows ✅</li>
            <li>If user doesn't exist, use "Test Sign Up" first</li>
            <li>After fixing env vars, redeploy in Vercel</li>
            <li>Clear browser cache and try again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

