"use client";
import React, { useState } from "react";
import Input from "../input/FileInput";

export default function FileInputExample() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  return (
    <div className="space-y-4">
      <Input
        onChange={handleFileChange}
        className="custom-class"
      />
      {file && (
        <p className="text-sm text-gray-600">
          Selected file: {file.name}
        </p>
      )}
    </div>
  );
}
