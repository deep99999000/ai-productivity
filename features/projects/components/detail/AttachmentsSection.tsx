"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, Eye, Download, RefreshCw, Loader2, User, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadButton } from "@/features/auth/uploadthing";
import { createAttachment, getProjectAttachments } from "@/features/attachment/attachmentAction";
import { useAttachmentStore } from "@/features/attachment/attachmentStore";
import { generateUniqueId } from "@/lib/generateUniqueId";
import { downloadfile } from "@/lib/Download";
import AttachmentDetailDialog from "./AttachmentDetailDialog";

interface AttachmentsSectionProps {
  projectId: number;
  userId: string;
}

export default function AttachmentsSection({ projectId, userId }: AttachmentsSectionProps) {
  const { attachments, addAttachment, setAttachments } = useAttachmentStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  const loadAttachments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const attach = await getProjectAttachments(projectId, userId);
      setAttachments(attach);
    } catch (error) {
      console.error("Error loading attachments:", error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
            <Loader2 className="w-7 h-7 text-zinc-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Loading Attachments
          </h3>
          <p className="text-sm text-zinc-500">
            Please wait while we fetch your files...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200/80">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center mr-3">
              <Paperclip className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Attachments
              </h2>
              <span className="text-xs text-zinc-500">
                {attachments?.length || 0} {(attachments?.length || 0) === 1 ? 'file' : 'files'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => loadAttachments(true)}
            disabled={refreshing}
            className="hover:bg-zinc-100 transition-colors rounded-lg"
            title="Refresh attachments"
          >
            <RefreshCw className={`w-4 h-4 text-zinc-600 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <UploadButton
          endpoint="imageUploader"
          className="ut-button:bg-zinc-900 ut-button:hover:bg-zinc-800 ut-button:text-white ut-button:font-medium ut-button:rounded-xl ut-button:border-0 ut-label:text-white ut-allowed-content:hidden ut-button:px-4 ut-button:py-2.5 ut-button:transition-all ut-button:shadow-sm"
          content={{
            button: (
              <div className="flex items-center text-sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </div>
            ),
          }}
          onClientUploadComplete={async (res) => {
            console.log("Files: ", res);
            const newAttachment = {
              id: generateUniqueId(),
              name: res[0].name,
              description: "",
              project_id: projectId,
              goal_id: null,
              user_id: res[0].serverData.uploadedBy,
              url: res[0].url,
            };
            
            addAttachment(newAttachment);

            // Add to database
            await createAttachment(newAttachment);
          }}
        />
      </div>

      <div className="space-y-3">
        {(!attachments || attachments.length === 0) ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              No attachments yet
            </h3>
            <p className="text-zinc-500 mb-4 max-w-md mx-auto text-sm">
              Upload documents, images, or other files to support your project.
            </p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-white border border-zinc-200/80 p-4 rounded-xl hover:border-zinc-300 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedAttachment(attachment)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="text-zinc-600 w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate text-sm mb-1">
                      {attachment.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={(attachment as any).uploaded_by_image || ""} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-zinc-500">
                        {(attachment as any).uploaded_by_name || "Unknown User"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(attachment.url, "_blank");
                    }}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all"
                    title="View file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadfile(attachment.url, attachment.name);
                    }}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-all"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attachment Detail Dialog */}
      {selectedAttachment && (
        <AttachmentDetailDialog
          attachment={selectedAttachment}
          open={!!selectedAttachment}
          onOpenChange={(open) => !open && setSelectedAttachment(null)}
        />
      )}
    </div>
  );
}
