
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { AudioFileIcon } from './icons/AudioFileIcon';
import type { AudioUploaderProps } from '../types';

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileUpload, file }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type.startsWith('audio/')) {
        onFileUpload(droppedFile);
      } else {
        alert("Please drop an audio file.");
      }
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
       if (selectedFile.type.startsWith('audio/')) {
        onFileUpload(selectedFile);
      } else {
        alert("Please select an audio file.");
      }
    }
  };
  
  const handleRemoveFile = () => {
    onFileUpload(null);
  };

  const uploaderClass = `flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg transition-colors duration-200 ease-in-out ${
    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;

  return (
    <div 
      className={uploaderClass}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center">
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <AudioFileIcon />
            <p className="font-semibold text-gray-700">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            <button 
              onClick={handleRemoveFile} 
              className="mt-2 text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <UploadIcon />
            <p className="mt-2 text-sm text-gray-600">
              <label htmlFor="file-upload" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                Click to upload
              </label>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500">Any audio format (e.g., MP3, WAV, M4A)</p>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="audio/*" onChange={handleFileChange} />
          </>
        )}
      </div>
    </div>
  );
};
