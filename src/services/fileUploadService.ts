// File Upload Service for Webapp
// Based on the native app's file upload logic

import { extractPDFText, extractPDFTextWithAuth } from './pdfExtractionService';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  textContent?: string;
  uploadedAt: string;
  isProcessing?: boolean;
  error?: string;
}

export class FileUploadService {
  private uploadedFiles: Map<string, UploadedFile> = new Map();

  /**
   * Upload and process a file
   */
  async uploadFile(file: File, useAuth: boolean = false): Promise<UploadedFile> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure file always has a valid name
    const fileName = file.name && file.name.trim() 
      ? file.name.trim() 
      : `uploaded-file-${Date.now()}`;
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: fileName,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      isProcessing: true,
    };

    this.uploadedFiles.set(fileId, uploadedFile);

    try {
      console.log('FileUploadService: Processing file:', file.name, 'Type:', file.type);
      
      // Process PDF files using backend extraction
      if (file.type === 'application/pdf') {
        console.log('FileUploadService: Processing as PDF file');
        const extractionResult = useAuth 
          ? await extractPDFTextWithAuth(file)
          : await extractPDFText(file);

        if (extractionResult.success && extractionResult.text) {
          uploadedFile.textContent = extractionResult.text;
          uploadedFile.isProcessing = false;
          console.log('FileUploadService: PDF extraction successful');
        } else {
          uploadedFile.error = extractionResult.error || 'PDF text extraction failed';
          uploadedFile.isProcessing = false;
          console.log('FileUploadService: PDF extraction failed:', extractionResult.error);
        }
      } else {
        // For non-PDF files, read as text locally
        console.log('FileUploadService: Processing as text file locally');
        const textContent = await this.readTextFile(file);
        uploadedFile.textContent = textContent;
        uploadedFile.isProcessing = false;
        console.log('FileUploadService: Text file processing successful');
      }

      this.uploadedFiles.set(fileId, uploadedFile);
      return uploadedFile;
    } catch (error) {
      uploadedFile.error = error instanceof Error ? error.message : 'File processing failed';
      uploadedFile.isProcessing = false;
      this.uploadedFiles.set(fileId, uploadedFile);
      return uploadedFile;
    }
  }

  /**
   * Read text file content
   */
  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || '');
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get uploaded file by ID
   */
  getFile(fileId: string): UploadedFile | undefined {
    return this.uploadedFiles.get(fileId);
  }

  /**
   * Get all uploaded files
   */
  getAllFiles(): UploadedFile[] {
    return Array.from(this.uploadedFiles.values());
  }

  /**
   * Store files in database and return database UUIDs
   * This should be called when saving an agent
   */
  async storeFilesInDatabase(): Promise<string[]> {
    const databaseIds: string[] = [];
    
    for (const [, file] of this.uploadedFiles) {
      try {
        console.log('FileUploadService: Storing file in database:', file.name);
        
        // Import supabase dynamically to avoid circular imports
        const { supabase } = await import('../lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: fileRecord, error: dbError } = await supabase
          .from('agent_files')
          .insert({
            name: file.name,
            mime_type: file.mimeType,
            size: file.size,
            url: '', // No storage URL for webapp files
            text_content: file.textContent || '',
            storage_path: file.name,
            user_id: user?.id || ''
          })
          .select()
          .single();

        if (dbError) {
          console.error('FileUploadService: Database error for file', file.name, ':', dbError);
          throw new Error(`Failed to store file ${file.name} in database`);
        } else {
          databaseIds.push(fileRecord.id);
          console.log('FileUploadService: File stored with database ID:', fileRecord.id);
        }
      } catch (error) {
        console.error('FileUploadService: Failed to store file in database:', error);
        throw error;
      }
    }
    
    return databaseIds;
  }

  /**
   * Remove file
   */
  removeFile(fileId: string): boolean {
    return this.uploadedFiles.delete(fileId);
  }

  /**
   * Get combined context from all files
   */
  getCombinedContext(maxLength: number = 200000): string {
    const files = this.getAllFiles();
    const contextSections: string[] = [];

    files.forEach((file) => {
      if (file.textContent && file.textContent.length > 0) {
        if (file.mimeType.includes('pdf')) {
          if (file.textContent.includes('(text extraction failed)') || file.textContent.includes('(no readable text found)')) {
            contextSections.push(`\n[File: ${file.name} - PDF with limited text content]\n${file.textContent}`);
          } else {
            contextSections.push(`\n[File: ${file.name} - PDF Content]\n${file.textContent}`);
          }
        } else if (file.mimeType.includes('image')) {
          if (file.textContent.includes('Image Analysis for:')) {
            contextSections.push(`\n[File: ${file.name} - Image Analysis]\n${file.textContent}`);
          } else if (file.textContent.includes('Image analysis failed')) {
            contextSections.push(`\n[File: ${file.name} - Image (analysis failed)]\n${file.textContent}`);
          } else {
            contextSections.push(`\n[File: ${file.name} - Image]\n${file.textContent}`);
          }
        } else {
          // Text files and other types
          contextSections.push(`\n[File: ${file.name}]\n${file.textContent}`);
        }
      } else {
        contextSections.push(`\n[File: ${file.name} - No content available]`);
      }
    });

    let combinedContext = contextSections.join('\n');

    // Smart truncation if content is too long
    if (combinedContext.length > maxLength) {
      const firstPart = combinedContext.substring(0, Math.floor(maxLength * 0.7));
      const lastPart = combinedContext.substring(combinedContext.length - Math.floor(maxLength * 0.3));
      combinedContext = `${firstPart}\n\n[... CONTENT TRUNCATED FOR LENGTH ...]\n\n${lastPart}`;
    }

    return combinedContext;
  }

  /**
   * Get PDF-specific context (like native app)
   */
  getPDFContext(maxLengthPerPDF: number = 80000, totalMaxLength: number = 200000): string {
    const files = this.getAllFiles().filter(file => file.mimeType === 'application/pdf');
    
    if (files.length === 0) return '';

    let combinedPDFContent = '';

    files.forEach((file, index) => {
      if (file.textContent && file.textContent.length > 0) {
        let pdfContent = file.textContent;
        
        // Smart truncation per PDF
        if (pdfContent.length > maxLengthPerPDF) {
          const firstPart = pdfContent.substring(0, Math.floor(maxLengthPerPDF * 0.75));
          const lastPart = pdfContent.substring(pdfContent.length - Math.floor(maxLengthPerPDF * 0.25));
          pdfContent = `${firstPart}\n\n[... PDF ${index + 1} TRUNCATED FOR LENGTH ...]\n\n${lastPart}`;
        }
        
        combinedPDFContent += (combinedPDFContent ? '\n\n---\n\n' : '') + 
          `PDF ${index + 1} CONTENT:\n${pdfContent}`;
      }
    });

    // Final truncation if total content is too long
    if (combinedPDFContent.length > totalMaxLength) {
      const firstPart = combinedPDFContent.substring(0, Math.floor(totalMaxLength * 0.75));
      const lastPart = combinedPDFContent.substring(combinedPDFContent.length - Math.floor(totalMaxLength * 0.25));
      combinedPDFContent = `${firstPart}\n\n[... TOTAL CONTENT TRUNCATED FOR LENGTH ...]\n\n${lastPart}`;
    }

    return combinedPDFContent;
  }

  /**
   * Clear all files
   */
  clearAllFiles(): void {
    this.uploadedFiles.clear();
  }

  addContextFile(file: UploadedFile): void {
    // Validate file has required fields before adding
    if (!file.id || !file.name || !file.name.trim()) {
      console.warn('FileUploadService: Skipping invalid context file - missing id or name:', file);
      return;
    }
    // Ensure name is trimmed
    const validatedFile: UploadedFile = {
      ...file,
      name: file.name.trim(),
      mimeType: file.mimeType || 'application/octet-stream',
      textContent: file.textContent || ''
    };
    this.uploadedFiles.set(validatedFile.id, validatedFile);
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
export default fileUploadService;
