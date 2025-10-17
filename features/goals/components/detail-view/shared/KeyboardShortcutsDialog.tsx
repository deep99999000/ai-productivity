"use client";

import { useState } from "react";
import { Command } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["1", "2", "3", "4"], description: "Switch between tabs" },
      { keys: ["Esc"], description: "Close dialogs" },
    ],
  },
  {
    category: "Tasks",
    items: [
      { keys: ["Ctrl", "N"], description: "Create new task" },
      { keys: ["Ctrl", "F"], description: "Focus on filters" },
      { keys: ["Space"], description: "Toggle task completion" },
    ],
  },
  {
    category: "Focus Mode",
    items: [
      { keys: ["Alt", "A"], description: "Show all tasks" },
      { keys: ["Alt", "T"], description: "Show today's tasks" },
      { keys: ["Alt", "U"], description: "Show urgent tasks" },
      { keys: ["Alt", "I"], description: "Show in progress tasks" },
    ],
  },
];

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-1 text-xs font-mono bg-slate-100 border border-slate-300 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
