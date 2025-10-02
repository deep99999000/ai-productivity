import { create } from "zustand";
import type { Attachment } from "./attachmentSchema";
import { persist } from "zustand/middleware";

interface AttachmentState {
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: number) => void;
}


export const useAttachmentStore = create<AttachmentState>()(
  persist(
    (set) => ({
      attachments: [],
      
      setAttachments: (attachments) => set({ attachments }),
      
      addAttachment: (attachment) =>
        set((state) => ({ attachments: [attachment, ...state.attachments] })),
        
      removeAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'attachment-storage', 
      
      partialize: (state) => ({ 
        attachments: state.attachments,
      }),
      
    }
  )
);
