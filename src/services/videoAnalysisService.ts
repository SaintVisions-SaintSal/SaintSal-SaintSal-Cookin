// Video Analysis Service for handling screen recordings and video analysis
// Integrates with backend API for Gemini video processing

import { getAuthToken } from '../lib/supabase';

const API_BASE_URL = 'https://saintsal-backend-0mv8.onrender.com/api';

export interface VideoAnalysisRequest {
  video: Blob;
  prompt?: string;
  filename?: string;
}

export interface VideoAnalysisResponse {
  success: boolean;
  analysis?: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  analyzedAt?: string;
  error?: string;
}

export interface VideoAnalysisCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: (response: VideoAnalysisResponse) => void;
  onError?: (error: string) => void;
}

class VideoAnalysisService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get authentication headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const token = await getAuthToken();
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
    } catch {
      console.warn('Failed to get auth token, proceeding without authentication');
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  /**
   * Analyze a video using Gemini AI
   */
  async analyzeVideo(
    request: VideoAnalysisRequest,
    callbacks: VideoAnalysisCallbacks = {}
  ): Promise<VideoAnalysisResponse> {
    try {
      console.log('🎥 Starting video analysis...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', request.video, request.filename || 'screen-recording.webm');
      formData.append('prompt', request.prompt || 'Analyze this video and provide insights about what you see.');

      // Get auth headers (without Content-Type for FormData)
      const token = await getAuthToken().catch(() => null);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(`${this.baseUrl}/analyze-video`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: VideoAnalysisResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Video analysis failed');
      }

      console.log('✅ Video analysis completed successfully');
      callbacks.onComplete?.(result);
      
      return result;

    } catch (error: unknown) {
      console.error('❌ Video analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      callbacks.onError?.(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Analyze video with streaming progress updates
   */
  async analyzeVideoWithProgress(
    request: VideoAnalysisRequest,
    callbacks: VideoAnalysisCallbacks = {}
  ): Promise<VideoAnalysisResponse> {
    try {
      console.log('🎥 Starting video analysis with progress tracking...');
      
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        const currentProgress = Math.min(90, Math.random() * 100);
        callbacks.onProgress?.(currentProgress);
      }, 500);

      const result = await this.analyzeVideo(request, {
        ...callbacks,
        onComplete: (response) => {
          clearInterval(progressInterval);
          callbacks.onProgress?.(100);
          callbacks.onComplete?.(response);
        },
        onError: (error) => {
          clearInterval(progressInterval);
          callbacks.onError?.(error);
        }
      });

      return result;

    } catch (error: unknown) {
      console.error('❌ Video analysis with progress error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      callbacks.onError?.(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get supported video formats
   */
  getSupportedFormats(): string[] {
    return [
      'video/mp4',
      'video/webm',
      'video/mov',
      'video/avi',
      'video/x-flv',
      'video/mpg',
      'video/mpeg',
      'video/wmv',
      'video/3gpp'
    ];
  }

  /**
   * Validate video file
   */
  validateVideoFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const supportedFormats = this.getSupportedFormats();

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`
      };
    }

    if (!supportedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Create a video blob from MediaRecorder chunks
   */
  createVideoBlob(chunks: Blob[], mimeType: string = 'video/webm'): Blob {
    return new Blob(chunks, { type: mimeType });
  }

  /**
   * Get video duration from blob
   */
  async getVideoDuration(videoBlob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(videoBlob);
    });
  }

  /**
   * Generate a thumbnail from video blob
   */
  async generateThumbnail(videoBlob: Blob, timeInSeconds: number = 1): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        video.currentTime = timeInSeconds;
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        window.URL.revokeObjectURL(video.src);
        resolve(thumbnail);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to generate thumbnail'));
      };

      video.src = URL.createObjectURL(videoBlob);
    });
  }
}

// Export singleton instance
export const videoAnalysisService = new VideoAnalysisService();
export default videoAnalysisService;
