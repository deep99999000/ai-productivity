"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flame, RotateCcw, Edit, Trash2, Check, X, TrendingUp } from "lucide-react";
import HabitForm from "./HabitForm";
import type { Habit } from "@/features/habits/habitSchema";

// Weekday labels
const WEEK_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function HabitCard({ habit }: { habit: Habit }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ✅ Static values instead of computed logic
  const streak = 5;
  const weekCompletion = 70;
  const doneToday = false;

  //get streak 
  const getstreak = (habit: Habit) => {
    
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="group border-slate-200/60 hover:border-slate-300/80 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="text-3xl leading-none select-none mt-1 shrink-0 filter drop-shadow-sm">
                  {habit.emoji ?? "✅"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg leading-snug truncate">
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {habit.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                      Daily
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 text-xs font-semibold border border-orange-200/50">
                  <Flame className="h-3.5 w-3.5"/>
                  <span>{streak}</span>
                  <span className="opacity-75">days</span>
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <HabitForm
                    defaultValues={{
                      id: habit.id as number,
                      name: habit.name,
                      description: habit.description ?? undefined,
                      emoji: habit.emoji ?? "✅",
                      frequency: "daily",
                    }}
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 hover:scale-105 transition-transform">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />

                  <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-transform">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete habit?</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-slate-600">
                        This will remove "{habit.name}" permanently.
                      </p>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => setConfirmOpen(false)}>Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* Static Week Grid */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-500 mb-3 px-0.5">
              {WEEK_LETTERS.map((l, i) => (
                <span key={i} className="w-8 text-center">{l}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, idx) => (
                <div 
                  key={idx}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200"
                >
                  {idx === 2 ? <Check className="h-3.5 w-3.5" /> : idx === 4 ? <X className="h-3.5 w-3.5" /> : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Week progress */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Week Progress: <span className="font-semibold text-emerald-600">{weekCompletion}%</span>
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>

          {/* Check-in button */}
          <div className="mt-5">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {doneToday ? (
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                  <RotateCcw className="h-4 w-4 mr-2" /> 
                  Uncheck Today
                </Button>
              ) : (
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                  <Check className="h-4 w-4 mr-2" />
                  Check In Now
                </Button>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
