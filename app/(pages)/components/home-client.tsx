'use client'

import { Krona_One } from 'next/font/google'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { BookOpen, Upload, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const kronaOne = Krona_One({
  weight: '400',
  subsets: ['latin'],
})

export default function HomeClient() {
  const { data: session } = useSession()
  const isTeacherOrAdmin = session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN'

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-white font-bold text-[40px] pt-5 mb-5'>Dashboard</h1>
        <div className='text-stone-400'>
          Welcome back, {session?.user?.name}!
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
        <Card className='p-6 bg-stone-900 border-stone-800 hover:border-stone-700 transition-colors'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-blue-500/10 rounded-lg'>
              <BookOpen className='h-6 w-6 text-blue-500' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-white'>Library</h3>
              <p className='text-sm text-stone-400'>Access study materials</p>
            </div>
          </div>
          <Link 
            href="/landing/library"
            className='mt-4 text-blue-500 text-sm hover:underline block'
          >
            Browse Library →
          </Link>
        </Card>

        {isTeacherOrAdmin && (
          <Card className='p-6 bg-stone-900 border-stone-800 hover:border-stone-700 transition-colors'>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-green-500/10 rounded-lg'>
                <Upload className='h-6 w-6 text-green-500' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-white'>Upload</h3>
                <p className='text-sm text-stone-400'>Share new materials</p>
              </div>
            </div>
            <Link 
              href="/landing/upload"
              className='mt-4 text-green-500 text-sm hover:underline block'
            >
              Upload Content →
            </Link>
          </Card>
        )}

        <Card className='p-6 bg-stone-900 border-stone-800 hover:border-stone-700 transition-colors'>
          <div className='flex items-center space-x-4'>
            <div className='p-3 bg-purple-500/10 rounded-lg'>
              <MessageSquare className='h-6 w-6 text-purple-500' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-white'>Recent Chats</h3>
              <p className='text-sm text-stone-400'>View your conversations</p>
            </div>
          </div>
          <Link 
            href="/landing/chat"
            className='mt-4 text-purple-500 text-sm hover:underline block'
          >
            View Chats →
          </Link>
        </Card>
      </div>

      <div className='mt-12'>
        <h2 className='text-xl font-semibold text-white mb-4'>Quick Actions</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='p-4 bg-stone-900 border-stone-800'>
            <h3 className='text-white font-medium'>Recent Materials</h3>
            <p className='text-sm text-stone-400 mt-1'>No materials viewed yet</p>
          </Card>
          <Card className='p-4 bg-stone-900 border-stone-800'>
            <h3 className='text-white font-medium'>Active Discussions</h3>
            <p className='text-sm text-stone-400 mt-1'>No active discussions</p>
          </Card>
        </div>
      </div>
    </div>
  )
}