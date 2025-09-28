"use client";
import { Users } from "lucide-react";

const TeamMembersCard = () => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <Users className="text-indigo-500 mr-3 w-6 h-6" />
      <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
    </div>
    <p className="text-sm text-gray-500">Team feature not implemented.</p>
  </div>
);

export default TeamMembersCard;
