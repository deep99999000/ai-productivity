"use client"
import { saveAs } from 'file-saver';
export const downloadfile = async(fileUrl: string,name:string) => {
   try {
        console.log("Starting file download...");
        
        // 1. Fetch the file content
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 2. Get the content as a Blob
        const fileBlob = await response.blob();

        // 3. Use file-saver to trigger the download
        saveAs(fileBlob, name);

        console.log(`File downloaded successfully as ${"name"}`);
        
      } catch (error) {
        console.error("Error during automatic file download:", error);
        // You might want to display a user-facing error here
      }
  };