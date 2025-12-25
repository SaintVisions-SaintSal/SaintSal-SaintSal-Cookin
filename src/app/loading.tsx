import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="SaintSal™ Logo" 
            width={64}
            height={64}
            className="mx-auto w-16 h-16 rounded-lg animate-pulse"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
        </div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}

