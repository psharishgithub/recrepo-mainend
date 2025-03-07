'use client'

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '@/app/components/loadingspinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function ResponsePage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [response, setResponse] = useState<{ content: string; createdAt: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetch(`/api/responses/${id}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Response not found');
                    }
                    return res.json();
                })
                .then(data => setResponse(data))
                .catch(error => {
                    console.error('Error:', error);
                    setError(error.message);
                });
        }
    }, [id, session?.user]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this response?')) return;
        
        try {
            const res = await fetch(`/api/responses/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete response');
            
            toast.success('Response deleted successfully');
            router.push('/dashboard');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete response');
        }
    };

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-6"
                >
                    Back to Dashboard
                </Button>
                <Card className="bg-stone-900 border-stone-800">
                    <CardContent className="p-6">
                        <div className="text-white text-center">
                            {error}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!response) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Back to Dashboard
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex items-center gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>
            <Card className="bg-stone-900 border-stone-800">
                <CardContent className="p-6">
                    <div className="text-sm text-stone-400 mb-4">
                        {new Date(response.createdAt).toLocaleDateString()}
                    </div>
                    <ReactMarkdown
                        className="text-white prose prose-invert prose-lg max-w-none"
                        remarkPlugins={[remarkGfm]}
                    >
                        {response.content}
                    </ReactMarkdown>
                </CardContent>
            </Card>
        </div>
    );
}
