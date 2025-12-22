"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Grid2X2,
  List,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import Loading from "@/components/Loading";
import type { Habit, NewHabit } from "@/features/habits/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import HabitForm, { type HabitFormValues } from "../form/HabitForm";
import { generateUniqueId } from "@/lib/generateUniqueId";
import useUser from "@/store/useUser";
import { useHabit } from "@/features/habits/store";
import { getAllUserHabits, newhabitaction } from "@/features/habits/actions";
import HabitListPanel from "../HabitListPanel";
import HabitOverviewPanel from "../HabitOverviewPanel";

const HabitsDashboard = ({ user_id }: { user_id: string }) => {
  const {
    allHabits: habits,
    setHabits,
    addHabit,
  } = useHabit();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useUser();

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const a = (await getAllUserHabits(user_id)) as Habit[];
        setHabits(a);
        if (a && a.length > 0) {
          setSelectedHabit(a[0]);
        }
      } catch (e) {
        setError("Failed to load habits.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user_id) {
      fetchHabits();
    } else {
      setIsLoading(false);
    }
  }, [user_id, setHabits]);

  // Update selectedHabit when habits change
  useEffect(() => {
    if (selectedHabit) {
      const updated = habits.find((h) => h.id === selectedHabit.id);
      if (updated) {
        setSelectedHabit(updated);
      }
    }
  }, [habits, selectedHabit?.id]);

  const handleAddHabit = async (values: HabitFormValues) => {
    const newHabit: NewHabit = {
      id: generateUniqueId(),
      user_id: user,
      name: values.name,
      description: values.description,
      emoji: values.emoji,
      createdAt: new Date(),
      checkInDays: [],
      highestStreak: 0,
    };
    addHabit(newHabit);
    await newhabitaction(newHabit);
    if (isMobile) {
      setDrawerOpen(false);
    } else {
      setDialogOpen(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading your habits..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Habit List */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <HabitListPanel
            habits={habits}
            selectedHabit={selectedHabit}
            selectedDate={selectedDate}
            dateFilter={dateFilter}
            viewMode={viewMode}
            onHabitSelect={setSelectedHabit}
            onDateSelect={setSelectedDate}
            onDateFilterClear={() => setDateFilter(null)}
            onViewModeChange={setViewMode}
            onAddHabit={() => isMobile ? setDrawerOpen(true) : setDialogOpen(true)}
          />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-gray-200 hover:bg-blue-400 transition-colors" />

        {/* Right Panel - Habit Details / Analytics */}
        <ResizablePanel defaultSize={55} minSize={35}>
          <HabitOverviewPanel selectedHabit={selectedHabit} />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mobile Drawer for adding habit */}
      {isMobile ? (
        <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>New Habit</DrawerTitle>
              <DrawerDescription>
                Add a new habit to track your progress.
              </DrawerDescription>
            </DrawerHeader>
            <HabitForm onSubmit={handleAddHabit} />
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track your progress.
              </DialogDescription>
            </DialogHeader>
            <HabitForm onSubmit={handleAddHabit} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HabitsDashboard;
