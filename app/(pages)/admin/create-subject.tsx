'use client'

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingSpinner from "@/app/components/loadingspinner";
import { Upload, FileText } from "lucide-react";

export default function CreateSubject() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    regulation: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          regulation: parseInt(formData.regulation)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess('Subject created successfully');
      setFormData({ code: '', name: '', department: '', regulation: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension instead of MIME type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Please upload a CSV file');
      return;
    }

    setFileLoading(true);
    setFileError(null);
    setFileSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/subjects/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setFileSuccess('Subjects uploaded successfully');
      e.target.value = ''; // Reset file input
    } catch (err: any) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      handleFileUpload({ target: { files: [file] } } as any);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Create Single Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  placeholder="Subject Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="bg-stone-800 border-stone-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  placeholder="Subject Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-stone-800 border-stone-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="bg-stone-800 border-stone-700 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  type="number"
                  placeholder="Regulation"
                  value={formData.regulation}
                  onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                  required
                  className="bg-stone-800 border-stone-700 text-white"
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription className="text-green-500">{success}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-800 hover:bg-stone-700 text-white h-10 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner className="h-5 w-5" />
                </div>
              ) : (
                'Create Subject'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-stone-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-stone-950 px-2 text-stone-400">OR</span>
        </div>
      </div>

      <Card className="bg-stone-900 border-stone-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Bulk Upload Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed transition-colors duration-150 ease-in-out cursor-pointer
                ${dragActive 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-stone-700 hover:border-stone-600 bg-stone-800/50"}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    handleFileUpload(e);
                  }
                }}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-4">
                {fileName ? (
                  <>
                    <FileText className="h-10 w-10 text-blue-500" />
                    <p className="text-sm text-stone-400">{fileName}</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-stone-400" />
                    <div className="text-center">
                      <p className="text-stone-400">Drag and drop your CSV file here or</p>
                      <p className="text-blue-500 hover:text-blue-400">Browse files</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-sm text-stone-400 bg-stone-800/50 p-4 rounded-lg">
              <p className="font-medium mb-2">CSV File Format:</p>
              <p>Headers required: code, name, department, regulation</p>
              <p>Example: CS3001,Programming,CSE,2021</p>
            </div>

            {fileError && (
              <Alert variant="destructive">
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
            {fileSuccess && (
              <Alert>
                <AlertDescription className="text-green-500">{fileSuccess}</AlertDescription>
              </Alert>
            )}
            {fileLoading && (
              <div className="flex justify-center p-4">
                <LoadingSpinner className="h-6 w-6" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
