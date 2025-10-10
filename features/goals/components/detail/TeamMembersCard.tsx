"use client";
import { Users } from "lucide-react";

const TeamMembersCard = () => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <Users className="text-indigo-500 mr-3 w-6 h-6" />
      <h3 className="text-lg font-bold text-slate-900">Team Members</h3>
    </div>
    
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 p-4 rounded-xl text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Users className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700 mb-1">Solo Goal</p>
      <p className="text-xs text-slate-500">Team collaboration features coming soon</p>
    </div>
  </div>
);

export default TeamMembersCard;
