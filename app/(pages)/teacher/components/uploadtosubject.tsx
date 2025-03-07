'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from 'next-auth/react';
import { FaSearch } from 'react-icons/fa';
import FileUploadButton from '../../upload/components/fileuploadbutton';
import { toast } from 'sonner';

interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  regulation: number;
}

export default function UploadFilesToSubject() {
  const [subjectCode, setSubjectCode] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const handleSearch = async () => {
    if (!subjectCode.trim()) {
      toast.error('Please enter a subject code');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/subject/search/${subjectCode}`);
      if (!response.ok) {
        throw new Error('Subject not found');
      }
      const data = await response.json();
      setSubject(data);
      toast.success('Subject found successfully');
    } catch (err) {
      setError('Subject not found');
      setSubject(null);
      toast.error('Subject not found. Please check the code and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!userId || !subject || files.length === 0) {
      toast.error('Please select files and ensure subject is selected');
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('subjectCode', subject.code);
    files.forEach(file => formData.append('files', file));

    const toastId = toast.loading('Uploading files...');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/subject/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Upload failed');
      }

      const data = await response.json();

      // Reset states
      setFiles([]);
      setSubject(null);
      setSubjectCode('');
      setError('');
      
      if (data.processed) {
        toast.success('Files uploaded and processed successfully', { id: toastId });
      } else {
        toast.warning('Files uploaded but processing failed. They will be processed later.', { id: toastId });
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-4 bg-stone-800 rounded-lg p-6 border border-stone-700">
      <h2 className="text-xl font-semibold text-white mb-4">Upload Files to Subject</h2>
      
      {/* Search Input */}
      <div className="flex gap-4">
        <Input
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          className="flex-1 bg-stone-900/80 rounded-full px-4 text-white"
          placeholder="Enter Subject Code"
        />
        <Button
          onClick={handleSearch}
          variant="ghost"
          className="bg-stone-900/80 rounded-full px-6 text-white hover:bg-stone-900"
          disabled={isLoading}
        >
          <FaSearch className="mr-2" />
          Search
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}

      {/* Subject Details */}
      {subject && (
        <div className="mt-6 space-y-6">
          <div className="bg-stone-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Subject Details</h3>
            <div className="grid grid-cols-2 gap-4 text-stone-300">
              <p>Name: {subject.name}</p>
              <p>Code: {subject.code}</p>
              <p>Department: {subject.department}</p>
              <p>Regulation: {subject.regulation}</p>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <FileUploadButton 
              onFilesChange={handleFilesChange} 
              onClearFiles={handleClearFiles}
              disabled={isProcessing}
            />
            
            <Button
              onClick={handleUpload}
              variant="ghost"
              className="w-full bg-stone-900/80 rounded-full text-white hover:bg-stone-900 relative"
              disabled={files.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="mr-2">Processing files...</span>
                  <span className="animate-spin">⭮</span>
                </>
              ) : (
                'Upload Files'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
