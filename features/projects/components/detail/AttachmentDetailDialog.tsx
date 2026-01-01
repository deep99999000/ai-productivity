"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, ExternalLink, User, Send, X } from "lucide-react";
import { COLORS } from "@/features/projects/constants";
import { downloadfile } from "@/lib/Download";

interface AttachmentDetailDialogProps {
  attachment: {
    id: number;
    name: string;
    description: string | null;
    url: string;
    user_id: string;
    uploaded_by_name: string | null;
    uploaded_by_image: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AttachmentDetailDialog({
  attachment,
  open,
  onOpenChange,
}: AttachmentDetailDialogProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Array<{
    id: number;
    text: string;
    user: string;
    avatar: string | null;
    timestamp: string;
  }>>([]);

  const handleAddComment = () => {
    if (!comment.trim()) return;

    setComments([
      ...comments,
      {
        id: Date.now(),
        text: comment,
        user: "You",
        avatar: null,
        timestamp: new Date().toLocaleString(),
      },
    ]);
    setComment("");
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return "🖼️";
    } else if (["pdf"].includes(ext || "")) {
      return "📄";
    } else if (["doc", "docx"].includes(ext || "")) {
      return "📝";
    } else if (["xls", "xlsx"].includes(ext || "")) {
      return "📊";
    } else if (["zip", "rar"].includes(ext || "")) {
      return "🗜️";
    }
    return "📎";
  };

  const isImage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon(attachment.name)}</span>
            <span className={`${COLORS.text.primary} truncate`}>{attachment.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Uploader Info */}
          <div className={`${COLORS.surface.slate} p-4 rounded-xl border ${COLORS.border.default}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={attachment.uploaded_by_image || ""} />
                <AvatarFallback className={`${COLORS.primary.gradient} text-white`}>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className={`font-medium ${COLORS.text.primary}`}>
                  Uploaded by {attachment.uploaded_by_name || "Unknown User"}
                </p>
                <p className={`text-sm ${COLORS.text.secondary}`}>Project Member</p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {isImage(attachment.name) ? (
            <div className="border rounded-xl overflow-hidden">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full max-h-96 object-contain bg-slate-50"
              />
            </div>
          ) : (
            <div className={`${COLORS.surface.slate} p-8 rounded-xl border-2 border-dashed ${COLORS.border.default} text-center`}>
              <div className={`w-20 h-20 rounded-full ${COLORS.primary.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <FileText className="w-10 h-10 text-white" />
              </div>
              <p className={`font-medium ${COLORS.text.primary} mb-2`}>
                Preview not available for this file type
              </p>
              <p className={`text-sm ${COLORS.text.secondary}`}>
                Download the file to view its contents
              </p>
            </div>
          )}

          {/* Description */}
          {attachment.description && (
            <div>
              <h3 className={`font-semibold ${COLORS.text.primary} mb-2`}>Description</h3>
              <p className={`${COLORS.text.secondary}`}>{attachment.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => window.open(attachment.url, "_blank")}
              className={`flex-1 ${COLORS.primary.gradient} hover:opacity-90 text-white shadow-lg`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              onClick={() => downloadfile(attachment.url, attachment.name)}
              variant="outline"
              className={`flex-1 ${COLORS.border.default} hover:${COLORS.surface.blue}`}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Comments Section */}
          <div className={`border-t ${COLORS.border.default} pt-6`}>
            <h3 className={`font-semibold ${COLORS.text.primary} mb-4 flex items-center gap-2`}>
              💬 Comments
              <span className={`text-sm ${COLORS.text.secondary} font-normal`}>
                ({comments.length})
              </span>
            </h3>

            {/* Comment List */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className={`text-center ${COLORS.text.secondary} py-8`}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    className={`${COLORS.surface.slate} p-3 rounded-lg border ${COLORS.border.default}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={cmt.avatar || ""} />
                        <AvatarFallback className={`${COLORS.primary.gradient} text-white text-xs`}>
                          {cmt.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${COLORS.text.primary}`}>
                            {cmt.user}
                          </span>
                          <span className={`text-xs ${COLORS.text.secondary}`}>
                            {cmt.timestamp}
                          </span>
                        </div>
                        <p className={`text-sm ${COLORS.text.secondary}`}>{cmt.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className={`${COLORS.primary.gradient} text-white shadow-lg`}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
