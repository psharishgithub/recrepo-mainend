import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileImage, FaTrashAlt } from 'react-icons/fa';
import Image from 'next/image';

export default function FileUploadButton({ onFilesChange, onClearFiles }: {
  onFilesChange: (files: File[]) => void;
  onClearFiles: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const validFiles = selectedFiles.filter(file => allowedMimeTypes.includes(file.type));
      const invalidFiles = selectedFiles.filter(file => !allowedMimeTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        setError("Some files are not in an allowed format and will not be uploaded.");
      } else {
        setError(null);
      }

      setFiles(prevFiles => {
        const newFiles = [...prevFiles, ...validFiles];
        onFilesChange(newFiles);
        return newFiles;
      });
    }
  };

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      onFilesChange(updatedFiles);
      if (updatedFiles.length === 0) {
        onClearFiles();
      }
      return updatedFiles;
    });
  }, [onFilesChange, onClearFiles]);

  const handleClearFiles = useCallback(() => {
    setFiles([]);
    onClearFiles();
  }, [onClearFiles]);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) return <FaFileImage color="white" size="50px" />;
    if (fileType.includes("pdf")) return <FaFilePdf color="white" size="50px" />;
    if (fileType.includes("word")) return <FaFileWord color="white" size="50px" />;
    if (fileType.includes("powerpoint")) return <FaFilePowerpoint color="white" size="50px" />;
    return <FaFilePdf color="white" size="50px" />;
  };

  useEffect(() => {
    // Clean up object URLs when files change
    return () => {
      files.forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [files]);

  return (
    <div className="flex flex-col items-start">
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="bg-stone-900 p-16 rounded-3xl mb-4 mr-4 flex items-center justify-center">
          <FaPlus color="white" className="opacity-30" size="50px" />
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="flex flex-wrap">
        {files.length > 0 && (
          files.map((file, index) => (
            <div key={index} className="relative bg-stone-900 p-4 rounded-3xl mb-4 mr-4 w-[176px] h-[176px] flex flex-col items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                {file.type.includes("image") ? (

                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`preview ${index}`}
                    className="object-cover rounded-3xl"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              <span className="text-white text-sm mt-2 overflow-hidden text-ellipsis whitespace-nowrap w-full text-center">
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white hover:bg-red-700"
                aria-label="Remove file"
              >
                <FaTrashAlt size="20px" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
