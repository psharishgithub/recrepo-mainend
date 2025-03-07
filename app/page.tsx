'use client'
import { Krona_One } from 'next/font/google'
import SignInButton from './components/signinbutton';
import LoadingSpinner from './components/loadingspinner';
import { useSession } from "next-auth/react"
import { redirect } from 'next/navigation';

// Login/Primary Landing page
const kronaOne = Krona_One({
    weight: '400',
    subsets: ['latin'],
})

export default  function LoginPage() {
    const {data: session, status} =  useSession()
    

    if (status === "loading") {
        return <LoadingSpinner />
    }

    if (session) {
        redirect('/dashboard')
    }
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent flex-col px-4">
                <h1 className={`text-white text-4xl sm:text-6xl md:text-7xl lg:text-[100px] text-center mb-8 ${kronaOne.className}`}>
                    Rec Repo
                </h1>
                <SignInButton />
            </div>
        )
    }