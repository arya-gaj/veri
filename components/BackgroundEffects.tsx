"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function BackgroundEffects({ showBubbles = false }: { showBubbles?: boolean }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    if (!showBubbles) {
      setBubbles([]);
      return;
    }

    // Generate Glinda-style bubbles immediately when wallet is submitted
    const generateBubbles = () => {
      const newBubbles: Bubble[] = [];
      for (let i = 0; i < 28; i++) {
        newBubbles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 40 + Math.random() * 120,
          duration: 18 + Math.random() * 15,
          delay: 0, // Start immediately, no delay
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, [showBubbles]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-0 bottom-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(255,107,157,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 35% 35%, 
              rgba(255, 255, 255, 0.25) 0%,
              rgba(100, 200, 255, 0.22) 20%, 
              rgba(0, 200, 200, 0.18) 40%, 
              rgba(255, 107, 157, 0.15) 70%, 
              transparent 100%)`,
            boxShadow: `
              inset -15px -15px 30px rgba(100, 200, 255, 0.18),
              inset 15px 15px 30px rgba(255, 255, 255, 0.15),
              0 0 40px rgba(100, 200, 255, 0.12)
            `,
            filter: "blur(1.5px)",
            zIndex: 5,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.35, 0],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute top-1/4 left-0 right-0 h-px spell-line opacity-30" />
      <div className="absolute top-3/4 left-0 right-0 h-px spell-line opacity-30" />
    </div>
  );
}
