"use client";

import * as motion from "motion/react-client";

export default function BreathingOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Orb positioned behind the text content */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 blur-2xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
