"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHabit } from "@/features/habits/HabitStore";

export type HabitFormValues = {
  id?: number;
  name: string;
  description?: string;
  emoji?: string;
  frequency: "daily" | "weekly" | "custom";
  days?: number[]; // 0=Sun
};

export default function HabitForm({
  trigger,
  defaultValues,
  onSubmit: onSubmitProp,
  submitLabel,
}: {
  trigger?: React.ReactNode;
  defaultValues?: Partial<HabitFormValues>;
  onSubmit?: (values: HabitFormValues) => void;
  submitLabel?: string;
}) {
  const { addHabit, updateHabit } = useHabit();
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState(defaultValues?.emoji ?? "✅");
  const { register, handleSubmit, watch, setValue } = useForm<HabitFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      frequency: (defaultValues?.frequency as any) ?? "daily",
      days: (defaultValues?.days as any) ?? [1, 2, 3, 4, 5],
    },
  });

  const frequency = watch("frequency");

  const onSubmit = (v: HabitFormValues) => {
    const payload = { ...v, emoji } as any;
    if (onSubmitProp) onSubmitProp(payload);
    else if (defaultValues?.id) {
      updateHabit({ ...(payload as any), id: defaultValues.id } as any);
    } else {
      addHabit({ ...(payload as any), user_id: 0 } as any);
    }
    setOpen(false);
  };

  const DaysSelector = () => (
    <div className="flex gap-2 flex-wrap">
      {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => {
        const active = (watch("days") ?? []).includes(idx);
        return (
          <button
            type="button"
            key={idx}
            onClick={() => {
              const cur = new Set(watch("days") ?? []);
              if (cur.has(idx)) cur.delete(idx);
              else cur.add(idx);
              setValue("days", Array.from(cur).sort());
            }}
            className={`h-8 w-8 text-sm rounded-full border transition ${
              active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800"
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );

  const formBody = (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-3xl leading-none" aria-label="pick emoji">
              {emoji}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none shadow-xl">
            {/* @ts-ignore - emoji-mart doesn't ship types here */}
            <Picker
              data={data}
              onEmojiSelect={(e: any) => setEmoji(e.native)}
              theme={typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"}
              previewPosition="none"
              navPosition="bottom"
              searchPosition="none"
              perLine={10}
              emojiButtonSize={28}
              emojiSize={20}
            />
          </PopoverContent>
        </Popover>
        <div className="grid gap-2 flex-1">
          <Label>Name</Label>
          <Input placeholder="e.g., Drink Water" {...register("name", { required: true })} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Description (optional)</Label>
        <Textarea placeholder="Short motivation or details" {...register("description")} />
      </div>

      <div className="grid gap-2">
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={(v: any) => setValue("frequency", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Daily" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(frequency === "weekly" || frequency === "custom") && (
        <div className="grid gap-2">
          <Label>Days</Label>
          <DaysSelector />
        </div>
      )}

      <div className="pt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {submitLabel ?? (defaultValues?.id ? "Save" : "Add")}
        </Button>
      </div>
    </motion.form>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{defaultValues?.id ? "Edit Habit" : "New Habit"}</DialogTitle>
            <DialogDescription>Track consistency with a clear setup.</DialogDescription>
          </DialogHeader>
          {formBody}
        </DialogContent>
      </Dialog>
    );
  }

  return formBody;
}
