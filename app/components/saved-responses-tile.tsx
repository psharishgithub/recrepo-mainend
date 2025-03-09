import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Response {
    id: string;
    content: string;
    createdAt: string;
}

export default function SavedResponsesTile({ responses, onDelete }: { 
    responses: Response[];
    onDelete: (id: string) => void;
}) {
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this response?')) return;

        try {
            const res = await fetch(`/api/responses/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete response');
            
            onDelete(id);
            toast.success('Response deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete response');
        }
    };

    return (
        <div className="mt-12 px-6">
            <h2 className="text-xl font-semibold text-white mb-4">Saved Responses</h2>
            {responses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {responses.map((response) => (
                        <Card 
                            key={response.id} 
                            className="bg-stone-900 border-stone-800 cursor-pointer hover:bg-stone-800 transition-colors relative"
                            onClick={() => router.push(`/response/${response.id}`)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm text-stone-400">
                                        {new Date(response.createdAt).toLocaleDateString()}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-red-900/50"
                                        onClick={(e) => handleDelete(e, response.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                                <ReactMarkdown
                                    className="text-white text-sm prose prose-invert prose-sm max-w-none line-clamp-3"
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {response.content}
                                </ReactMarkdown>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="bg-stone-900 border-stone-800">
                    <CardContent className="p-6">
                        <p className="text-white text-center">No saved responses yet</p>
                        <p className="text-stone-400 text-sm text-center mt-2">
                            Your saved chat responses will appear here
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
