"use client";
import { Flame, Timer, CheckCircle2 } from "lucide-react";

interface MotivationFocusCardProps {
  overallProgress: number;
}

const MotivationFocusCard = ({ overallProgress }: MotivationFocusCardProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <Flame className="text-indigo-500 mr-3 w-6 h-6" />
      <h2 className="text-xl font-bold text-gray-900">Motivation & Focus</h2>
    </div>
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg">
        <div className="flex items-center">
          <Flame className="text-orange-500 mr-3 w-8 h-8" />
          <div>
            <p className="font-semibold text-gray-800">Goal Streak</p>
            <p className="text-sm text-gray-500">Consecutive days with progress</p>
          </div>
        </div>
        <span className="font-bold text-2xl text-orange-500">{overallProgress > 0 ? 1 : 0}</span>
      </div>
      <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-lg">
        <div className="flex items-center">
          <Timer className="text-indigo-500 mr-3 w-8 h-8" />
          <div>
            <p className="font-semibold text-gray-800">Focus Time</p>
            <p className="text-sm text-gray-500">Tracking not enabled</p>
          </div>
        </div>
        <span className="font-bold text-2xl text-indigo-600">—</span>
      </div>
      {overallProgress === 100 && (
        <div className="flex items-center bg-teal-50/50 p-3 rounded-lg border border-teal-200/80">
          <CheckCircle2 className="text-teal-500 mr-3 w-8 h-8" />
          <p className="font-semibold text-teal-800">Badge Awarded: Goal Complete!</p>
        </div>
      )}
    </div>
  </div>
);

export default MotivationFocusCard;
