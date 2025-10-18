import { Button } from "@/components/ui/button";
import NewGoalDialog from "@/features/goals/goal/NewGoal";
import GoalTemplateLibrary from "@/features/goals/goal/GoalTemplateLibrary";
import { useDialog } from "@/hooks/usedialog";
import { Plus, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NewGoalButton = () => {
  const { open, isOpen, close } = useDialog();
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);

  return (
    <>
      <div className="flex items-center">
        {/* Main New Goal Button */}
        <Button
          onClick={open}
          size="lg"
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 rounded-l-xl transform hover:scale-105 font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
        
        {/* Dropdown for Templates */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-3 py-4 rounded-r-xl transform hover:scale-105 border-l border-indigo-600"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={open}>
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Goal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsTemplateLibraryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Use Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialogs */}
      <NewGoalDialog isOpen={isOpen} setIsOpen={close} />
      <GoalTemplateLibrary 
        isOpen={isTemplateLibraryOpen} 
        setIsOpen={setIsTemplateLibraryOpen} 
      />
    </>
  );
};

export default NewGoalButton;
