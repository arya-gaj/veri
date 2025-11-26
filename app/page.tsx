"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ChatBox from "@/components/ChatBox";
import BackgroundEffects from "@/components/BackgroundEffects";
import WalletOnboarding from "@/components/WalletOnboarding";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <main className="h-screen relative overflow-hidden flex items-center justify-center">
      <BackgroundEffects showBubbles={!!walletAddress} />

      <div className="relative z-10 flex items-center justify-center" style={{ width: '90%', maxWidth: !walletAddress ? '28rem' : '68rem' }}>
        {!walletAddress ? (
          <WalletOnboarding onComplete={setWalletAddress} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <ChatBox walletAddress={walletAddress} />
          </motion.div>
        )}
      </div>
    </main>
  );
}
