"use client";

import React, { useState, useRef } from 'react';
import * as motion from "motion/react-client";
import { Upload, File, X, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  isUploading = false,
  uploadProgress = 0 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const isValidFile = (file: File): boolean => {
    const maxSize = 8 * 1024 * 1024; // 8MB (matches backend limit)
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'text/markdown'
    ];

    if (file.size > maxSize) {
      alert('File size must be less than 8MB');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload a text, PDF, or document file.');
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type === 'text/csv') return '📊';
    if (file.type === 'application/json') return '⚙️';
    if (file.type === 'text/markdown') return '📋';
    return '📄';
  };

  return (
    <div className="relative">
      {!selectedFile ? (
        <motion.div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-yellow-400 bg-yellow-400/10'
              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.csv,.json,.md"
          />
          
          <Upload size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-white font-medium mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-gray-400 mb-4">
            Supports: PDF, Word, Text, CSV, JSON, Markdown (max 8MB)
          </p>
          
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Choose File
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className="bg-white/5 border border-white/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFileIcon(selectedFile)}</span>
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-400">{uploadProgress}%</span>
                </div>
              ) : (
                <CheckCircle size={20} className="text-green-400" />
              )}
              
              <motion.button
                onClick={onFileRemove}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>
          
          {isUploading && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-yellow-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
