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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const { register, handleSubmit, reset } = useForm<HabitFormValues>({
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

    // Otherwise, default behavior
    if (!user) return console.warn("No user found — habit not saved");

    const id = values.id ?? generateUniqueId();
    const payload = {
      id,
      name: values.name,
      description: values.description ?? null,
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
          <Label>Name</Label>
          <Input
            placeholder="e.g., Drink Water"
            {...register("name", { required: true })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Description (optional)</Label>
        <Textarea
          placeholder="Short motivation or details"
          {...register("description")}
        />
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
