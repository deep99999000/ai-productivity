"use client";
import { Settings, Pencil, Flag } from "lucide-react";

const GoalSettingsCard = () => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-slate-900">Goal Settings</h3>
      <Settings className="text-slate-400 w-5 h-5" />
    </div>
    <div className="space-y-2">
      <button className="w-full text-left flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mr-3 transition-colors">
          <Pencil className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Edit Details</p>
          <p className="text-xs text-slate-500">Update name & description</p>
        </div>
      </button>
      
      <button className="w-full text-left flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mr-3 transition-colors">
          <Flag className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Set Category</p>
          <p className="text-xs text-slate-500">Organize your goals</p>
        </div>
      </button>
    </div>
  </div>
);

export default GoalSettingsCard;
