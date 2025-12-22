"use client";

import { useEffect, useState } from "react";
import { useNotes } from "@/features/notes/store";
import useUser from "@/store/useUser";
import NotesSidebar from "@/features/notes/components/NotesSidebar";
import NoteEditor from "@/features/notes/components/NoteEditor";
import EmptyState from "@/features/notes/components/EmptyState";

export default function NotesPage() {
  const { user } = useUser();
  const { notes, currentNote, isLoading, fetchNotes, createNote, setCurrentNote } = useNotes();
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes(user);
    }
  }, [user, fetchNotes]);

  const handleCreateNote = async (parentId?: number) => {
    if (!user) return;
    const newNote = await createNote(user, parentId);
    if (newNote) {
      setCurrentNote(newNote);
    }
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(500, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div 
        style={{ width: sidebarWidth }} 
        className="flex-shrink-0 border-r border-gray-200 bg-gray-50/50"
      >
        <NotesSidebar 
          notes={notes} 
          currentNote={currentNote}
          onSelectNote={setCurrentNote}
          onCreateNote={handleCreateNote}
          isLoading={isLoading}
        />
      </div>

      {/* Resizer */}
      <div
        className={`w-1 cursor-col-resize hover:bg-blue-400 transition-colors ${isResizing ? "bg-blue-400" : "bg-transparent"}`}
        onMouseDown={handleMouseDown}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentNote ? (
          <NoteEditor note={currentNote} />
        ) : (
          <EmptyState onCreateNote={() => handleCreateNote()} />
        )}
      </div>
    </div>
  );
}
