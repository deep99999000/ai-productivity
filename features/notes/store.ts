import { create } from "zustand";
import { Note } from "@/db/schema/notes";
import axios from "axios";

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  breadcrumbs: { id: number; title: string; icon: string }[];
  
  // Actions
  fetchNotes: (userId: string, parentId?: number | null) => Promise<void>;
  fetchAllNotes: (userId: string) => Promise<void>;
  createNote: (userId: string, parentId?: number | null) => Promise<Note | null>;
  updateNote: (id: number, userId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: number, userId: string, permanent?: boolean) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
  addToBreadcrumbs: (note: { id: number; title: string; icon: string }) => void;
  navigateToBreadcrumb: (index: number) => void;
  resetBreadcrumbs: () => void;
  getChildNotes: (parentId: number) => Note[];
}

export const useNotes = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  breadcrumbs: [],

  fetchNotes: async (userId: string, parentId?: number | null) => {
    set({ isLoading: true });
    try {
      // Fetch all notes (not just root level) to support nested navigation
      const response = await axios.get(`/api/notes?userId=${userId}&all=true`);
      set({ notes: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      set({ isLoading: false });
    }
  },

  fetchAllNotes: async (userId: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/notes?userId=${userId}`);
      set({ notes: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      set({ isLoading: false });
    }
  },

  createNote: async (userId: string, parentId?: number | null) => {
    try {
      const response = await axios.post("/api/notes", {
        userId,
        parentId,
        title: "Untitled",
        content: "",
        icon: "📄",
      });
      
      const newNote = response.data;
      set((state) => ({
        notes: [...state.notes, newNote],
      }));
      
      return newNote;
    } catch (error) {
      console.error("Failed to create note:", error);
      return null;
    }
  },

  updateNote: async (id: number, userId: string, updates: Partial<Note>) => {
    try {
      const response = await axios.patch("/api/notes", {
        id,
        userId,
        ...updates,
      });
      
      const updatedNote = response.data;
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
      }));
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  },

  deleteNote: async (id: number, userId: string, permanent = false) => {
    try {
      await axios.delete("/api/notes", {
        data: { id, userId, permanent },
      });
      
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
      }));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },

  addToBreadcrumbs: (note: { id: number; title: string; icon: string }) => {
    set((state) => {
      const existingIndex = state.breadcrumbs.findIndex((b) => b.id === note.id);
      if (existingIndex !== -1) {
        return { breadcrumbs: state.breadcrumbs.slice(0, existingIndex + 1) };
      }
      return { breadcrumbs: [...state.breadcrumbs, note] };
    });
  },

  navigateToBreadcrumb: (index: number) => {
    set((state) => ({
      breadcrumbs: state.breadcrumbs.slice(0, index + 1),
    }));
  },

  resetBreadcrumbs: () => {
    set({ breadcrumbs: [] });
  },

  getChildNotes: (parentId: number) => {
    return get().notes.filter((n) => n.parentId === parentId);
  },
}));
