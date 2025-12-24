// PDF Extraction Service for Webapp
// Based on the native app's PDF extraction logic

const API_BASE_URL = process.env.BACKEND_URL || 'https://saintsal-backend-0mv8.onrender.com/api';

export interface PDFExtractionResult {
  success: boolean;
  text: string;
  pages: number;
  method: string;
  filename: string;
  fileSize: number;
  extractedAt: string;
  error?: string;
}

export const extractPDFText = async (file: File): Promise<PDFExtractionResult> => {
  try {
    console.log('PDFExtractionService: Starting PDF extraction for file:', file.name, 'Type:', file.type);
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add the file to FormData
    formData.append('pdf', file);

    // Call the extract-pdf endpoint
    console.log('PDFExtractionService: Sending request to:', `${API_BASE_URL}/extract-pdf`);
    const response = await fetch(`${API_BASE_URL}/extract-pdf`, {
      method: 'POST',
      body: formData,
    });

    console.log('PDFExtractionService: Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PDFExtractionService: Response error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('PDFExtractionService: Response data:', result);
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      text: '',
      pages: 0,
      method: 'error',
      filename: file.name,
      fileSize: file.size,
      extractedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const extractPDFTextWithAuth = async (file: File): Promise<PDFExtractionResult> => {
  try {
    // Get auth token from Supabase
    const { getAuthToken } = await import('../lib/supabase');
    const authToken = await getAuthToken() || '';

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add the file to FormData
    formData.append('pdf', file);

    // Call the extract-pdf endpoint with auth
    const response = await fetch(`${API_BASE_URL}/extract-pdf`, {
      method: 'POST',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      success: false,
      text: '',
      pages: 0,
      method: 'error',
      filename: file.name,
      fileSize: file.size,
      extractedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
