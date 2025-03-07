'use client'

import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileImage, FaFile, FaDownload, FaComments } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/loadingspinner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

interface File {
    id: number;
    filePath: string;
    subjectId: string;
    uploaderId: string;
    uploadedAt: string;
    embeddings: string;
}

interface Subject {
    id: string;
    code: string;
    name: string;
    department: string;
    regulation: number;
    files: File[];
}

const getFileName = (filePath: string) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const separator = isDevelopment ? '\\' : '/';
    return filePath.split(separator).pop();
};

export default function SubjectPage({ params }: { params: any }) {
    const [hoveredFile, setHoveredFile] = useState<number | null>(null);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchSubject() {
            try {
                const response = await fetch(`/api/subjects/${params.code}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch subject');
                }
                const data = await response.json();
                setSubject(data);
                console.log(data.files);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubject();
    }, [params.code]);

    const getIcon = (file: string) => {
        if (file.endsWith('.pdf')) {
            return <FaFilePdf color='white' className='m-3 sm:m-4 md:m-5' size="20px" />;
        }
        if (file.endsWith('.docx') || file.endsWith('.doc')) {
            return <FaFileWord color='white' className='m-3 sm:m-4 md:m-5' size="20px" />;
        }
        if (file.endsWith('.jpg') || file.endsWith('.png')) {
            return <FaFileImage color='white' className='m-3 sm:m-4 md:m-5' size="20px" />;
        }
        if (file.endsWith('.ppt') || file.endsWith('.pptx')) {
            return <FaFilePowerpoint color='white' className='m-3 sm:m-4 md:m-5' size="20px" />;
        }
        return <FaFile color='white' className='m-3 sm:m-4 md:m-5' size="20px" />;
    };

    const handleChatClick = () => {
        if (subject) {
            const subjectId = subject.id;
            router.push(`/chat/${subjectId}`);
        }
    };

    const handleDownload = async (filePath: string) => {
        try {
            const response = await fetch(`/api/download?filePath=${encodeURIComponent(filePath)}`);
            if (!response.ok) {
                throw new Error('Download failed');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = getFileName(filePath) || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertDescription>Subject not found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            <div className="mb-8">
                <motion.h1 
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-white font-bold text-4xl mb-4"
                >
                    {subject.name}
                </motion.h1>
                <div className="flex flex-wrap gap-4 text-stone-400">
                    <span className="font-bold text-xl">{subject.code}</span>
                    <span className="font-bold text-xl">{subject.regulation} Regulation</span>
                    <span className="font-bold text-xl">{subject.department}</span>
                </div>
            </div>

            <h2 className="text-white text-2xl mb-6 font-bold">Course Materials</h2>
            
            <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                <motion.div 
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    initial="hidden"
                    animate="show"
                >
                    {subject?.files.map((file, index) => {
                        const fileName = getFileName(file.filePath);
                        return (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Card 
                                                className="bg-stone-800 border-none hover:bg-stone-700 transition-all duration-300 cursor-pointer"
                                                onClick={() => handleDownload(file.filePath)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-stone-700 rounded-lg p-2">
                                                            {getIcon(file.filePath)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium text-sm truncate">
                                                                {fileName}
                                                            </p>
                                                            <p className="text-stone-400 text-xs mt-1">
                                                                {new Date(file.uploadedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            className="h-8 w-8 p-0 hover:bg-stone-600 flex-shrink-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload(file.filePath);
                                                            }}
                                                        >
                                                            <FaDownload className="text-white" size="14px" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{fileName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </ScrollArea>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Button
                    variant="default"
                    className="fixed bottom-8 right-8 bg-stone-700 hover:bg-stone-600 rounded-full px-8 py-6 shadow-lg transition-all duration-300 hover:scale-105 z-10 flex items-center gap-2"
                    onClick={handleChatClick}
                >
                    <FaComments size="20px" />
                    <span className="font-semibold text-lg">Start Chat</span>
                </Button>
            </motion.div>
        </motion.div>
    );
}
