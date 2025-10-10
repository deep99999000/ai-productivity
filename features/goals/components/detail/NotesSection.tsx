"use client";
import { FileText } from "lucide-react";

interface NotesSectionProps {
  notes: { id: number; user: string; text: string; ago: string }[];
}

const NotesSection = ({ notes }: NotesSectionProps) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex items-center mb-6">
      <FileText className="text-indigo-500 mr-3 w-6 h-6" />
      <h2 className="text-xl font-bold text-slate-900">Notes & Updates</h2>
      <span className="ml-2 text-sm text-slate-500">({notes.length})</span>
    </div>
    
    {/* Add Note Section */}
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 p-4 rounded-xl mb-6">
      <textarea 
        className="w-full bg-white/70 border border-slate-200 rounded-lg p-3 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" 
        placeholder="Add a note, thought, or update about your goal progress..." 
        rows={3} 
        disabled 
      />
      <div className="flex justify-between items-center mt-3">
        <p className="text-xs text-slate-500">Notes persistence coming soon</p>
        <button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-blue-500/25 text-sm transition-all duration-200" 
          disabled
        >
          Add Note
        </button>
      </div>
    </div>
    
    {/* Notes List */}
    <div className="space-y-4">
      {notes.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">No notes yet</p>
          <p className="text-xs text-slate-500">Start documenting your journey and insights</p>
        </div>
      ) : (
        notes.map((n) => (
          <div key={n.id} className="bg-gradient-to-r from-white to-slate-50 border border-slate-200/60 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {n.user[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-slate-800">{n.user}</span>
                  <span className="text-xs text-slate-400">• {n.ago}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{n.text}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default NotesSection;
