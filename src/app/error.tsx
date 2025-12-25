'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Application error:', {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="SaintSal™ Logo" 
            width={64}
            height={64}
            className="mx-auto w-16 h-16 rounded-lg"
          />
        </div>
        
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Something went wrong!
        </h1>
        
        <p className="text-gray-400 mb-2 text-lg">
          {error.message || 'An unexpected error occurred'}
        </p>
        
        {error.digest && (
          <p className="text-gray-500 text-sm mb-8">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

