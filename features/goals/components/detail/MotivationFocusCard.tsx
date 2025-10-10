"use client";
import { Flame, Timer, CheckCircle2 } from "lucide-react";

interface MotivationFocusCardProps {
  overallProgress: number;
}

const MotivationFocusCard = ({ overallProgress }: MotivationFocusCardProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <Flame className="text-indigo-500 mr-3 w-6 h-6" />
      <h3 className="text-lg font-bold text-slate-900">Motivation & Focus</h3>
    </div>
    
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/60 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Flame className="text-orange-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-orange-800">Goal Streak</p>
              <p className="text-xs text-orange-600">Consecutive active days</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-orange-600">{overallProgress > 0 ? "1" : "0"}</span>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/60 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Timer className="text-indigo-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-indigo-800">Focus Sessions</p>
              <p className="text-xs text-indigo-600">Today's productivity</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-indigo-600">—</span>
        </div>
      </div>
      
      {overallProgress === 100 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Achievement Unlocked!</p>
              <p className="text-xs text-emerald-600">Goal successfully completed</p>
            </div>
          </div>
        </div>
      )}
      
      {overallProgress > 0 && overallProgress < 100 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 p-3 rounded-xl text-center">
          <p className="text-sm text-blue-700 font-medium">
            {overallProgress >= 75 ? "Almost there! Keep pushing forward 🚀" :
             overallProgress >= 50 ? "Great progress! You're halfway there 💪" :
             overallProgress >= 25 ? "Good start! Building momentum 📈" :
             "Every step counts! You've got this 🌟"}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default MotivationFocusCard;
