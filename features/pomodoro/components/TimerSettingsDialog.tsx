"use client";

import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDuration: number; // in seconds
  onSave: (duration: number) => void;
}

const DURATION_PRESETS = [5, 10, 15, 25, 30, 45, 60, 90];

export default function TimerSettingsDialog({
  open,
  onOpenChange,
  currentDuration,
  onSave,
}: TimerSettingsDialogProps) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setMinutes(Math.floor(currentDuration / 60));
    setSeconds(currentDuration % 60);
  }, [currentDuration, open]);

  const handleSave = () => {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      onSave(totalSeconds);
      onOpenChange(false);
    }
  };

  const totalMinutes = minutes + seconds / 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 bg-white rounded-2xl overflow-hidden border-0 shadow-xl">
        <VisuallyHidden>
          <DialogTitle>Set Duration</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Set Duration
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Time Display */}
          <div className="flex items-center justify-center gap-2">
            <div className="text-center">
              <Input
                type="number"
                min="0"
                max="180"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="w-20 h-14 text-3xl font-light text-center border-gray-200"
              />
              <span className="text-xs text-gray-400 mt-1">min</span>
            </div>
            <span className="text-3xl font-light text-gray-300 pb-5">:</span>
            <div className="text-center">
              <Input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                className="w-20 h-14 text-3xl font-light text-center border-gray-200"
              />
              <span className="text-xs text-gray-400 mt-1">sec</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setMinutes(preset);
                    setSeconds(0);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    Math.floor(totalMinutes) === preset && seconds === 0
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={minutes === 0 && seconds === 0}
            className="px-6 bg-blue-500 hover:bg-blue-600"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
