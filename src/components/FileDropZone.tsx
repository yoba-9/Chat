import { useRef, useState } from "react";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

const FileDropZone = ({ onFilesSelected }: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          onFilesSelected(files);
        }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      
      <div>
        <p className="text-gray-600 mb-2">
          Drop files here or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 underline font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Supports images, videos, audio, and documents (max 10MB)
        </p>
      </div>
    </div>
  );
};

export default FileDropZone;