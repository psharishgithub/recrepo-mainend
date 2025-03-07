'use client'

import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import debounce from 'lodash/debounce'
import LoadingSpinner from "@/app/components/loadingspinner"

interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  regulation: number;
}

export default function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchSubjects = useCallback(async (pageNum: number, search: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/subjects?page=${pageNum}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`
      );
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      
      setSubjects(data.subjects);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      setError('Error loading subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setPage(1);
      fetchSubjects(1, search);
    }, 300),
    [fetchSubjects]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchSubjects(newPage, searchQuery);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated files and data.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subjects/${code}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete subject');
      }

      // Remove the deleted subject from state
      setSubjects(subjects.filter(subject => subject.code !== code));
      setError(null); // Clear any existing errors
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject');
      console.error(err);
    }
  };

  if (loading && page === 1) return <LoadingSpinner />;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">Existing Subjects</h2>
        <Input
          type="search"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={handleSearch}
          className="bg-stone-800 border-stone-700 text-white"
        />
      </div>
      
      <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="popLayout">
          <motion.div className="grid gap-4 p-2">
            {subjects.map((subject) => (
              <motion.div
                key={subject.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-stone-800 border-stone-700">
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <h3 className="font-semibold text-white">{subject.name}</h3>
                      <p className="text-sm text-stone-400">
                        {subject.code} | {subject.regulation} Regulation | {subject.department}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subject.code)}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {subjects.length === 0 && !loading && (
          <div className="text-center text-stone-400 py-8">
            No subjects found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4 border-t border-stone-800">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="bg-stone-800 text-white hover:bg-stone-700"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-white">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="bg-stone-800 text-white hover:bg-stone-700"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
