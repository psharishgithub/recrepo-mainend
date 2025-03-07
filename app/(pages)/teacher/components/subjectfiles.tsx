'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import LoadingSpinner from '@/app/components/loadingspinner'

interface File {
  id: string
  filePath: string
  uploadedAt: string
  subject: { name: string, code: string }
}

export default function SubjectFiles() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { data: session } = useSession()
  const ITEMS_PER_PAGE = 5

  const fetchFiles = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/subject/files?page=${pageNum}&limit=${ITEMS_PER_PAGE}`)
      const data = await response.json()
      if (data.success) {
        if (pageNum === 1) {
          setFiles(data.files)
        } else {
          setFiles(prev => [...prev, ...data.files])
        }
        setHasMore(data.files.length === ITEMS_PER_PAGE)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles(1)
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFiles(nextPage)
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/subject/files/${fileId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setFiles(files.filter(file => file.id !== fileId))
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  if (loading && page === 1) return <LoadingSpinner />

  return (
    <div className="bg-stone-800 p-6 rounded-lg shadow-lg border border-stone-700">
      <h2 className="text-2xl font-semibold text-white mb-4">Your Uploaded Files</h2>
      <div className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between bg-stone-700/50 p-4 rounded-md border border-stone-600">
            <div>
              <p className="text-white font-medium">{file.filePath.split('\\').pop()}</p>
              <p className="text-stone-400 text-sm">
                Subject: {file.subject.name} ({file.subject.code})
              </p>
              <p className="text-stone-400 text-sm">
                Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(file.id)}
              className="bg-red-600 hover:bg-red-700 transition-colors text-white px-4 py-2 rounded-md"
            >
              Delete
            </button>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-stone-400 text-center py-4">No files uploaded yet.</p>
        )}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full mt-4 bg-stone-700 hover:bg-stone-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  )
}
