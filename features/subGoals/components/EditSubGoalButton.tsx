import { Button } from '@/components/ui/button';
import EditSubgoalDialog from '@/features/subGoals/components/EditSubgoalDialog';
import type { Subgoal } from '@/features/subGoals/subGoalschema';
import { useDialog } from '@/hooks/usedialog';
import { Pencil, PlusCircle } from 'lucide-react';
import React from 'react';

const EditSubGoalButton = ({ data }: { data: Subgoal }) => {
    const { open, isOpen, close } = useDialog();
    return (
        <>
                    <Button
            onClick={open}
            size="lg"
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-xl transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
          >
            <Pencil className="w-5 h-5 mr-2" />
            Edit Subgoal
          </Button>
            <EditSubgoalDialog open={isOpen} setisOpen={close} initialData={data} />
        </>
    );
};

export default EditSubGoalButton;