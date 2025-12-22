import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// 📤 Upload button component
export const UploadButton = generateUploadButton<OurFileRouter>();

// 📥 Upload dropzone component
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
