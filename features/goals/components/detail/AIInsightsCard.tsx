"use client";
import { Activity } from "lucide-react";

interface AIInsightsCardProps {
  alert?: string;
  estimate?: string;
}

const AIInsightsCard = ({ alert, estimate }: AIInsightsCardProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-3">
      <Activity className="text-blue-700 mr-3 w-6 h-6" />
      <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
    </div>
    {alert && (
      <div className="bg-red-50/50 border border-red-200/80 p-3 rounded-lg">
        <p className="text-sm text-red-800"><span className="font-semibold">Progress Alert:</span> {alert}</p>
      </div>
    )}
    <div className="bg-teal-50/50 border border-teal-200/80 p-3 rounded-lg mt-3">
      <p className="text-sm text-teal-800"><span className="font-semibold">Estimate:</span> {estimate || "Not enough data"}</p>
    </div>
  </div>
);

export default AIInsightsCard;
