"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@/db/schema/notes";
import { useNotes } from "@/features/notes/store";
import useUser from "@/store/useUser";
import NotionEditor from "./NotionEditor";
import { 
  ChevronRight, 
  Image as ImageIcon, 
  Smile, 
  MoreHorizontal,
  Star,
  Copy,
  Trash2,
  Clock,
  Share2,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
} from "react-share";

interface NoteEditorProps {
  note: Note;
}

const EMOJI_LIST = ["📄", "📝", "📋", "📚", "📖", "✏️", "💡", "⭐", "🎯", "🚀", "💻", "🎨", "🔥", "💎", "🌟", "📌", "🗂️", "📁", "🗒️", "💭"];

export default function NoteEditor({ note }: NoteEditorProps) {
  const { user } = useUser();
  const { updateNote, createNote, deleteNote, notes, setCurrentNote, addToBreadcrumbs } = useNotes();
  
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverOptions, setShowCoverOptions] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [shareLink, setShareLink] = useState("");
  
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when note changes
  useEffect(() => {
    setTitle(note.title || "");
    setContent(note.content || "");
  }, [note.id, note.title, note.content]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Auto-save with debounce
  const saveNote = useCallback(() => {
    if (!user || !note.id) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateNote(note.id, user, { title, content });
    }, 1000);
  }, [title, content, note.id, user, updateNote]);

  useEffect(() => {
    saveNote();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, saveNote]);

  const handleIconChange = async (icon: string) => {
    if (!user) return;
    await updateNote(note.id, user, { icon });
    setShowIconPicker(false);
  };

  const handleShare = () => {
    const link = `${window.location.origin}/notes/${note.id}`;
    setShareLink(link);
    setShowShareDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;
    await deleteNote(note.id, user);
    setShowDeleteDialog(false);
  };

  const handleAddSubpage = async () => {
    if (!user) return;
    const newNote = await createNote(user, note.id);
    if (newNote) {
      addToBreadcrumbs({ id: note.id, title: note.title || "Untitled", icon: note.icon || "📄" });
      setCurrentNote(newNote);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(note.id, user);
      if (parentNote) {
        setCurrentNote(parentNote);
      } else {
        setCurrentNote(null);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    await updateNote(note.id, user, { isFavorite: !note.isFavorite });
  };

  const handleDuplicate = async () => {
    if (!user) return;
    const newNote = await createNote(user, note.parentId);
    if (newNote) {
      await updateNote(newNote.id, user, {
        title: `${note.title} (Copy)`,
        content: note.content,
        icon: note.icon,
      });
      setCurrentNote(newNote);
    }
  };

  // Get child pages
  const childPages = notes.filter((n) => n.parentId === note.id);

  // Get parent page for breadcrumb
  const parentNote = note.parentId ? notes.find((n) => n.id === note.parentId) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 left-0 right-0 z-10 h-12 flex items-center justify-between px-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {parentNote && (
            <>
              <button 
                className="hover:bg-gray-100 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all"
                onClick={() => setCurrentNote(parentNote)}
              >
                <span className="text-base">{parentNote.icon}</span>
                <span className="max-w-24 truncate text-gray-700">{parentNote.title || "Untitled"}</span>
              </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </>
          )}
          <span className="flex items-center gap-1.5 text-gray-800">
            <span className="text-base">{note.icon}</span>
            <span className="max-w-32 truncate font-medium">{title || "Untitled"}</span>
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleToggleFavorite}
            className={cn(
              "p-2 hover:bg-gray-100 rounded-lg transition-colors",
              note.isFavorite ? "text-yellow-500" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Star className={cn("w-4 h-4", note.isFavorite && "fill-yellow-500")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleToggleFavorite()}>
                <Star className={cn("w-4 h-4 mr-2", note.isFavorite && "fill-yellow-400 text-yellow-400")} />
                {note.isFavorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate()}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cover Image Area */}
      {note.coverImage ? (
        <div className="h-48 relative group">
          <img 
            src={note.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <button className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 hover:bg-white rounded-md text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            Change cover
          </button>
        </div>
      ) : isHoveringHeader && (
        <div className="">
       
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-16 py-12">
          {/* Header Section */}
          <div
            onMouseEnter={() => setIsHoveringHeader(true)}
            onMouseLeave={() => setIsHoveringHeader(false)}
          >
            {/* Breadcrumb */}
            {parentNote && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <button 
                  className="hover:bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                  onClick={() => setCurrentNote(parentNote)}
                >
                  <span>{parentNote.icon}</span>
                  <span>{parentNote.title || "Untitled"}</span>
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-700">{note.title || "Untitled"}</span>
              </div>
            )}

            {/* Icon & Actions */}
            <div className="flex items-start gap-4 mb-3">
              {/* Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="text-6xl hover:bg-gray-100 rounded-lg p-1 transition-colors"
                >
                  {note.icon || "📄"}
                </button>

                {/* Icon Picker */}
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-64">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Choose icon
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleIconChange(emoji)}
                          className="text-2xl p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleIconChange("")}
                        className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
                      >
                        Remove icon
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Header Actions */}
              {isHoveringHeader && (
                <div className="flex items-center gap-1 mt-4 text-gray-400">
                  <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 text-sm">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 bg-transparent border-none focus:ring-0 resize-none overflow-hidden p-0"
              rows={1}
            />

            {/* Meta info */}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              {note.updatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="mt-6">
            <NotionEditor
              content={content}
              onChange={setContent}
              noteTitle={title}
            />
          </div>

          {/* Child Pages Section */}
          {childPages.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Pages inside
              </h3>
              <div className="space-y-1">
                {childPages.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      addToBreadcrumbs({ id: note.id, title: note.title || "Untitled", icon: note.icon || "📄" });
                      setCurrentNote(child);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-left transition-colors group"
                  >
                    <span className="text-xl">{child.icon || "📄"}</span>
                    <span className="flex-1 text-gray-700 group-hover:text-gray-900">
                      {child.title || "Untitled"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this note</DialogTitle>
            <DialogDescription>
              Share via social media or copy the link
            </DialogDescription>
          </DialogHeader>
          
          {/* Social Share Buttons */}
          <div className="flex justify-center gap-3 py-4">
            <WhatsappShareButton url={shareLink} title={note.title || "Check out this note"}>
              <WhatsappIcon size={48} round />
            </WhatsappShareButton>
            <FacebookShareButton url={shareLink} hashtag="#notes">
              <FacebookIcon size={48} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareLink} title={note.title || "Check out this note"}>
              <TwitterIcon size={48} round />
            </TwitterShareButton>
            <LinkedinShareButton url={shareLink} title={note.title || "Check out this note"}>
              <LinkedinIcon size={48} round />
            </LinkedinShareButton>
            <TelegramShareButton url={shareLink} title={note.title || "Check out this note"}>
              <TelegramIcon size={48} round />
            </TelegramShareButton>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-medium">Or copy link</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="link"
                value={shareLink} 
                readOnly 
                className="flex-1"
              />
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete note?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete &quot;{note.title || "Untitled"}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
