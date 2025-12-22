"use client";
import { useState, useCallback } from "react";
import type { Todo } from "@/features/todo/schema";
import { FileText, GripVertical, Loader2 } from "lucide-react";
import { useTodo } from "@/features/todo/store";
import useUser from "@/store/useUser";
import { updateTodosStatus, updatetodoData } from "@/features/todo/actions";
import { cn } from "@/lib/utils";

type ColumnKey = "backlog" | "inProgress" | "done";

interface ColumnProps {
  title: string;
  columnKey: ColumnKey;
  accent: string;
  count: number;
  onDropTask: (column: ColumnKey, todoId: number) => void;
  onDragEnter: (columnKey: ColumnKey) => void;
  isOver: boolean;
  children: React.ReactNode;
}

const Column = ({ title, accent, count, children, onDropTask, columnKey, isOver, onDragEnter }: ColumnProps) => {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDragEnter={() => onDragEnter(columnKey)}
      onDrop={(e) => {
        e.preventDefault();
        const idStr = e.dataTransfer.getData("text/task-id");
        if (!idStr) return;
        const id = Number(idStr);
        if (!isNaN(id)) onDropTask(columnKey, id);
      }}
      className={cn(
        "rounded-2xl p-4 border border-transparent transition-all duration-200 flex flex-col gap-3 min-h-[260px] bg-gradient-to-b",
        accent,
        isOver && "ring-2 ring-offset-2 ring-indigo-500/70 bg-opacity-90"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-700 flex items-center gap-2">
          <span className={cn("inline-flex h-2 w-2 rounded-full", 
            columnKey === 'backlog' ? 'bg-gray-400' :
            columnKey === 'inProgress' ? 'bg-blue-500' : 'bg-teal-500'
          )} />
          {title}
        </h3>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/70 backdrop-blur text-gray-700 shadow-sm">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-3">
        {children}
      </div>
    </div>
  );
};

interface TaskCardProps {
  todo: Todo;
  onDragStart: (id: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isSaving: boolean;
}

const TaskCard = ({ todo, onDragStart, onDragEnd, isDragging, isSaving }: TaskCardProps) => {
  const isDone = !!todo.isDone;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", String(todo.id));
        e.dataTransfer.effectAllowed = "move";
        onDragStart(todo.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-xl border bg-white/95 backdrop-blur p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing",
        isDone ? "border-teal-200/70" : "border-gray-200",
        isDragging && "opacity-50 scale-[0.98] shadow-lg",
        isSaving && "opacity-80"
      )}
    >
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        </div>
      )}
      <div className="flex items-start gap-2 relative z-10">
        <div className="pt-0.5 flex-shrink-0 text-gray-400 group-hover:text-indigo-600 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className={cn("text-sm font-medium break-words", isDone ? "text-gray-500 line-through" : "text-gray-800")}>
            {todo.name}
          </p>
          {todo.subgoalName && (
            <p className="text-[11px] font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
              {todo.subgoalName}
            </p>
          )}
          <div className="flex flex-wrap gap-1 pt-1">
            {todo.priority && (
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-full",
                  todo.priority === "high" && "bg-red-100 text-red-700",
                  todo.priority === "medium" && "bg-amber-100 text-amber-700",
                  todo.priority === "low" && "bg-emerald-100 text-emerald-700"
                )}
              >
                {todo.priority?.toUpperCase()}
              </span>
            )}
            {isDone && (
              <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">
                DONE
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Accept props — do NOT re-derive from store
interface TasksKanbanProps {
  backlog: Todo[];
  inProgress: Todo[];
  done: Todo[];
}

const TasksKanban = ({ backlog, inProgress, done }: TasksKanbanProps) => {
  const { updateTodo } = useTodo(); // only need updateTodo, not full todos
  const { user } = useUser();
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<ColumnKey | null>(null);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  // Helper: determine current column of a todo based on its state
  const getCurrentColumn = (todo: Todo): ColumnKey => {
    if (todo.isDone) return "done";
    if (todo.startDate) return "inProgress";
    return "backlog";
  };

  const applyMoveTransform = (todo: Todo, target: ColumnKey): Todo => {
    const updated: Todo = { ...todo };
    if (target === "backlog") {
      updated.isDone = false;
      updated.startDate = null;
      updated.endDate = null;
    } else if (target === "inProgress") {
      updated.isDone = false;
      if (!updated.startDate) updated.startDate = new Date();
      updated.endDate = null;
    } else if (target === "done") {
      updated.isDone = true;
      if (!updated.startDate) updated.startDate = new Date();
      updated.endDate = new Date();
    }
    return updated;
  };

  const persistChanges = async (original: Todo, updated: Todo) => {
    try {
      setSavingIds((prev) => new Set(prev).add(updated.id));
      if (original.isDone !== updated.isDone) {
        await updateTodosStatus(user, updated.id, !!updated.isDone);
      }
      await updatetodoData(updated);
    } catch (e) {
      // Revert optimistic update
      updateTodo(original);
      console.error("Failed to save task move:", e);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(updated.id);
        return next;
      });
    }
  };

  const handleDrop = useCallback(
    (target: ColumnKey, todoId: number) => {
      // Find the todo in any of the three columns
      const todo =
        backlog.find(t => t.id === todoId) ||
        inProgress.find(t => t.id === todoId) ||
        done.find(t => t.id === todoId);

      if (!todo) return;

      const currently = getCurrentColumn(todo);
      if (currently === target) {
        setDraggingId(null);
        setDropTarget(null);
        return;
      }

      const original = { ...todo };
      const updated = applyMoveTransform(todo, target);
      
      // Optimistic update
      updateTodo(updated);
      
      // Persist
      persistChanges(original, updated);
      
      setDraggingId(null);
      setDropTarget(null);
    },
    [backlog, inProgress, done, updateTodo]
  );

  const onDragStart = (id: number) => setDraggingId(id);
  const onDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const onDragEnter = (columnKey: ColumnKey) => {
    setDropTarget(columnKey);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-gray-200/60">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <FileText className="text-indigo-600 mr-3 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Tasks Board</h2>
        </div>
        <div className="flex items-center text-xs text-gray-500 gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Backlog ({backlog.length})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress ({inProgress.length})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> Done ({done.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Column
          title="Backlog"
          columnKey="backlog"
          accent="from-gray-50 to-gray-100/70"
          count={backlog.length}
          onDropTask={handleDrop}
          onDragEnter={onDragEnter}
          isOver={dropTarget === "backlog"}
        >
          {backlog.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">No tasks here.</p>
          ) : (
            backlog.map((t) => (
              <TaskCard
                key={t.id}
                todo={t}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggingId === t.id}
                isSaving={savingIds.has(t.id)}
              />
            ))
          )}
        </Column>

        <Column
          title="In Progress"
          columnKey="inProgress"
          accent="from-blue-50 to-indigo-50/70"
          count={inProgress.length}
          onDropTask={handleDrop}
          onDragEnter={onDragEnter}
          isOver={dropTarget === "inProgress"}
        >
          {inProgress.length === 0 ? (
            <p className="text-xs text-blue-400 italic py-4 text-center">Nothing active.</p>
          ) : (
            inProgress.map((t) => (
              <TaskCard
                key={t.id}
                todo={t}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggingId === t.id}
                isSaving={savingIds.has(t.id)}
              />
            ))
          )}
        </Column>

        <Column
          title="Done"
          columnKey="done"
          accent="from-teal-50 to-emerald-50/70"
          count={done.length}
          onDropTask={handleDrop}
          onDragEnter={onDragEnter}
          isOver={dropTarget === "done"}
        >
          {done.length === 0 ? (
            <p className="text-xs text-teal-400 italic py-4 text-center">No completions yet.</p>
          ) : (
            done.map((t) => (
              <TaskCard
                key={t.id}
                todo={t}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggingId === t.id}
                isSaving={savingIds.has(t.id)}
              />
            ))
          )}
        </Column>
      </div>

      <p className="mt-5 text-[11px] text-gray-500 italic">
        Drag tasks between columns. Moving to <span className="font-medium text-blue-600">In Progress</span> sets a start time; 
        moving to <span className="font-medium text-teal-600">Done</span> marks completion.
      </p>
    </div>
  );
};

export default TasksKanban;