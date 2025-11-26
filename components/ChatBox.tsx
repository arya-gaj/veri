"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Filter } from "lucide-react";
import Message from "./Message";
import FilterPanel from "./FilterPanel";

export type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  verified?: boolean;
  glindaGlorified?: boolean;
  proof?: {
    blockNumber: number;
    timestamp: string;
    rawData: any;
  };
};

export default function ChatBox({ walletAddress }: { walletAddress: string }) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    requestAnimationFrame(scrollToBottom);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = input;
    setInput("");
    setIsLoading(true);

    // Determine loading message based on query type
    const queryLower = queryText.toLowerCase();
    let loadingMsg = "Consulting the Wizard...";
    
    if (queryLower.match(/what is|explain|tell me|how does|how do/)) {
      loadingMsg = "Searching the Emerald City archives...";
    } else if (queryLower.match(/balance|how much|worth/)) {
      loadingMsg = "Counting your emeralds...";
    } else if (queryLower.match(/transaction|tx|transfer/)) {
      loadingMsg = "Following the yellow brick road...";
    } else if (queryLower.match(/nft|collectible/)) {
      loadingMsg = "Checking your treasure chest...";
    } else if (queryLower.match(/somnia/)) {
      loadingMsg = "Asking the Wizard...";
    }
    
    setLoadingMessage(loadingMsg);

    // Add natural delay before making request
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          walletAddress,
          filters: activeFilters,
        }),
      });

      const data = await response.json();

      // Add slight delay before showing response for natural feel
      await new Promise(resolve => setTimeout(resolve, 600));

      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.summary,
        timestamp: new Date(),
        verified: data.verified,
        glindaGlorified: data.glindaGlorified,
        proof: data.proof,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Query failed:", error);
      const wickedErrors = [
        "Something wicked happened! The tornado must have swept away my connection to Somnia. Let's try that spell again.",
        "Even the Wicked Witch had bad days... Looks like the Emerald City's connection is a bit cloudy. Give it another go?",
        "Oops! My crystal ball is a bit foggy. The blockchain spirits aren't responding. Shall we try defying this error together?",
        "No one mourns the wicked... but everyone mourns a failed query! Let's give it another shot, shall we?",
      ];
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: wickedErrors[Math.floor(Math.random() * wickedErrors.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-wicked-gray rounded-2xl shadow-2xl border border-wicked-gray-light overflow-hidden relative"
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(255,107,157,0.15) 100%)",
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="relative z-10">
        <div className="border-b border-wicked-gray-light p-3 flex items-center gap-2">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-wicked-black hover:bg-wicked-green/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Filter size={16} className="text-wicked-green" />
            </motion.div>
          </motion.button>
          <div className="flex gap-2 flex-wrap">
            {["wallet", "tx", "nft", "contract"].map((filter) => (
              <motion.button
                key={filter}
                onClick={() => {
                  setActiveFilters((prev) =>
                    prev.includes(filter)
                      ? prev.filter((f) => f !== filter)
                      : [...prev, filter]
                  );
                }}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  activeFilters.includes(filter)
                    ? "bg-wicked-green text-wicked-black"
                    : "bg-wicked-black text-wicked-green hover:bg-wicked-green/10"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && <FilterPanel />}
        </AnimatePresence>

        <div 
          ref={messagesContainerRef}
          className="h-[450px] overflow-y-auto p-6 space-y-4 smoke-bg"
          style={{ scrollBehavior: "smooth" }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-wicked-green bg-wicked-gray-light rounded-2xl p-4 max-w-[80%]"
            >
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-wicked-green rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-wicked-green rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-wicked-green rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <span className="text-sm italic">{loadingMessage}</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-wicked-gray-light p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about wallets, transactions, NFTs..."
              className="flex-1 bg-wicked-black rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-wicked-green/50 placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 rounded-xl bg-wicked-green text-wicked-black hover:bg-wicked-green-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-green"
            >
              <Send size={20} />
            </button>
            <button className="p-3 rounded-xl bg-wicked-pink text-white hover:bg-wicked-pink/80 transition-all shadow-glow-pink">
              <Mic size={20} />
            </button>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
