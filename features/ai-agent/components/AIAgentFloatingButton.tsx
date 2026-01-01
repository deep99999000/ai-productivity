"use client";

import { useState } from "react";
import AIChatInterface from "./AIChatInterface";
import { Bot, X } from "lucide-react";

export default function AIAgentFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={isOpen ? "Close AI Agent" : "Open AI Agent"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[420px] h-[600px] max-h-[80vh] shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-white animate-in slide-in-from-bottom-5 duration-300">
          <AIChatInterface />
        </div>
      )}
    </>
  );
}
