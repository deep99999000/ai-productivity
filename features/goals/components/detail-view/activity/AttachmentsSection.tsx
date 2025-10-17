"use client";
import { createAttachment, getgoalAttachments } from "@/features/attachment/attachmentAction";
import { useAttachmentStore } from "@/features/attachment/attachmentStore";
import { UploadButton } from "@/features/auth/uploadthing";
import { generateUniqueId } from "@/lib/generateUniqueId";
import useUser from "@/store/useUser";
import { FileText, Upload, Eye, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { downloadfile } from "@/lib/Download";
const AttachmentsSection = () => {
  const { attachments, addAttachment, removeAttachment,setAttachments } = useAttachmentStore();
  useEffect(() => {
    checkatt()
  }, [])
  const { user} = useUser();
  
  const checkatt = async() => {
    if (!attachments || attachments.length == 0) {
      const attach = await getgoalAttachments(Number(id),user)
     setAttachments(attach);
    }  
  };

  
  
  const { id } = useParams();

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center">
          <FileText className="text-indigo-500 mr-3 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-900">
            Attachments & Resources
          </h2>
          <span className="ml-2 text-sm text-slate-500">({attachments?.length || 0})</span>
        </div>
        <UploadButton
          endpoint="imageUploader"
          className="ut-button:bg-gradient-to-r ut-button:from-blue-600 ut-button:to-indigo-600 ut-button:hover:from-blue-700 ut-button:hover:to-indigo-700 ut-button:text-white ut-button:font-medium ut-button:rounded-xl ut-button:shadow-lg ut-button:shadow-blue-500/25 ut-button:border-0 ut-label:text-white ut-allowed-content:hidden ut-button:px-4 ut-button:py-2"
          content={{
            button: (
              <div className="flex items-center text-sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </div>
            ),
          }}
          onClientUploadComplete={async(res) => {
            console.log("Files: ", res);
            addAttachment({
              id: generateUniqueId(),
              name: res[0].name,
              description: "",
              goal_id: Number(id),
              user_id: res[0].serverData.uploadedBy,
              url: res[0].ufsUrl,
            });

            //add in db
            console.log(await createAttachment({
               id: generateUniqueId(),
              name: res[0].name,
              description: "",
              goal_id: Number(id),
              user_id: res[0].serverData.uploadedBy,
              url: res[0].ufsUrl,
            }))
          }}
        />
      </div>
      
      <div className="space-y-3">
        {(!attachments || attachments.length === 0) ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No attachments yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Upload documents, images, or other files to support your goal.
            </p>
          </div>
        ) : (
          attachments.map((a) => (
            <div key={a.id} className="bg-gradient-to-r from-white to-slate-50 border border-slate-200/60 p-4 rounded-xl hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-blue-600 w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{a.name}</p>
                    {a.description && (
                      <p className="text-sm text-slate-500 truncate">{a.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(a.url, "_blank")}
                    className="p-2 rounded-lg hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="View file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadfile(a.url, a.name)}
                    className="p-2 rounded-lg hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
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
    </div>
  );
};

export default AttachmentsSection;
