'use client'

import { useSession } from "next-auth/react";
import HomeClient from "../components/home-client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/app/components/loadingspinner";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SavedResponsesTile from '@/app/components/saved-responses-tile';

export default function LandingPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    interface Response {
        id: string;
        content: string;
        createdAt: string;
    }

    const [savedResponses, setSavedResponses] = useState<Response[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user && typeof window !== 'undefined') {
            fetch("/api", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: session.user.name,
                    email: session.user.email,
                    avatar: session.user.image,
                })
            })
            .then(response => response.json())
            .catch(error => console.error('Error:', error))
        }
    }, [session?.user])

    useEffect(() => {
        if (session?.user) {
            // Fetch saved responses
            fetch(`/api/responses?userId=${session.user.id}`)
                .then(res => res.json())
                .then(data => setSavedResponses(data))
                .catch(error => console.error('Error fetching saved responses:', error));
        }
    }, [session?.user]);

    const handleDelete = (id: string) => {
        setSavedResponses(prev => prev.filter(response => response.id !== id));
    };

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (status === "authenticated") {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <HomeClient />
                {savedResponses.length > 0 && (
                    <SavedResponsesTile 
                        responses={savedResponses} 
                        onDelete={handleDelete}
                    />
                )}
            </motion.div>
        )
    }

    return null
}