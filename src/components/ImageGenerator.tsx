"use client";

import React, { useState } from 'react';
import * as motion from "motion/react-client";
import Image from 'next/image';
import { 
  Palette, 
  Download, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  X,
  RefreshCw,
  Save
} from "lucide-react";
import { getAuthToken } from "@/lib/supabase";

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  timestamp: number;
  error?: string;
}

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageGenerator({ isOpen, onClose }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [imageSize, setImageSize] = useState('1024x1024');

  const styles = [
    { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
    { id: 'artistic', name: 'Artistic', description: 'Creative and stylized' },
    { id: 'anime', name: 'Anime', description: 'Anime/manga style' },
    { id: 'digital-art', name: 'Digital Art', description: 'Digital painting style' },
    { id: 'oil-painting', name: 'Oil Painting', description: 'Classic oil painting' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor style' }
  ];

  const sizes = [
    { id: '1024x1024', name: 'Square (1024x1024)' },
    { id: '1024x1792', name: 'Portrait (1024x1792)' },
    { id: '1792x1024', name: 'Landscape (1792x1024)' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    
    try {
      // Build the enhanced prompt with style
      const stylePrompts = {
        realistic: 'photorealistic, high quality, detailed',
        artistic: 'artistic style, creative, beautiful composition',
        anime: 'anime style, manga, Japanese animation',
        'digital-art': 'digital art, concept art, detailed illustration',
        'oil-painting': 'oil painting style, classical art, brushstrokes',
        watercolor: 'watercolor painting, soft colors, artistic'
      };

      const enhancedPrompt = `${prompt.trim()}, ${stylePrompts[selectedStyle as keyof typeof stylePrompts]}, high resolution, professional quality`;

      // Get auth token
      const authToken = await getAuthToken();
      
      // Call the backend image generation API
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com') + '/api';
      const response = await fetch(`${backendUrl}/ai/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          size: imageSize,
          model: 'dall-e-3'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.imageUrl) {
        // Create generated image object
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          url: data.data.imageUrl, // Use the actual generated image URL
          timestamp: Date.now()
        };
        
        setGeneratedImages(prev => [newImage, ...prev]);
        setPrompt('');
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback to a placeholder with error indication
      const errorImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        url: `https://picsum.photos/512/512?random=${Date.now()}`, // Fallback placeholder
        timestamp: Date.now(),
        error: 'Failed to generate image. Please try again.'
      };
      
      setGeneratedImages(prev => [errorImage, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (image: GeneratedImage) => {
    // Create download link
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated-image-${image.id}.jpg`;
    link.click();
  };

  const handleSave = (image: GeneratedImage) => {
    // Save to favorites or collection
    console.log('Saving image:', image);
  };

  const handleRetry = (image: GeneratedImage) => {
    setPrompt(image.prompt);
    handleGenerate();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Image Generator</h2>
              <p className="text-sm text-gray-400">Create stunning images with AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-gray-800/50 border-r border-white/20 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Describe your image
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A majestic mountain landscape at sunset with golden light..."
                  className="w-full h-24 bg-gray-700/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  disabled={isGenerating}
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedStyle === style.id
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-medium">{style.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Size
                </label>
                <div className="space-y-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setImageSize(size.id)}
                      className={`w-full p-2 rounded-lg border text-left transition-all ${
                        imageSize === size.id
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm">{size.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Image
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Right Panel - Generated Images */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Generated Images</h3>
              <p className="text-sm text-gray-400">Your AI-generated creations</p>
            </div>

            {generatedImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                  <Palette size={32} className="text-gray-500" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">No images generated yet</h4>
                <p className="text-gray-400 text-sm max-w-md">
                  Enter a description and click &ldquo;Generate Image&rdquo; to create your first AI artwork
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image) => (
                  <div key={image.id} className="bg-gray-800/50 rounded-xl overflow-hidden border border-white/20">
                    <div className="aspect-square relative">
                      {image.error ? (
                        <div className="w-full h-full bg-red-900/20 border border-red-500/30 rounded-lg flex flex-col items-center justify-center p-4">
                          <AlertCircle size={32} className="text-red-400 mb-2" />
                          <p className="text-red-400 text-sm text-center">{image.error}</p>
                        </div>
                      ) : (
                        <Image
                          src={image.url}
                          alt={image.prompt}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized={true}
                          onError={(e) => {
                            console.error('Image load error:', e);
                            // Fallback to a placeholder if image fails to load
                            e.currentTarget.src = `https://picsum.photos/512/512?random=${Date.now()}`;
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 flex items-center justify-center gap-2">
                          <motion.button
                            onClick={() => handleDownload(image)}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Download size={16} className="text-white" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleSave(image)}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Save size={16} className="text-white" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleRetry(image)}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <RefreshCw size={16} className="text-white" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {image.prompt}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(image.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-green-400">Generated</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
