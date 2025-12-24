"use client";

import React from 'react';
import * as motion from "motion/react-client";
import { X, AlertTriangle, Trash2, Shield } from "lucide-react";

interface DeleteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  isDeleting?: boolean;
}

export default function DeleteAgentModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  isDeleting = false
}: DeleteAgentModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Agent</h3>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isDeleting}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <Trash2 size={16} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">&ldquo;{agentName}&rdquo;</p>
                <p className="text-xs text-gray-400">Agent will be permanently removed</p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium text-sm mb-1">Warning</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Deleting this agent will permanently remove all its data, including:
                </p>
                <ul className="text-gray-400 text-xs mt-2 space-y-1 ml-4">
                  <li>• Agent configuration and settings</li>
                  <li>• Associated context files and documents</li>
                  <li>• Chat history and interactions</li>
                  <li>• Custom training data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isDeleting ? 1 : 1.02 }}
            whileTap={{ scale: isDeleting ? 1 : 0.98 }}
          >
            {isDeleting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Deleting...
              </>
            ) : (
              <>
                      <AlertTriangle size={16} />
                Delete Agent
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
