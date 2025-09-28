"use client";
import { FileText } from "lucide-react";

interface NotesSectionProps {
  notes: { id: number; user: string; text: string; ago: string }[];
}

const NotesSection = ({ notes }: NotesSectionProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-4">
      <FileText className="text-indigo-500 mr-3 w-6 h-6" />
      <h2 className="text-xl font-bold text-gray-900">Notes & Updates Feed</h2>
    </div>
    <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-200/80 mb-4">
      <textarea className="w-full bg-transparent border-0 focus:ring-0 resize-none text-gray-700 p-0" placeholder="Add a note or update..." rows={3} disabled />
      <div className="flex justify-end mt-2">
        <button className="bg-indigo-600 text-white font-semibold py-1.5 px-4 rounded-lg shadow-lg shadow-indigo-500/30 text-sm" disabled>Post</button>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">(Notes persistence not implemented)</p>
    </div>
    <div className="space-y-4">
      {notes.map((n) => (
        <div key={n.id} className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-1 text-indigo-600 font-semibold text-xs">{n.user[0]}</div>
          <div>
            <p className="text-sm"><span className="font-semibold text-gray-800">{n.user}</span> {n.text}</p>
            <p className="text-xs text-gray-400">{n.ago}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default NotesSection;
