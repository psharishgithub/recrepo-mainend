'use client'

import { SessionProvider } from "next-auth/react"
// Session Provider for all routes
export function Providers({children}: {children: React.ReactNode}){
    return <SessionProvider>{children}</SessionProvider>
}