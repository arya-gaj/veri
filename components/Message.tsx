"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChevronDown, Copy, ExternalLink } from "lucide-react";
import type { MessageType } from "./ChatBox";

export default function Message({ message }: { message: MessageType }) {
  const [showProof, setShowProof] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          message.role === "user"
            ? "bg-wicked-green text-wicked-black"
            : "bg-wicked-gray-light border border-wicked-gray-light"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {(message.verified || message.glindaGlorified) && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              {message.verified && (
                <div className="flex items-center gap-2 text-wicked-green">
                  <CheckCircle size={16} />
                  <span className="text-xs font-semibold">veriked verified</span>
                </div>
              )}
              {message.glindaGlorified && (
                <div className="flex items-center gap-2 text-wicked-pink">
                  <CheckCircle size={16} />
                  <span className="text-xs font-semibold">glinda glorified</span>
                </div>
              )}
            </div>

            {message.verified && (
              <button
                onClick={() => setShowProof(!showProof)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-wicked-green transition-colors"
              >
                <ChevronDown
                  size={14}
                  className={`transform transition-transform ${showProof ? "rotate-180" : ""}`}
                />
                {showProof ? "Hide" : "Show"} proof
              </button>
            )}

            {showProof && message.proof && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 p-3 bg-wicked-black rounded-lg space-y-2 text-xs"
              >
                <div className="flex justify-between">
                  <span className="text-gray-500">Block:</span>
                  <code className="text-wicked-green">{message.proof.blockNumber}</code>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Timestamp:</span>
                  <code className="text-gray-400">
                    {new Date(message.proof.timestamp).toLocaleString()}
                  </code>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-500 hover:text-wicked-green">
                    Raw JSON
                  </summary>
                  <pre className="mt-2 p-2 bg-wicked-gray rounded text-[10px] overflow-x-auto">
                    {JSON.stringify(message.proof.rawData, null, 2)}
                  </pre>
                </details>
              </motion.div>
            )}
          </div>
        )}

        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-xs text-wicked-green"
          >
            Copied!
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
