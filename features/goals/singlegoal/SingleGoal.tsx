"use client";

import { ShowDate } from '@/components/ShowDate';
import { categoryStyles } from '@/features/goals/components/catstyle';
import { DeleteGoalsAction } from '@/features/goals/actions/goalaction';
import type { Goal } from '@/features/goals/types/goalSchema';
import { useGoal } from '@/features/goals/utils/GoalStore';
import { useSubgoal } from '@/features/subGoals/subgoalStore';
import { Calendar, Clock, Trash2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const GoalCard = ({ goal }: { goal: Goal }) => {
  const { id, name, description, category, endDate } = goal;
  const { deleteGoal } = useGoal();
  const { subgoals } = useSubgoal();

  // Filter subgoals for this goal
  const goalSubgoals = subgoals.filter((sg) => sg.goal_id === id);

  // Determine status from subgoals
  let calculatedStatus: "Not Started" | "In Progress" | "Completed";
  if (goalSubgoals.length === 0) {
    calculatedStatus = "Not Started";
  } else if (goalSubgoals.every((sg) => sg.status === "Completed")) {
    calculatedStatus = "Completed";
  } else {
    calculatedStatus = "In Progress";
  }



  const getCategoryStyle = (cat: string) =>
    categoryStyles[cat] || {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
      text: 'text-gray-700',
      icon: 'bg-gray-100',
      cardBg: 'bg-gradient-to-br from-gray-50/70 via-white to-slate-50/40',
      emoji: '🎯',
      gradient: 'from-gray-500 to-slate-500'
    };

  const categoryStyle = getCategoryStyle(category || '');

  const handleDelete = async () => {
    deleteGoal(id);
    DeleteGoalsAction(id);
  };

  // Calculate progress percentage
  const progressPercentage = goalSubgoals.length > 0 
    ? (goalSubgoals.filter(sg => sg.status === "Completed").length / goalSubgoals.length) * 100 
    : 0;

  return (
    <div className="relative group">
      {/* Delete Button - visible only on hover */}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-600 shadow-lg hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Link href={`/goals/${id}`} passHref>
        <div
          className={`group ${categoryStyle.cardBg} rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col cursor-pointer relative`}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300">
            <div 
              className={`h-full bg-gradient-to-r ${categoryStyle.gradient} transition-all duration-1000 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-start gap-5 mb-6">
              <div
                className={`p-4 rounded-2xl ${categoryStyle.icon} text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                {categoryStyle.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-slate-900 transition-colors leading-tight mb-3">
                  {name}
                </h3>
                {category && (
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${categoryStyle.bg} ${categoryStyle.text} group-hover:shadow-md transition-all duration-300`}
                  >
                    {category}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-auto space-y-4">
              {/* Progress Stats */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-bold text-slate-900">{Math.round(progressPercentage)}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${categoryStyle.gradient} transition-all duration-1000 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Subgoals Count */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>{goalSubgoals.filter(sg => sg.status === "Completed").length} of {goalSubgoals.length} subgoals completed</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${categoryStyle.bg} ${categoryStyle.text} group-hover:shadow-md transition-all duration-300`}
                >
                  {calculatedStatus === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {calculatedStatus === "In Progress" && <TrendingUp className="w-3 h-3 mr-1" />}
                  {calculatedStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GoalCard;
