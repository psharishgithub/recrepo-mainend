'use client'

import { useSession } from "next-auth/react";
import HomeClient from "../components/home-client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/app/components/loadingspinner";
import { motion } from "framer-motion";

export default function LandingPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

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
            </motion.div>
        )
    }

    return null
}