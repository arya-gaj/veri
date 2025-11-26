"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function WalletOnboarding({
  onComplete,
}: {
  onComplete: (address: string) => void;
}) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const validateAndSubmit = () => {
    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Invalid Ethereum address format");
      return;
    }

    onComplete(address);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-wicked-gray rounded-2xl shadow-2xl border border-wicked-gray-light p-8 max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-2">
          <img src="/veriked-home.png" alt="Veriked" className="w-20 h-20 object-contain" />
        </div>
        <p className="text-gray-300 text-base mb-4" style={{ lineHeight: '1.6' }}>
          Welcome to Veriked.
          <br />
          <span style={{ display: 'block', height: '0.50em' }}></span>
          Enter your wallet and discover what Oz has been waiting to tell you from behind the curtain.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => e.key === "Enter" && validateAndSubmit()}
            placeholder="0x..."
            className="w-full bg-wicked-black rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-wicked-green/50 placeholder-gray-600"
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-wicked-pink text-xs mt-2"
            >
              {error}
            </motion.p>
          )}
        </div>

        <button
          onClick={validateAndSubmit}
          className="w-full bg-wicked-green text-wicked-black font-semibold py-3 rounded-xl hover:bg-wicked-green-dark transition-all shadow-glow-green flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight size={18} />
        </button>

        <p className="text-xs text-gray-500 text-center">
          We never request private keys. All data is read-only from Somnia blockchain.
        </p>
      </div>
    </motion.div>
  );
}
