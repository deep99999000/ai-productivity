"use client";

import { useState, useEffect } from "react";
import { X, Clock, Link2, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PomodoroTask } from "../schema";
import { cn } from "@/lib/utils";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: PomodoroTask | null;
  onSave: (task: Partial<PomodoroTask>) => void;
  habits?: Array<{ id: number; name: string }>;
  goals?: Array<{ id: number; goal: string }>;
}

const COLORS = [
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Green
  "#F59E0B", // Orange/Yellow
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
];

const EMOJIS = ["💪", "📚", "💻", "🎯", "🍕", "🏆", "📖", "🎵", "🏋️"];

const DURATION_PRESETS = [5, 10, 15, 25, 30, 45, 60];

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
  habits = [],
  goals = [],
}: TaskDialogProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(10);
  const [color, setColor] = useState("#8B5CF6");
  const [emoji, setEmoji] = useState("💪");
  const [habitId, setHabitId] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDuration(Math.floor(task.duration / 60));
      setColor(task.color || "#8B5CF6");
      setEmoji(task.emoji || "💪");
      setHabitId(task.habitId || null);
      setGoalId(task.goalId || null);
    } else {
      setName("");
      setDuration(10);
      setColor("#8B5CF6");
      setEmoji("💪");
      setHabitId(null);
      setGoalId(null);
    }
    setShowAdvanced(false);
  }, [task, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      duration: duration * 60,
      color,
      emoji,
      habitId: habitId || null,
      goalId: goalId || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 bg-white overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{task ? "Edit Task" : "New Focus Task"}</DialogTitle>
        </VisuallyHidden>

        <div className="p-6 space-y-4">
          {/* Preview Card */}
          <div 
            className="flex items-center gap-3 p-4 rounded-lg transition-colors"
            style={{ backgroundColor: `${color}18` }}
          >
            <div
              className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-base">
                {name || "Task name"}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{duration} minutes</p>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <Input
              placeholder="What do you want to focus on?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 text-base border-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Duration */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              Duration
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDuration(preset)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    duration === preset
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {preset}m
                </button>
              ))}
              <Input
                type="number"
                min="1"
                max="180"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                className="w-20 h-10 text-sm text-center px-2 border-gray-300"
              />
            </div>
          </div>

          {/* Icon & Color */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600" />
              Icon & Color
            </label>
            
            {/* Emoji Grid */}
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-11 h-11 rounded-lg text-xl transition-all flex items-center justify-center border-2",
                    emoji === e
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
            
            {/* Color Selection */}
            <div className="flex gap-2.5 pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all",
                    color === c ? "ring-2 ring-offset-2 ring-gray-500 scale-105" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Link Options */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Link2 className="w-4 h-4 text-gray-600" />
              Link to Habit or Goal
              <span className="text-base text-gray-500 ml-auto">
                {showAdvanced ? "−" : "+"}
              </span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Link to Habit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Habit</label>
                  <Select
                    value={habitId?.toString() || "none"}
                    onValueChange={(value) => setHabitId(value === "none" ? null : parseInt(value))}
                  >
                    <SelectTrigger className="h-10 text-sm border-gray-300">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {habits.map((habit) => (
                        <SelectItem key={habit.id} value={habit.id.toString()}>
                          {habit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Link to Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Goal</label>
                  <Select
                    value={goalId?.toString() || "none"}
                    onValueChange={(value) => setGoalId(value === "none" ? null : parseInt(value))}
                  >
                    <SelectTrigger className="h-10 text-sm border-gray-300">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id.toString()}>
                          {goal.goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50/80">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="px-5 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
          >
            {task ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
