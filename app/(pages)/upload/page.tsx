'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileUploadButton from './components/fileuploadbutton';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function UploadPage() {
  const [selectedButton, setSelectedButton] = useState<string>('subject');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [userId, setUserId] = useState<string | null>(null); 
  const [regulation, setRegulation] = useState('');
  const [department, setDepartment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      console.error('User not authenticated');
      handleClearFiles();
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId); 
    formData.append('subjectName', subjectName);
    formData.append('subjectCode', subjectCode);
    formData.append('regulation', regulation);
    formData.append('department', department);
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/uploadbysubject', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      // console.log(result.message);

      window.location.reload();
      setSubjectName('');
      setSubjectCode('');
      setRegulation('');
      setDepartment('');
      handleClearFiles();
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  };

  const handleButtonClick = (button: 'subject' | 'toSubject') => {
    setSelectedButton(button);
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  return (
    <div>
      <h1 className='text-white font-bold text-2xl sm:text-3xl mb-6'>Upload Material</h1>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
        <Button
          variant="ghost"
          className={`w-full sm:w-auto bg-stone-900/80 text-base sm:text-lg text-white rounded-full h-10 sm:h-12 px-4 sm:px-6 transition-all duration-200 hover:bg-stone-900
            ${selectedButton === 'subject' ? 'ring-2 ring-white/20' : 'opacity-75 hover:opacity-100'}`}
          onClick={() => handleButtonClick('subject')}
        >
          Upload by Subject
        </Button>
        <Button
          variant="ghost"
          className={`w-full sm:w-auto bg-stone-900/80 text-base sm:text-lg text-white rounded-full h-10 sm:h-12 px-4 sm:px-6 transition-all duration-200 hover:bg-stone-900
            ${selectedButton === 'toSubject' ? 'ring-2 ring-white/20' : 'opacity-75 hover:opacity-100'}`}
          onClick={() => handleButtonClick('toSubject')}
        >
          Upload to Subject
        </Button>
      </div>

      <div className="space-y-4">
        {selectedButton !== 'toSubject' && (
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full bg-stone-900/80 h-10 sm:h-12 rounded-full px-4 sm:px-6 text-base sm:text-lg text-white placeholder:text-white/30 transition-all duration-200 focus:ring-2 focus:ring-white/20 hover:bg-stone-900"
            placeholder="Subject Name"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <Input
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="w-full bg-stone-900/80 h-10 sm:h-12 rounded-full px-4 sm:px-6 text-base sm:text-lg text-white placeholder:text-white/30 transition-all duration-200 focus:ring-2 focus:ring-white/20 hover:bg-stone-900"
            placeholder="Subject Code"
          />
          
          <Select value={regulation} onValueChange={setRegulation}>
            <SelectTrigger className="w-full bg-stone-900/80 rounded-full h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg text-white border-none hover:bg-stone-900 transition-all duration-200">
              <SelectValue placeholder="Select Regulation" className="text-white/50" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 text-base sm:text-lg border-white/20">
              {["2024", "2023", "2022", "2021", "2020", "2019"].map((year) => (
                <SelectItem key={year} value={year} className="focus:bg-stone-900 hover:bg-stone-900">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedButton !== 'toSubject' && (
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full bg-stone-900/80 rounded-full h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg text-white border-none hover:bg-stone-900 transition-all duration-200">
                <SelectValue placeholder="Select Department" className="text-white/30" />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 text-base sm:text-lg border-white/20">
                {["CSE", "IT", "ECE", "EEE", "MECH"].map((dept) => (
                  <SelectItem key={dept} value={dept} className="focus:bg-stone-900 hover:bg-stone-900">
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="pt-4 sm:pt-6">
          <FileUploadButton onFilesChange={handleFilesChange} onClearFiles={handleClearFiles} />
        </div>

        <Button
          onClick={handleSubmit}
          variant="ghost"
          className="w-full bg-stone-900/80 h-10 sm:h-12 rounded-full text-base sm:text-lg text-white hover:bg-stone-900 transition-all duration-200"
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
