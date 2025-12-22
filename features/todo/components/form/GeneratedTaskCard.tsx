// components/GeneratedTaskCard.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { GeneratedTask } from "./GenerateTasksWithAIDialog"; // Adjust path if needed

type GeneratedTaskCardProps = {
  task: GeneratedTask & { tempId: number };
  onEdit: (tempId: number, updates: Partial<GeneratedTask>) => void;
  onRemove: (tempId: number) => void;
  onSave: (task: GeneratedTask & { tempId: number }) => void;
};

export default function GeneratedTaskCard({
  task,
  onEdit,
  onRemove,
  onSave,
}: GeneratedTaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task.priority || "medium"
  );

  const handleSave = () => {
    onEdit(task.tempId, { name, description, priority });
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 border-red-300 bg-red-50";
      case "medium": return "text-yellow-600 border-yellow-300 bg-yellow-50";
      case "low": return "text-green-600 border-green-300 bg-green-50";
      default: return "text-gray-600 border-gray-300 bg-gray-50";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
      
      return date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
      <div className="space-y-3">
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-3">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none flex-1"
              autoFocus
            />
          ) : (
            <h4 className="font-medium text-gray-900 leading-snug flex-1">
              {name}
            </h4>
          )}

          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
              onClick={() => onRemove(task.tempId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {(description || isEditing) && (
          <div>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-gray-600 border border-gray-300 rounded p-2 focus:border-blue-500 outline-none resize-none h-16"
                placeholder="Add task description..."
              />
            ) : (
              <p className="text-sm text-gray-600 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Priority and Date */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="text-sm px-2 py-1 border border-gray-300 rounded focus:border-blue-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <Badge
                variant="outline"
                className={`text-xs ${getPriorityColor(priority)}`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {task.startDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Start: {formatDate(task.startDate)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {formatDate(task.endDate)}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="button"
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onSave({ ...task, name, description, priority })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
    </Card>
  );
}