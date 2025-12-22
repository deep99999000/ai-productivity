
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { GeneratedGoal } from "@/features/goals/components/form/GenerateGoalWithAIDialog";
type GeneratedGoalCardProps = {
  goal: GeneratedGoal & { tempId: number };
  onEdit: (tempId: number, updates: Partial<GeneratedGoal>) => void;
  onRemove: (tempId: number) => void;
  onSave: (goal: GeneratedGoal & { tempId: number }) => void;
};

export default function GeneratedGoalCard({
  goal,
  onEdit,
  onRemove,
  onSave,
}: GeneratedGoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description || "");
  const [category, setCategory] = useState(goal.category || "General");

  const handleSave = () => {
    onEdit(goal.tempId, { name, description, category });
    setIsEditing(false);
  };

  return (
    <Card className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow transition-shadow duration-200">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="flex items-start justify-between">
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-semibold text-sm md:text-base bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none flex-1"
              autoFocus
            />
          ) : (
            <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">
              {name}
            </h4>
          )}

          <div className="flex-shrink-0 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onRemove(goal.tempId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {isEditing ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs text-gray-600 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none resize-none h-16"
            placeholder="Describe this goal..."
          />
        ) : (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {category}
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-500" />
            <span>{new Date(goal.endDate).toLocaleDateString()}</span>
          </Badge>
        </div>

        {/* Save Button */}
        <div className="pt-1">
          <Button
            type="button"
            size="sm"
            className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 hover:shadow-[0_0_15px_2px_rgba(147,51,234,0.2)] transition-all duration-300 text-white text-xs font-medium"
            onClick={() => onSave({ ...goal, name, description, category })}
          >
            <Plus className="w-3 h-3 mr-1.5" /> Save Goal
          </Button>
        </div>
      </div>
    </Card>
  );
}