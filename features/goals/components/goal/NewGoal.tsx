import BaseDialog from "@/components/BaseDialog";
import { DateField } from "@/components/form/DateField";
import { SelectField } from "@/components/form/SelectField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateUniqueId } from "@/lib/generateUniqueId";
import { newGoalsAction } from "@/features/goals/goalaction";
import type { NewGoal } from "@/features/goals/goalSchema";
import { useGoal } from "@/features/goals/GoalStore";
import useUser from "@/store/useUser";
import { Label } from "@radix-ui/react-label";
import { Target, Sparkles, Calendar, Tag, FileText, Loader2, Wand2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios"; // 👈 import axios

const NewGoalDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const { register, control, handleSubmit, reset, setValue } = useForm<NewGoal>({
    defaultValues: {
      name: "",
      description: "",
      category: "Personal",
      status: "Not Started",
    },
  });

  const { user } = useUser();
  const { addGoal } = useGoal();

  // Loading states for refinement
  const [loadingName, setLoadingName] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);

  // Call refine name API
  const refineName = async (name: string) => {
    try {
      setLoadingName(true);
      const res = await axios.post("/api/content/refine/name", {
        type: "goal",
        name,
      });
      if (res.data?.refinedName) {
        setValue("name", res.data.refinedName); // update form field
      }
    } catch (err) {
      console.error("Refine name error:", err);
    } finally {
      setLoadingName(false);
    }
  };

  // Call refine description API
  const refineDescription = async (description: string) => {
    try {
      setLoadingDesc(true);
      const res = await axios.post("/api/content/refine/description", {
        type: "goal",
        description,
      });
      if (res.data?.refinedDescription) {
        setValue("description", res.data.refinedDescription); // update form field
      }
    } catch (err) {
      console.error("Refine description error:", err);
    } finally {
      setLoadingDesc(false);
    }
  };

  // Form Submit Handler
  const onSub = async (data: NewGoal) => {
    const id = generateUniqueId();
    console.log("Creating new goal with ID:", id);

    // Add to local state
    addGoal({
      ...data,
      user_id: user,
      id,
    });

    // Close dialog & send to backend
    setIsOpen(false);
    await newGoalsAction({
      ...data,
      user_id: user,
      id,
    });

    reset(); // Reset form
  };

  return (
    <div>
      <BaseDialog isOpen={isOpen} setisOpen={setIsOpen} title="" description="">
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Create New Goal
            </h2>
            <p className="text-gray-600">
              Set your target and track your progress
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSub)} className="space-y-5">
            {/* Goal Name */}
           <div className="space-y-2">
  <Label
    htmlFor="name"
    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
  >
    <Sparkles className="w-4 h-4 text-blue-500" />
    Goal Name *
  </Label>
  <div className="relative w-full">
    <Input
      id="name"
      placeholder="What do you want to achieve?"
      {...register("name", { required: true })}
      className="h-11 px-4 pr-12 w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
    />
<Button
  type="button"
  size="sm"
  variant="ghost"
  onClick={async () => {
    const current = (document.getElementById("name") as HTMLInputElement)?.value;
    if (current) await refineName(current);
  }}
  disabled={loadingName}
  className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg 
             bg-gradient-to-r from-blue-500 to-purple-600 
             hover:from-blue-600 hover:to-purple-700 text-white shadow-md 
             hover:shadow-lg transition-all duration-200 
             disabled:opacity-50 disabled:cursor-not-allowed"
  title="Enhance with AI"
>
  {loadingName ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <Wand2 className="w-4 h-4" />
  )}
</Button>

  </div>
</div>

{/* Description */}
<div className="space-y-2">
  <Label
    htmlFor="description"
    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
  >
    <FileText className="w-4 h-4 text-gray-500" />
    Description
  </Label>
  <div className="relative w-full">
   <textarea
  id="description"
  placeholder="Add details about your goal"
  {...register("description")}
  rows={3} // 👈 shows 3 lines
  className="px-4 py-2 flex-1 border-2 border-gray-200 rounded-lg 
             focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
             transition-all duration-200 resize-none w-full"
/>

<Button
  type="button"
  size="sm"
  variant="ghost"
  onClick={async () => {
    const current = (document.getElementById("description") as HTMLInputElement)?.value;
    if (current) await refineDescription(current);
  }}
  disabled={loadingDesc}
  className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg 
             bg-gradient-to-r from-blue-500 to-purple-600 
             hover:from-blue-600 hover:to-purple-700 text-white shadow-md 
             hover:shadow-lg transition-all duration-200 
             disabled:opacity-50 disabled:cursor-not-allowed"
  title="Enhance with AI"
>
  {loadingDesc ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <Wand2 className="w-4 h-4" />
  )}
</Button>


    
  </div>
</div>

            {/* Category, Status, Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  Category
                </Label>
                <SelectField<NewGoal>
                  name="category"
                  control={control}
                  options={[
                    "Career",
                    "Learning",
                    "Personal",
                    "Finance",
                    "Coding",
                  ]}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  Status
                </Label>
                <SelectField<NewGoal>
                  name="status"
                  control={control}
                  options={["Not Started", "In Process", "Completed"]}
                />
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Target Date
                </Label>
                <DateField<NewGoal> name="endDate" control={control} />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="sm:order-1 px-6 py-2.5 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="sm:order-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                <Target className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </form>
        </div>
      </BaseDialog>
    </div>
  );
};

export default NewGoalDialog;
