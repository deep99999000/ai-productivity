"use client";
import { Settings, Pencil, Flag } from "lucide-react";

const GoalSettingsCard = () => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-900">Goal Settings</h3>
      <Settings className="text-gray-400 w-5 h-5" />
    </div>
    <div className="space-y-4 text-sm">
      <button className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100/50"><Pencil className="w-4 h-4 mr-3 text-gray-500" /> Edit Name & Description</button>
      <button className="w-full text-left flex items-center p-2 rounded-lg hover:bg-gray-100/50"><Flag className="w-4 h-4 mr-3 text-gray-500" /> Set Category</button>
    </div>
  </div>
);

export default GoalSettingsCard;
