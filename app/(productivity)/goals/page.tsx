"use client";

import { useEffect, useState } from "react";
import AllGoals from "@/features/goals/components/goal/allGoals";
import Loading from "@/components/Loading";
import { useGoal } from "@/features/goals/GoalStore";
import { fetchUserGoals } from "@/features/goals/utils/fetchGoals";
export default function GoalPage() {
  const { allGoals, setGoal } = useGoal();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (allGoals.length) {
      setLoading(false);
      return;
    }
    else{
      fetchUserGoals()
        .then(setGoal)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [allGoals.length, setGoal]);

  if (loading) return <Loading message="Loading your goals..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="px-4 py-2 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        <AllGoals goals={allGoals} />
      </div>
    </div>
  );
}
