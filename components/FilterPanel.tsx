"use client";

import { motion } from "framer-motion";
import { Activity, Eye } from "lucide-react";

export default function FilterPanel() {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-b border-wicked-gray-light p-4 bg-wicked-black/50 overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-xs font-heading text-gray-400 mb-2 flex items-center gap-2">
            <Activity size={14} className="text-wicked-green" />
            Live Streams
          </h3>
          <div className="space-y-1">
            {["New Transactions", "NFT Mints", "Contract Deploys"].map((stream) => (
              <label key={stream} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3 h-3 rounded accent-wicked-green"
                />
                <span className="text-gray-300">{stream}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-heading text-gray-400 mb-2 flex items-center gap-2">
            <Eye size={14} className="text-wicked-pink" />
            Watchlist
          </h3>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">No items yet</div>
            <button className="text-xs text-wicked-pink hover:text-wicked-pink-soft transition-colors">
              + Add address
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
