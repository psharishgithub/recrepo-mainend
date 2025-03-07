'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import LoadingSpinner from "@/app/components/loadingspinner"
import UploadFilesToSubject from "./components/uploadtosubject"
import SubjectFiles from "./components/subjectfiles"

export default function TeacherPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated' && 
              session?.user?.role !== 'TEACHER' && 
              session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-white mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 gap-6">
        <UploadFilesToSubject />
        <SubjectFiles />
      </div>
    </motion.div>
  )
}
