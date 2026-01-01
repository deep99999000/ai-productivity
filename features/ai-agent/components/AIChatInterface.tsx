"use client";

import { useState, useEffect, useRef } from "react";
import { useAgentChat } from "@/features/ai-agent/store";
import { clearChatHistory } from "@/features/ai-agent/actions";
import { useHabit } from "@/features/habits/store";
import { useTodo } from "@/features/todo/store";
import { Bot, Send, Trash2, Sparkles, CheckSquare, ListTodo, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIChatInterface() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    currentStage,
    sessionId,
    addMessage,
    setLoading,
    setCurrentStage,
    clearMessages,
  } = useAgentChat();

  // Get data from existing stores for quick stats
  const allHabits = useHabit((s) => s.allHabits);
  const allTodos = useTodo((s) => s.todos);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    addMessage({ role: "user", content: userMessage });
    setLoading(true);
    setCurrentStage("Starting...");

    try {
      const response = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "progress") {
                setCurrentStage(data.data);
              } else if (data.type === "response") {
                setCurrentStage("");
                addMessage({ role: "assistant", content: data.data });
              } else if (data.type === "error") {
                setCurrentStage("");
                addMessage({
                  role: "assistant",
                  content: `Error: ${data.data}`,
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      setCurrentStage("");
      addMessage({
        role: "assistant",
        content: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      confirm(
        "Clear chat history? This will reset the AI's memory of our conversation."
      )
    ) {
      await clearChatHistory(sessionId);
      clearMessages();
    }
  };

  const quickActions = [
    {
      label: "My habits",
      prompt: "Show me all my habits",
      icon: Sparkles,
    },
    {
      label: "Today's tasks",
      prompt: "What tasks do I have for today?",
      icon: CheckSquare,
    },
    {
      label: "Pending todos",
      prompt: "Show me all my pending todos",
      icon: ListTodo,
    },
    {
      label: "Create habit",
      prompt: "Create a new habit for me",
      icon: Plus,
    },
    {
      label: "Create todo",
      prompt: "Create a new todo for me",
      icon: Plus,
    },
    {
      label: "Search",
      prompt: "Search for tasks related to ",
      icon: Search,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-500">
              {allHabits.length} habits · {allTodos.length} todos
            </p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                AI Productivity Assistant
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Manage your habits and todos with natural language
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.prompt)}
                    className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors border border-gray-100"
                  >
                    <action.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-6">
                Try: "Mark my exercise habit as done today"
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-xl px-4 py-2.5 max-w-[85%]",
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : msg.role === "progress"
                    ? "bg-gray-50 text-gray-600 text-sm border border-gray-100"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <div
                  className={
                    msg.role === "progress"
                      ? "flex items-center gap-2"
                      : "whitespace-pre-wrap text-sm"
                  }
                >
                  {msg.role === "progress" && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{msg.content}</span>
                </div>
              </div>
            </div>
          ))}

          {isLoading && currentStage && (
            <div className="flex justify-start">
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 max-w-[85%]">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-600">{currentStage}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your habits and todos..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder:text-gray-400 border border-gray-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-xs text-gray-400">
              Press Enter to send
            </span>
            <span className="text-xs text-gray-400">
              {messages.filter((m) => m.role !== "progress").length} messages
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
