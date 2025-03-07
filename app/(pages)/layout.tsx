'use client'
import { useState } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { Sidenav } from './components/sidenav';

export default function LandingPageLayout({ children }: { children: React.ReactNode }) {
    const [openSideNav, setOpenSideNav] = useState(false);

    return (
        <div className="flex h-full min-h-screen bg-stone-950">
            <div className="fixed top-0 left-0 z-50 lg:hidden">
                <button
                    onClick={() => setOpenSideNav(true)}
                    className="p-4 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20"
                    aria-label="Open menu"
                >
                    <GiHamburgerMenu className="h-6 w-6 text-white" />
                </button>
            </div>
            <Sidenav openSideNav={openSideNav} setOpenSideNav={setOpenSideNav} />
            <main className="flex-1 relative min-h-screen overflow-y-auto lg:pl-64">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 mt-14 lg:mt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
