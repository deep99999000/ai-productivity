"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";

export function DateTimePicker({ field }: { field: ControllerRenderProps }) {
  const [dateOnly, setDateOnly] = useState<Date | null>(null);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmPm] = useState("AM");

  useEffect(() => {
    if (!dateOnly) return;

    let h = parseInt(hour);
    const m = parseInt(minute);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    const finalDate = new Date(dateOnly);
    finalDate.setHours(h);
    finalDate.setMinutes(m);
    field.onChange(finalDate);
  }, [dateOnly, hour, minute, ampm]);

  return (
    <div className="w-full max-w-sm space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-medium shadow-sm rounded-lg"
          >
            {field.value ? format(field.value, "PPP p") : "Pick date & time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 space-y-4 rounded-2xl shadow-xl border border-muted">
          <Calendar
            mode="single"
            selected={dateOnly ?? undefined}
            onSelect={(d) => d && setDateOnly(d)}
            initialFocus
          />

          <div className="grid grid-cols-3 gap-2 items-end">
            {/* Hour */}
            <div>
              <Label className="text-xs">Hour</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="text-center rounded-lg"
              />
            </div>

            {/* Minute */}
            <div>
              <Label className="text-xs">Minute</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="text-center rounded-lg"
              />
            </div>

            {/* AM/PM */}
            <div>
              <Label className="text-xs">AM/PM</Label>
              <select
                value={ampm}
                onChange={(e) => setAmPm(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
