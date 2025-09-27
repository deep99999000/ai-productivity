"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { Wand2, Loader2, Sparkles } from "lucide-react";

import useUser from "@/store/useUser";
import { newhabitaction } from "@/features/habits/utils/Habitaction";
import { generateUniqueId } from "@/lib/generateUniqueId";
import { useHabit } from "@/features/habits/utils/HabitStore";

export type HabitFormValues = {
  id?: number;
  name: string;
  description?: string;
  emoji?: string;
  frequency: "daily" | "weekly" | "custom";
};

interface HabitFormProps {
  trigger?: React.ReactNode;
  submitLabel?: string;
  defaultValues?: HabitFormValues;
  onSubmit?: (values: HabitFormValues) => void; // ← added external handler
}

export default function HabitForm({
  trigger,
  submitLabel = "Add Habit",
  defaultValues,
  onSubmit,
}: HabitFormProps) {
  const { addHabit } = useHabit();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState(defaultValues?.emoji ?? "✅");
  const [loadingName, setLoadingName] = useState(false);

  const { register, handleSubmit, reset, setValue, getValues } = useForm<HabitFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      frequency: defaultValues?.frequency ?? "daily",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name,
        description: defaultValues.description ?? "",
        frequency: defaultValues.frequency ?? "daily",
      });
      setEmoji(defaultValues.emoji ?? "✅");
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (values: HabitFormValues) => {
    // If external onSubmit is passed (from Dashboard), use it
    if (onSubmit) {
      onSubmit({ ...values, emoji });
      setOpen(false);
      return;
    }

    if (!user) return console.warn("No user found — habit not saved");

    const id = values.id ?? generateUniqueId();
    const payload = {
      id,
      name: values.name,
      description: null, // description removed
      emoji: emoji ?? null,
      frequency: values.frequency,
      user_id: user,
      createdAt: new Date(),
      highestStreak: 0,
      checkInDays: [],
    };

    addHabit(payload);
    await newhabitaction(payload);

    reset();
    setEmoji("✅");
    setOpen(false);
  };

  // AI refine handlers
  const refining = React.useRef<{ name: boolean; description: boolean }>({ name: false, description: false });
  const [, force] = React.useState(0);

  const refineName = async () => {
    const current = getValues("name");
    if (!current) return;
    setLoadingName(true);
    try {
      const res = await axios.post("/api/content/refine/name", { type: "habit", name: current });
      if (res.data?.refinedName) setValue("name", res.data.refinedName);
    } catch (e) { console.error(e); }
    setLoadingName(false);
  };

  const formBody = (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-3xl leading-none"
              aria-label="Pick emoji"
            >
              {emoji}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 border-none shadow-xl">
            {/* @ts-ignore */}
            <Picker
              data={data}
              onEmojiSelect={(e: any) => setEmoji(e.native)}
              theme={
                typeof window !== "undefined" &&
                document.documentElement.classList.contains("dark")
                  ? "dark"
                  : "light"
              }
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
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" /> Name
          </Label>
          <div className="relative w-full">
            <Input
              id="habit-name"
              placeholder="What habit do you want to build?"
              {...register("name", { required: true })}
              className="h-11 px-4 pr-12 w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={refineName}
              disabled={loadingName}
              className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enhance with AI"
            >
              {loadingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {submitLabel}
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
            <DialogTitle>{defaultValues ? "Edit Habit" : "New Habit"}</DialogTitle>
            <DialogDescription>
              Track consistency with a clear setup.
            </DialogDescription>
          </DialogHeader>
          {formBody}
        </DialogContent>
      </Dialog>
    );
  }

  return formBody;
}
