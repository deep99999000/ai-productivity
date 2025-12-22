"use client";

import { Copy } from "lucide-react";
import { PomodoroTask } from "../schema";
import { format } from "date-fns";

interface TimelinePanelProps {
  task: PomodoroTask | null;
  currentTime?: Date;
}

export default function TimelinePanel({ task, currentTime = new Date() }: TimelinePanelProps) {
  // Generate timeline hours (show 5 hours around current time)
  const currentHour = currentTime.getHours();
  const hours = Array.from({ length: 6 }, (_, i) => {
    const hour = currentHour - 2 + i;
    return hour < 0 ? hour + 24 : hour > 23 ? hour - 24 : hour;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: `${task?.color || "#3B82F6"}20` }}
          >
            {task?.emoji || "🎯"}
          </div>
          <span className="text-base font-medium text-gray-900">
            {task?.name || "Pomo"}
          </span>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Copy className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="relative">
          {hours.map((hour, index) => {
            const isCurrentHour = hour === currentHour;
            const formattedHour = hour === 0 ? "0" : hour.toString();
            
            return (
              <div key={index} className="relative h-16">
                {/* Hour Label */}
                <div className="absolute left-0 -top-2 text-xs text-gray-400 w-6">
                  {formattedHour}
                </div>

                {/* Timeline Line */}
                <div className="absolute left-10 right-0 top-0 h-px bg-gray-100" />

                {/* Current Time Indicator */}
                {isCurrentHour && (
                  <div 
                    className="absolute left-8 right-0 flex items-center"
                    style={{ 
                      top: `${(currentTime.getMinutes() / 60) * 64}px` 
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="flex-1 h-px bg-red-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
