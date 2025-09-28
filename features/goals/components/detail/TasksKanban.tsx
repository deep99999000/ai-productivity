"use client";
import { useState, useCallback, useMemo } from "react";
import type { Todo } from "@/features/todo/todoSchema";
import { FileText, GripVertical, Loader2 } from "lucide-react";
import { useTodo } from "@/features/todo/todostore";
import useUser from "@/store/useUser";
import { updateTodosStatus, updatetodoData } from "@/features/todo/todoaction";
import { cn } from "@/lib/utils";

interface TasksKanbanProps {
  backlog: Todo[];
  inProgress: Todo[];
  done: Todo[];
}

type ColumnKey = "backlog" | "inProgress" | "done";

interface ColumnProps {
  title: string;
  columnKey: ColumnKey;
  accent: string; // color classes
  count: number;
  onDropTask: (column: ColumnKey, todoId: number) => void;
  isOver: boolean;
  children: React.ReactNode;
}

const Column = ({ title, accent, count, children, onDropTask, columnKey, isOver }: ColumnProps) => {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const idStr = e.dataTransfer.getData("text/task-id");
        if (!idStr) return;
        const id = Number(idStr);
        if (!Number.isNaN(id)) onDropTask(columnKey, id);
      }}
      className={cn(
        "rounded-2xl p-4 border border-transparent transition-colors duration-200 flex flex-col gap-3 min-h-[260px] bg-gradient-to-b",
        accent,
        isOver && "ring-2 ring-offset-2 ring-indigo-400/60"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-700 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-current opacity-80" />
          {title}
        </h3>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/60 backdrop-blur text-gray-700 shadow-sm">
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
}

const TaskCard = ({ todo, onDragStart, onDragEnd, isDragging }: TaskCardProps) => {
  const isDone = !!todo.isDone;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", String(todo.id));
        onDragStart(todo.id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative rounded-xl border bg-white/90 backdrop-blur p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
        isDone ? "opacity-90 border-teal-200" : "border-gray-200",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="pt-0.5 flex-shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className={cn("text-sm font-medium break-words", isDone ? "text-gray-500 line-through" : "text-gray-800")}>{todo.name}</p>
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
                  todo.priority === "high" && "bg-red-100 text-red-600",
                  todo.priority === "medium" && "bg-amber-100 text-amber-600",
                  todo.priority === "low" && "bg-emerald-100 text-emerald-600"
                )}
              >
                {todo.priority?.toUpperCase()}
              </span>
            )}
            {isDone && (
              <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-600">DONE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksKanban = ({ backlog, inProgress, done }: TasksKanbanProps) => {
  const { todos, updateTodo } = useTodo();
  const { user } = useUser();
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<ColumnKey | null>(null);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  // Quick lookup map for current tasks (prop arrays are derived upstream; rely on store for runtime updates)
  const byId = useMemo(() => {
    const map = new Map<number, Todo>();
    todos.forEach((t) => map.set(t.id, t as Todo));
    return map;
  }, [todos]);

  const applyMoveTransform = (todo: Todo, target: ColumnKey): Todo => {
    const updated: Todo = { ...todo };
    if (target === "backlog") {
      updated.isDone = false;
      updated.startDate = null as any; // maintain type compatibility
      updated.endDate = null as any;
    } else if (target === "inProgress") {
      updated.isDone = false;
      if (!updated.startDate) updated.startDate = new Date() as any;
      updated.endDate = null as any;
    } else if (target === "done") {
      updated.isDone = true;
      if (!updated.startDate) updated.startDate = new Date() as any;
      updated.endDate = new Date() as any;
    }
    return updated;
  };

  const persistChanges = async (original: Todo, updated: Todo) => {
    try {
      setSavingIds((prev) => new Set(prev).add(updated.id));
      // If isDone changed -> update status
      if (original.isDone !== updated.isDone) {
        await updateTodosStatus(user, updated.id, !!updated.isDone);
      }
      // Persist date / meta changes
      await updatetodoData(updated);
    } catch (e) {
      // Revert optimistic update on failure
      updateTodo(original);
      console.error(e);
    } finally {
      setSavingIds((prev) => {
        const n = new Set(prev);
        n.delete(updated.id);
        return n;
      });
    }
  };

  const handleDrop = useCallback(
    (target: ColumnKey, todoId: number) => {
      const todo = byId.get(todoId);
      if (!todo) return;

      // Determine current column
      const currently: ColumnKey = todo.isDone
        ? "done"
        : todo.startDate
        ? "inProgress"
        : "backlog";
      if (currently === target) return; // no change

      const original = { ...todo };
      const updated = applyMoveTransform(todo, target);
      updateTodo(updated);
      persistChanges(original, updated);
      setDraggingId(null);
      setDropTarget(null);
    },
    [byId, updateTodo]
  );

  const onDragStart = (id: number) => setDraggingId(id);
  const onDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <FileText className="text-indigo-500 mr-3 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">Tasks Board</h2>
        </div>
        <div className="flex items-center text-xs text-gray-500 gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Backlog {backlog.length}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress {inProgress.length}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> Done {done.length}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Column
          title="Backlog"
          columnKey="backlog"
          accent="from-gray-50 to-gray-100/60"
          count={backlog.length}
          onDropTask={handleDrop}
          isOver={dropTarget === "backlog"}
        >
          {backlog.map((t) => (
            <TaskCard
              key={t.id}
              todo={t}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingId === t.id}
            />
          ))}
          {backlog.length === 0 && (
            <p className="text-xs text-gray-400 italic">No tasks here.</p>
          )}
        </Column>
        <Column
          title="In Progress"
            columnKey="inProgress"
          accent="from-blue-50 to-indigo-50/60"
          count={inProgress.length}
          onDropTask={handleDrop}
          isOver={dropTarget === "inProgress"}
        >
          {inProgress.map((t) => (
            <TaskCard
              key={t.id}
              todo={t}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingId === t.id}
            />
          ))}
          {inProgress.length === 0 && (
            <p className="text-xs text-blue-400 italic">Nothing active.</p>
          )}
        </Column>
        <Column
          title="Done"
          columnKey="done"
          accent="from-teal-50 to-emerald-50/60"
          count={done.length}
          onDropTask={handleDrop}
          isOver={dropTarget === "done"}
        >
          {done.map((t) => (
            <TaskCard
              key={t.id}
              todo={t}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingId === t.id}
            />
          ))}
          {done.length === 0 && (
            <p className="text-xs text-teal-400 italic">No completions yet.</p>
          )}
        </Column>
      </div>
      {savingIds.size > 0 && (
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving changes...
        </div>
      )}
      <p className="mt-4 text-[10px] text-gray-400">Drag tasks between columns. Moving to In Progress sets a start time; moving to Done sets completion time.</p>
    </div>
  );
};

export default TasksKanban;
