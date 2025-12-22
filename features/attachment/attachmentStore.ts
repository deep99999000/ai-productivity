import { create } from "zustand";
import type { Attachment } from "./attachmentSchema";
import { persist } from "zustand/middleware";

// 📦 Attachment store state interface
interface AttachmentState {
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: number) => void;
}


// 🗂 Global attachment store with persistence
export const useAttachmentStore = create<AttachmentState>()(
  persist(
    (set) => ({
      // 📊 Initial state
      attachments: [],
      
      // 📝 Set all attachments
      setAttachments: (attachments) => set({ attachments }),
      
      // ➕ Add single attachment
      addAttachment: (attachment) =>
        set((state) => ({ attachments: [attachment, ...state.attachments] })),
        
      // 🗑️ Remove attachment by ID
      removeAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== id),
        })),
    }),
    {
      // 💾 Persistence config
      name: 'attachment-storage', 
      
      partialize: (state) => ({ 
        attachments: state.attachments,
      }),
      
    }
  )
);
