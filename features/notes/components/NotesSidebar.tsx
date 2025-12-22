"use client";

import { useState } from "react";
import { Note } from "@/db/schema/notes";
import { ChevronRight, ChevronDown, FileText, Plus, MoreHorizontal, Search, Star, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/features/notes/store";
import useUser from "@/store/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotesSidebarProps {
  notes: Note[];
  currentNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: (parentId?: number) => void;
  isLoading: boolean;
}

interface NoteItemProps {
  note: Note;
  level: number;
  notes: Note[];
  currentNote: Note | null;
  onSelect: (note: Note) => void;
  onCreateSubpage: (parentId: number) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number, isFavorite: boolean) => void;
}

function NoteItem({ note, level, notes, currentNote, onSelect, onCreateSubpage, onDelete, onToggleFavorite }: NoteItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const childNotes = notes.filter((n) => n.parentId === note.id);
  const hasChildren = childNotes.length > 0;
  const isActive = currentNote?.id === note.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all",
          isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700",
          level > 0 && "ml-3"
        )}
        style={{ paddingLeft: `${8 + level * 12}px` }}
        onClick={() => onSelect(note)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expand/Collapse */}
        <button
          className={cn(
            "p-0.5 rounded hover:bg-gray-200 transition-colors",
            !hasChildren && "invisible"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )}
        </button>

        {/* Icon */}
        <span className="text-base flex-shrink-0">{note.icon || "📄"}</span>

        {/* Title */}
        <span className={cn(
          "flex-1 truncate text-sm",
          isActive ? "font-medium" : "font-normal"
        )}>
          {note.title || "Untitled"}
        </span>

        {/* Actions */}
        {isHovered && (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              onClick={() => onCreateSubpage(note.id)}
              title="Add subpage"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onToggleFavorite(note.id, !note.isFavorite)}>
                  <Star className={cn("w-4 h-4 mr-2", note.isFavorite && "fill-yellow-400 text-yellow-400")} />
                  {note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(note.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" style={{ marginLeft: `${level * 12}px` }} />
          {childNotes.map((child) => (
            <NoteItem
              key={child.id}
              note={child}
              level={level + 1}
              notes={notes}
              currentNote={currentNote}
              onSelect={onSelect}
              onCreateSubpage={onCreateSubpage}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesSidebar({ notes, currentNote, onSelectNote, onCreateNote, isLoading }: NotesSidebarProps) {
  const { user } = useUser();
  const { updateNote, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  const rootNotes = notes.filter((n) => !n.parentId);
  const favoriteNotes = notes.filter((n) => n.isFavorite);

  const filteredNotes = searchQuery
    ? notes.filter((n) => n.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : rootNotes;

  const handleDelete = async (id: number) => {
    if (!user) return;
    await deleteNote(id, user);
  };

  const handleToggleFavorite = async (id: number, isFavorite: boolean) => {
    if (!user) return;
    await updateNote(id, user, { isFavorite });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </h2>
          <button className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Favorites */}
        {favoriteNotes.length > 0 && !searchQuery && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Favorites
            </div>
            {favoriteNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                level={0}
                notes={notes}
                currentNote={currentNote}
                onSelect={onSelectNote}
                onCreateSubpage={onCreateNote}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* All Notes */}
        <div>
          {!searchQuery && (
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
              <span>Pages</span>
              <button
                onClick={() => onCreateNote()}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="New page"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {searchQuery ? "No notes found" : "No notes yet"}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                level={0}
                notes={notes}
                currentNote={currentNote}
                onSelect={onSelectNote}
                onCreateSubpage={onCreateNote}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer - New Page Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => onCreateNote()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New page
        </button>
      </div>
    </div>
  );
}
