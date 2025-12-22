"use client";

import { FileText, Plus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onCreateNote: () => void;
}

export default function EmptyState({ onCreateNote }: EmptyStateProps) {
  const templates = [
    { icon: "📝", title: "Blank page", description: "Start from scratch" },
    { icon: "📋", title: "Meeting notes", description: "Template for meetings" },
    { icon: "✅", title: "To-do list", description: "Task management" },
    { icon: "📚", title: "Journal", description: "Daily reflections" },
    { icon: "💡", title: "Brainstorm", description: "Capture ideas" },
    { icon: "📊", title: "Project plan", description: "Plan your project" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Notes
        </h2>
        <p className="text-gray-500 mb-8">
          Create your first note to get started. Organize your thoughts, ideas, and knowledge in one place.
        </p>

        {/* Create Button */}
        <button
          onClick={onCreateNote}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Create your first note
        </button>

        {/* Templates */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Quick Start Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {templates.map((template, idx) => (
              <button
                key={idx}
                onClick={onCreateNote}
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors group"
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Feature Hint */}
        <div className="mt-10 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">AI-powered writing</p>
              <p className="text-sm text-gray-600">
                Type <code className="px-1.5 py-0.5 bg-gray-100 rounded text-purple-600 font-mono text-xs">/</code> in the editor to access AI generation and refinement tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
