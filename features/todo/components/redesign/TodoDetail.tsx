"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/features/todo/schema";
import { useTodo } from "@/features/todo/store";
import { updatetodoData, updateTodosStatus } from "@/features/todo/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isToday } from "date-fns";
import { Calendar as CalendarIcon, Flag, MessageSquare, MoreHorizontal, Type, ChevronRight, Check, Inbox } from "lucide-react";
import TiptapEditor from "@/components/tiptap/TiptapEditor";
import useUser from "@/store/useUser";
import axios from "axios";

interface TodoDetailProps {
  todo: Todo;
  onClose: () => void;
}

export default function TodoDetail({ todo, onClose }: TodoDetailProps) {
  const { updateTodo, toggleTodo } = useTodo();
  const { user } = useUser();
  
  const [name, setName] = useState(todo.name);
  const [description, setDescription] = useState(todo.description || "");
  const [date, setDate] = useState<Date | undefined>(todo.startDate ? new Date(todo.startDate) : undefined);
  const [priority, setPriority] = useState(String(todo.priority || "normal").toLowerCase());

  // Sync local state when todo changes
  useEffect(() => {
    setName(todo.name);
    setDescription(todo.description || "");
    setDate(todo.startDate ? new Date(todo.startDate) : undefined);
    setPriority(String(todo.priority || "normal").toLowerCase());
  }, [todo]);

  const handleSave = async () => {
    if (!user) return;

    const updatedTodo = {
      ...todo,
      name,
      description,
      startDate: date || null,
      priority,
    };

    updateTodo(updatedTodo);
    await updatetodoData(updatedTodo);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        name !== todo.name ||
        description !== (todo.description || "") ||
        date?.getTime() !== (todo.startDate ? new Date(todo.startDate).getTime() : undefined) ||
        priority !== String(todo.priority || "normal").toLowerCase()
      ) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [name, description, date, priority]);

  const handleToggle = async () => {
      toggleTodo(todo.id);
      if (user) {
          await updateTodosStatus(user, todo.id, !todo.isDone);
      }
  }

  const handleAIGenerate = async (): Promise<string> => {
    try {
      const response = await axios.post("/api/content/generate/todo", {
        todoName: name,
        currentDescription: description,
        context: {
          priority,
          category: todo.category,
          goalName: todo.goalName,
          subgoalName: todo.subgoalName,
        },
      });

      if (response.data?.content) {
        return response.data.content;
      }
      return "";
    } catch (error) {
      console.error("AI generate error:", error);
      return "";
    }
  };

  const handleAIRefine = async (currentContent: string, selectedText?: string): Promise<string> => {
    try {
      const response = await axios.post("/api/content/refine/todo", {
        content: currentContent,
        selectedText: selectedText,
        todoName: name,
        context: {
          priority,
          category: todo.category,
          goalName: todo.goalName,
          subgoalName: todo.subgoalName,
        },
      });

      if (response.data?.content) {
        return response.data.content;
      }
      return currentContent;
    } catch (error) {
      console.error("AI refine error:", error);
      return currentContent;
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
      if (!selectedDate) {
          setDate(undefined);
          return;
      }
      const newDate = new Date(selectedDate);
      if (date) {
          newDate.setHours(date.getHours());
          newDate.setMinutes(date.getMinutes());
      } else {
          // Default to end of day or current time? Let's keep it 00:00 or current time if today
          newDate.setHours(12, 0, 0, 0);
      }
      setDate(newDate);
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!date) return;
      const [hours, minutes] = e.target.value.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setDate(newDate);
  }

  const getPriorityColor = (p: string) => {
      switch(String(p).toLowerCase()) {
          case "high": return "text-red-500 fill-red-500";
          case "medium": return "text-orange-500 fill-orange-500";
          case "low": return "text-blue-500 fill-blue-500";
          default: return "text-gray-400";
      }
  }

  const getDateLabel = () => {
      if (!date) return "Due Date";
      const daysLeft = differenceInDays(date, new Date());
      let relativeTime = "";
      
      if (isToday(date)) {
          relativeTime = ", Today";
      } else if (daysLeft > 0) {
          relativeTime = `, ${daysLeft}d left`;
      } else if (daysLeft < 0) {
          relativeTime = `, ${Math.abs(daysLeft)}d overdue`;
      }

      return (
          <span className={cn(daysLeft < 0 && !isToday(date) ? "text-red-500" : "text-blue-500")}>
              {format(date, "MMM d")}{relativeTime}
          </span>
      );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-3 text-gray-500">
          <Checkbox 
            checked={todo.isDone || false} 
            onCheckedChange={handleToggle}
            className="w-5 h-5 rounded-sm border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("h-auto p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent font-normal", !date && "text-gray-400")}>
                    <CalendarIcon className={cn("mr-2 h-4 w-4", date && "text-blue-500")} />
                    {getDateLabel()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                />
                <div className="p-3 border-t border-gray-100">
                    <label className="text-xs text-gray-500 mb-1 block">Time</label>
                    <Input 
                        type="time" 
                        value={date ? format(date, "HH:mm") : ""} 
                        onChange={handleTimeChange}
                        disabled={!date}
                        className="w-full"
                    />
                </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-50">
                        <Flag className={cn("w-4 h-4 transition-colors", getPriorityColor(priority))} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setPriority("high")} className="gap-2">
                        <Flag className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>High</span>
                        {priority === "high" && <Check className="w-3 h-3 ml-auto text-blue-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriority("medium")} className="gap-2">
                        <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span>Medium</span>
                        {priority === "medium" && <Check className="w-3 h-3 ml-auto text-blue-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriority("low")} className="gap-2">
                        <Flag className="w-4 h-4 text-blue-500 fill-blue-500" />
                        <span>Low</span>
                        {priority === "low" && <Check className="w-3 h-3 ml-auto text-blue-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriority("normal")} className="gap-2">
                        <Flag className="w-4 h-4 text-gray-400" />
                        <span>None</span>
                        {priority === "normal" && <Check className="w-3 h-3 ml-auto text-blue-500" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <span>{todo.goalName || "Inbox"}</span>
            <ChevronRight className="w-3 h-3" />
        </div>

        {/* Title */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-xl font-bold text-gray-900 placeholder-gray-400 border-none focus:ring-0 p-0 bg-transparent mb-4"
          placeholder="Task name"
        />

        {/* Description Editor */}
        <div className="flex-1">
          <TiptapEditor
            key={todo.id}
            content={description}
            onChange={setDescription}
            variant="ghost"
            enableAI={true}
            onAIGenerate={handleAIGenerate}
            onAIRefine={handleAIRefine}
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex justify-between items-center text-gray-400">
          <div className="flex items-center gap-2 text-xs hover:text-gray-600 cursor-pointer transition-colors">
              <Inbox className="w-4 h-4" />
              <span>{todo.goalName || "Inbox"}</span>
          </div>
          <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <Type className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
              </Button>
          </div>
      </div>
    </div>
  );
}
