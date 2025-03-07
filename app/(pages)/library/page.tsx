'use client'
import { useEffect, useState } from 'react';
import SubjectTile from "../_components/subject-tile";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/loadingspinner';
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

type Subject = {
  id: string;
  code: string;
  name: string;
  department: string;
  regulation: number;
};

export default function LibraryPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/subjects', { cache: 'no-cache' });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setSubjects(data);
        } else {
          console.error('Failed to fetch subjects');
          setError('Failed to fetch subjects');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Error fetching subjects');
      } finally {
        setLoading(false);
      }
    }
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
     >
       <h1 className="text-white font-bold text-2xl sm:text-3xl mb-6">Library Resource</h1>
       <Input
         className="w-full bg-stone-900/80 h-10 sm:h-12 rounded-full mb-6 sm:mb-8 px-4 sm:px-6 text-base sm:text-lg placeholder:text-white/30 transition-all duration-200 focus:ring-2 focus:ring-white/20 hover:bg-stone-900"
         placeholder="Search materials..."
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
       />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {filteredSubjects.map(subject => (
          <motion.div
            key={subject.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <SubjectTile
              name={subject.name}
              code={subject.code}
              regulation={subject.regulation}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {filteredSubjects.length === 0 && (
        <div className="text-center text-white/50 mt-8">
          No subjects found matching your search.
        </div>
      )}
    </motion.div>
  );
}
