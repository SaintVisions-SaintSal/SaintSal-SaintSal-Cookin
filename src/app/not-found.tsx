import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
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
        
        <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-300">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/warroom"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700"
          >
            Go to WarRoom
          </Link>
        </div>
      </div>
    </div>
  );
}

