"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PomodoroTask } from "../schema";
import { format, addMinutes, differenceInMinutes, parse } from "date-fns";

interface ManualSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: PomodoroTask[];
  onSave: (sessionData: any) => void;
}

export default function ManualSessionDialog({
  open,
  onOpenChange,
  tasks,
  onSave,
}: ManualSessionDialogProps) {
  const [taskId, setTaskId] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState<number>(25);
  const [lastChanged, setLastChanged] = useState<"duration" | "endTime">("duration");

  // Initialize with current time
  useEffect(() => {
    if (open) {
      const now = new Date();
      setStartTime(format(now, "HH:mm"));
      setDuration(25);
      // End time will be calculated by effect
    }
  }, [open]);

  // Auto-calculate End Time or Duration
  useEffect(() => {
    if (!startTime) return;

    const today = new Date();
    const start = parse(startTime, "HH:mm", today);

    if (lastChanged === "duration") {
      const end = addMinutes(start, duration);
      setEndTime(format(end, "HH:mm"));
    } else if (lastChanged === "endTime" && endTime) {
      const end = parse(endTime, "HH:mm", today);
      const diff = differenceInMinutes(end, start);
      setDuration(Math.max(0, diff));
    }
  }, [startTime, duration, endTime, lastChanged]);

  const handleSave = () => {
    if (!taskId || !startTime || !endTime) return;

    const today = new Date();
    const start = parse(startTime, "HH:mm", today);
    const end = parse(endTime, "HH:mm", today);

    onSave({
      taskId: parseInt(taskId),
      startTime: start,
      endTime: end,
      duration: duration * 60, // seconds
      completed: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Add Manual Session</DialogTitle>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Task</Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.emoji} {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label>End Time</Label>
              <Input 
                type="time" 
                value={endTime} 
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setLastChanged("endTime");
                }} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Duration (minutes)</Label>
            <Input 
              type="number" 
              value={duration} 
              onChange={(e) => {
                setDuration(parseInt(e.target.value) || 0);
                setLastChanged("duration");
              }} 
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Session</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
