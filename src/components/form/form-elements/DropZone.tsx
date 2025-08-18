"use client";
import React from "react";
import { useDropzone } from "react-dropzone";

export default function DropZone() {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone();

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          Drag & drop files here, or click to select files
        </p>
        {acceptedFiles.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {acceptedFiles.length} file(s) selected
          </p>
        )}
      </div>
    </div>
  );
}
