"use client";
import { FileText, Upload, Eye, Download } from "lucide-react";

const AttachmentsSection = () => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/80">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <FileText className="text-indigo-500 mr-3 w-6 h-6" />
        <h2 className="text-xl font-bold text-gray-900">Attachments & Resources</h2>
      </div>
      <button className="flex items-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"><Upload className="w-4 h-4 mr-2" /> Upload</button>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-200/80">
        <div className="flex items-center">
          <FileText className="text-blue-500 mr-3 w-5 h-5" />
          <div>
            <p className="font-medium text-gray-800">Goal Brief.docx</p>
            <p className="text-sm text-gray-500">Placeholder</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Eye className="w-5 h-5 hover:text-indigo-600 cursor-pointer" />
          <Download className="w-5 h-5 hover:text-indigo-600 cursor-pointer" />
        </div>
      </div>
    </div>
  </div>
);

export default AttachmentsSection;
