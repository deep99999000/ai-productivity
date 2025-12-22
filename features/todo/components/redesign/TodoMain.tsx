"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/features/todo/schema";
import TodoSidebar from "./TodoSidebar";
import TodoList from "./TodoList";
import TodoDetail from "./TodoDetail";
import { useTodo } from "@/features/todo/store";
import { useDialog } from "@/hooks/usedialog";
import NewTodoDialog from "../form/NewTodo";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { Goal } from "@/features/goals/schema";

interface TodoMainProps {
  allTodo: Todo[];
  allGoals: Goal[];
}

export type FilterType = "all" | "today" | "upcoming" | "inbox" | "summary" | "goal";

export default function TodoMain({ allTodo, allGoals }: TodoMainProps) {
  const { todos, setTodos } = useTodo();
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("today");
  const [search, setSearch] = useState("");
  const { isOpen, open, close } = useDialog();

  useEffect(() => {
    setTodos(allTodo);
  }, [allTodo, setTodos]);

  const selectedTodo = todos.find((t) => t.id === selectedTodoId) || null;
  const selectedGoal = allGoals.find((g) => g.id === selectedGoalId);

  return (
    <div className="h-full w-full bg-white overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden md:block">
          <TodoSidebar
            filter={filter}
            setFilter={setFilter}
            selectedGoalId={selectedGoalId}
            setSelectedGoalId={setSelectedGoalId}
            todos={todos}
            goals={allGoals}
          />
        </ResizablePanel>
        
        <ResizableHandle className="hidden md:flex w-px bg-gray-200 hover:bg-blue-400 transition-colors" />

        {/* Main List */}
        <ResizablePanel defaultSize={selectedTodo ? 40 : 80} minSize={30}>
          <TodoList
            todos={todos}
            filter={filter}
            selectedGoalId={selectedGoalId}
            selectedGoalName={selectedGoal?.name}
            search={search}
            setSearch={setSearch}
            selectedTodoId={selectedTodoId}
            setSelectedTodoId={setSelectedTodoId}
            onAddTodo={open}
          />
        </ResizablePanel>

        {/* Detail View */}
        {selectedTodo && (
          <>
            <ResizableHandle className="hidden lg:flex w-px bg-gray-200 hover:bg-blue-400 transition-colors" />
            <ResizablePanel defaultSize={40} minSize={30} maxSize={60} className="hidden lg:block">
              <TodoDetail todo={selectedTodo} onClose={() => setSelectedTodoId(null)} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      
      <NewTodoDialog isOpen={isOpen} setIsOpen={close} defaultgoalId={selectedGoalId} />
    </div>
  );
}
