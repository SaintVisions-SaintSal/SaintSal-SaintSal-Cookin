'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isConnected: boolean;
  isInitializing: boolean;
}

const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  isConnected,
  isInitializing
}) => {
  const getOrbColor = () => {
    if (isListening) return '#10B981'; // Green
    if (isSpeaking) return '#8B5CF6'; // Purple
    if (isThinking) return '#F59E0B'; // Yellow
    return '#3B82F6'; // Blue
  };

  const getOrbOpacity = () => {
    if (isListening) return 0.8;
    if (isSpeaking) return 0.9;
    if (isThinking) return 0.7;
    return 0.6;
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        className="absolute"
        animate={{
          scale: isListening ? [1, 1.4, 1] : isSpeaking ? [1, 1.2, 1] : 1,
          opacity: isListening ? [0.3, 0.6, 0.3] : isSpeaking ? [0.3, 0.5, 0.3] : 0.2
        }}
        transition={{
          duration: isListening ? 1.2 : isSpeaking ? 1 : 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="320" height="320" viewBox="0 0 320 320" className="opacity-30">
          <defs>
            <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={getOrbColor()} stopOpacity="0.3" />
              <stop offset="50%" stopColor={getOrbColor()} stopOpacity="0.1" />
              <stop offset="100%" stopColor={getOrbColor()} stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="160" cy="160" r="150" fill="url(#outerGlow)" filter="url(#glow)" />
        </svg>
      </motion.div>

      {/* Main Orb */}
      <motion.div
        className="relative"
        animate={{
          scale: isListening ? [1, 1.15, 1] : isSpeaking ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: isListening ? 0.8 : isSpeaking ? 0.6 : 0.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="256" height="256" viewBox="0 0 256 256" className="drop-shadow-2xl">
          <defs>
            {/* Main gradient */}
            <radialGradient id="orbGradient" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor={getOrbColor()} stopOpacity={getOrbOpacity()} />
              <stop offset="30%" stopColor={getOrbColor()} stopOpacity={getOrbOpacity() * 0.8} />
              <stop offset="60%" stopColor={getOrbColor()} stopOpacity={getOrbOpacity() * 0.4} />
              <stop offset="100%" stopColor={getOrbColor()} stopOpacity="0.1" />
            </radialGradient>
            
            {/* Inner highlight */}
            <radialGradient id="innerHighlight" cx="40%" cy="40%" r="40%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            
            {/* Animated gradient for speaking */}
            <radialGradient id="speakingGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#EC4899" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </radialGradient>
            
            {/* Animated gradient for listening */}
            <radialGradient id="listeningGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#06B6D4" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
            </radialGradient>
            
            {/* Glass effect filter */}
            <filter id="glassEffect">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Glow filter */}
            <filter id="orbGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main orb circle */}
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill={isSpeaking ? "url(#speakingGradient)" : isListening ? "url(#listeningGradient)" : "url(#orbGradient)"}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            filter="url(#orbGlow)"
            animate={{
              fillOpacity: isListening ? [0.8, 1, 0.8] : isSpeaking ? [0.9, 1, 0.9] : 0.7,
              strokeOpacity: isListening ? [0.3, 0.6, 0.3] : isSpeaking ? [0.4, 0.7, 0.4] : 0.3
            }}
            transition={{
              duration: isListening ? 0.6 : isSpeaking ? 0.4 : 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Inner highlight */}
          <circle cx="128" cy="128" r="80" fill="url(#innerHighlight)" />
          
          {/* Animated inner circles for speaking */}
          {isSpeaking && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx="128"
                  cy="128"
                  r={60 + i * 20}
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.8, 0.3, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </>
          )}
          
          {/* Animated inner circles for listening */}
          {isListening && (
            <>
              {[...Array(2)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx="128"
                  cy="128"
                  r={70 + i * 30}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth="2"
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.6, 0.2, 0.6]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </>
          )}
          
          {/* Floating particles for speaking */}
          {isSpeaking && (
            <>
              {[...Array(6)].map((_, i) => {
                const angle = i * 60 * Math.PI / 180;
                const endX = 128 + Math.cos(angle) * 100;
                const endY = 128 + Math.sin(angle) * 100;
                
                return (
                  <motion.circle
                    key={`particle-${i}`}
                    cx="128"
                    cy="128"
                    r="2"
                    fill="rgba(255,255,255,0.6)"
                    animate={{
                      cx: [128, endX],
                      cy: [128, endY],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                  />
                );
              })}
            </>
          )}
        </svg>
      </motion.div>

      {/* Center Icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.1, 1] : 1,
          rotate: isListening ? [0, 5, -5, 0] : isSpeaking ? [0, 3, -3, 0] : 0
        }}
        transition={{
          duration: isListening ? 0.8 : isSpeaking ? 0.6 : 0.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {isInitializing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </motion.div>
        ) : isConnected ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-lg">
            <motion.path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-lg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </motion.div>
    </div>
  );
};

export default AnimatedOrb;
