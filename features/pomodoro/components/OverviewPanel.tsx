"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Sparkles, Trash2, Edit2 } from "lucide-react";
import { PomodoroSession, PomodoroTask } from "../schema";
import { format, isSameDay, startOfDay, subDays } from "date-fns";
import PomodoroAISection from "./PomodoroAISection";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ManualSessionDialog from "./ManualSessionDialog";
import EditSessionDialog from "./EditSessionDialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface OverviewPanelProps {
  sessions: PomodoroSession[];
  tasks: PomodoroTask[];
  selectedTask?: PomodoroTask | null;
  onAddSession: (session: any) => void;
  onDeleteSession: (id: number) => void;
  onUpdateSession: (id: number, data: any) => void;
}

export default function OverviewPanel({ 
  sessions, 
  tasks,
  selectedTask,
  onAddSession,
  onDeleteSession,
  onUpdateSession
}: OverviewPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "insights">("overview");
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<PomodoroSession | null>(null);
  const today = startOfDay(new Date());
  
  // Filter sessions if a task is selected
  const filteredSessions = selectedTask 
    ? sessions.filter(s => s.taskId === selectedTask.id)
    : sessions;
  
  // Calculate statistics
  const todaySessions = filteredSessions.filter((s) => 
    s.completed && isSameDay(new Date(s.startTime), today)
  );
  const todayPomo = todaySessions.length;
  const todayFocusMinutes = Math.floor(
    todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  
  const totalPomo = filteredSessions.filter((s) => s.completed).length;
  const totalFocusMinutes = Math.floor(
    filteredSessions.filter((s) => s.completed).reduce((sum, s) => sum + s.duration, 0) / 60
  );
  const totalHours = Math.floor(totalFocusMinutes / 60);
  const totalMins = totalFocusMinutes % 60;

  // Group sessions by date for Focus Record
  const sessionsByDate = filteredSessions
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .reduce((acc, session) => {
      const dateKey = format(new Date(session.startTime), "MMM d");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, PomodoroSession[]>);

  // Prepare chart data (Last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dateKey = format(date, "MMM d");
    const daySessions = filteredSessions.filter(s => 
        s.completed && isSameDay(new Date(s.startTime), date)
    );
    // Use 1 decimal place for minutes to show short sessions
    const minutes = Math.round((daySessions.reduce((acc, s) => acc + s.duration, 0) / 60) * 10) / 10;
    return {
        date: format(date, "EEE"), // Mon, Tue
        fullDate: dateKey,
        minutes
    };
  });

  const getTaskName = (taskId: number) => {
    return tasks.find((t) => t.id === taskId)?.name || "Unknown";
  };

  const formatSessionTime = (session: PomodoroSession) => {
    const start = format(new Date(session.startTime), "h:mm a");
    const end = session.endTime 
      ? format(new Date(session.endTime), "h:mm a") 
      : format(new Date(new Date(session.startTime).getTime() + session.duration * 1000), "h:mm a");
    return `${start} - ${end}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <ManualSessionDialog 
        open={manualDialogOpen} 
        onOpenChange={setManualDialogOpen}
        tasks={tasks}
        onSave={onAddSession}
      />

      <EditSessionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        session={sessionToEdit}
        tasks={tasks}
        onSave={onUpdateSession}
      />

      {/* Tab Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "overview"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
              activeTab === "insights"
                ? "bg-indigo-50 text-indigo-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <>
          {/* Stats Section */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
        
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Today's Pomo */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Today's Pomo</p>
                <p className="text-2xl font-semibold text-gray-900">{todayPomo}</p>
              </div>
              
              {/* Today's Focus */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Today's Focus</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {todayFocusMinutes}<span className="text-base text-gray-500 ml-0.5">m</span>
                </p>
              </div>
              
              {/* Total Pomo */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Pomo</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPomo}</p>
              </div>
              
              {/* Total Focus Duration */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Total Focus Duration</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalHours}<span className="text-base text-gray-500 ml-0.5">h</span>
                  {totalMins}<span className="text-base text-gray-500 ml-0.5">m</span>
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip 
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                            dataKey="minutes" 
                            fill="#3B82F6" 
                            radius={[4, 4, 0, 0]} 
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Focus Record Section */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Focus Record</h2>
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => setManualDialogOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Session Timeline */}
            <div className="space-y-6">
              {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
                <div key={date}>
                  <p className="text-sm text-gray-500 mb-3">{date}</p>
                  <div className="space-y-4">
                    {dateSessions.map((session) => (
                      <div key={session.id} className="flex items-start gap-3 group">
                        {/* Timeline dot and line */}
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                          <div className="w-px h-8 bg-gray-200 mt-1" />
                        </div>

                        {/* Session details */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{formatSessionTime(session)}</span>
                            </div>
                            
                            {/* Edit/Delete Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                        setSessionToEdit(session);
                                        setEditDialogOpen(true);
                                    }}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => onDeleteSession(session.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                            <span className="text-sm text-gray-700">
                              {getTaskName(session.taskId)}
                            </span>
                          </div>
                        </div>

                        {/* Duration */}
                        <span className="text-sm text-gray-400">
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(sessionsByDate).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No focus sessions yet
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <PomodoroAISection />
        </div>
      )}
    </div>
  );
}
