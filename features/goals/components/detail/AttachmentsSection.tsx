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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FileText className="text-indigo-500 mr-3 w-6 h-6" />
          <h2 className="text-xl font-bold text-gray-900">
            Attachments & Resources
          </h2>
        </div>
        <UploadButton
          endpoint="imageUploader"
          className="ut-button:text-gray-700 ut-button:bg-white ut-button:border ut-button:border-border-gray-300  ut-label:text-black ut-allowed-content:hidden"
      content={{
    button: <div className="text-sm font-medium flex items-center"><Upload className="w-4 h-4 mr-2" /> Upload</div>, // <- Your custom text here
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
      <div className="space-y-3 ">
        <div className="flex items-center flex-col gap-7 justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200/80">
          {attachments &&
            attachments.map((a) => (
              <div className="flex items-center justify-between w-full" key={a.id}>
                <div className="flex items-center">
                  <FileText className="text-blue-500 mr-3 w-5 h-5" />
                  <p className="font-medium text-gray-800">{a.name}</p>
                  <p className="text-sm text-gray-500">{a.description || ""}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Eye
                    className="w-5 h-5 hover:text-indigo-600 cursor-pointer"
                    onClick={() => window.open(a.url, "_blank")}
                  />
                  <Download onClick={() => {downloadfile(a.url,a.name)
                    
                  }}className="w-5 h-5 hover:text-indigo-600 cursor-pointer" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AttachmentsSection;
