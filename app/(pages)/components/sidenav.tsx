'use client'

import React from 'react'
import { Krona_One } from 'next/font/google'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  FolderOpen,
  Upload,
  LogOut,
  User,
  Settings,
  PenTool,
  Wrench,
} from "lucide-react"

const kronaOne = Krona_One({
    weight: '400',
    subsets: ['latin'],
})

interface SidenavProps {
    openSideNav: boolean;
    setOpenSideNav: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidenav: React.FC<SidenavProps> = ({ openSideNav, setOpenSideNav }) => {
    const router = useRouter()
    const pathname = usePathname()
    const { data: session } = useSession()

    const handleSignOut = async () => {
        await signOut()
        setOpenSideNav(false)
    }

    const handleNavigation = (path: string) => {
        router.push(path)
        setOpenSideNav(false)
    }

    const isAdmin = session?.user?.role === 'ADMIN'
    const isTeacher = session?.user?.role === 'TEACHER'
    const isTeacherOrAdmin = session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN'

    const navItems = [
        {
            title: "Dashboard",
            icon: <FolderOpen className="h-4 w-4" />,
            path: "/dashboard",
            show: true
        },
        {
            title: "Library",
            icon: <BookOpen className="h-4 w-4" />,
            path: "/library",
            show: true
        },
        {
            title: "Upload",
            icon: <Upload className="h-4 w-4" />,
            path: "/upload",
            show: isTeacherOrAdmin
        },
        {
            section: "Admin Tools",
            show: isAdmin,
            items: [
                
                {
                    title: "Admin Utility",
                    icon: <PenTool className="h-4 w-4" />,
                    path: "/admin",
                    show: true
                }
            ]
        },
        {
            section: "Teacher Tools",
            show: isTeacher || isAdmin,
            items: [
                {
                    title: "Teacher Utility",
                    icon: <Wrench className="h-4 w-4" />,
                    path: "/teacher",
                    show: true
                }
            ]
        }
    ]

    const renderNavItems = (items: any[]) => {
        return items.map((item, index) => {
            if (item.section) {
                return item.show && (
                    <div key={index} className="mt-6 first:mt-0">
                        <div className="flex items-center px-2 mb-2">
                            <div className="h-[1px] flex-1 bg-stone-800"></div>
                            <h3 className="px-3 text-xs font-bold text-stone-500 uppercase tracking-wider">
                                {item.section}
                            </h3>
                            <div className="h-[1px] flex-1 bg-stone-800"></div>
                        </div>
                        <div className="mt-1 space-y-1">
                            {item.items.map((subItem: any, subIndex: number) => (
                                subItem.show && (
                                    <Button
                                        key={subIndex}
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800",
                                            (pathname === subItem.path || pathname.startsWith(subItem.path + '/')) && "bg-stone-800 text-white"
                                        )}
                                        onClick={() => handleNavigation(subItem.path)}
                                    >
                                        {subItem.icon}
                                        <span className="ml-3">{subItem.title}</span>
                                    </Button>
                                )
                            ))}
                        </div>
                    </div>
                )
            }
            return item.show && (
                <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                        "w-full justify-start text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800",
                        (pathname === item.path || pathname.startsWith(item.path + '/')) && "bg-stone-800 text-white"
                    )}
                    onClick={() => handleNavigation(item.path)}
                >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                </Button>
            )
        })
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0 left-0 bg-stone-900 border-r border-stone-800 z-40">
                <div className="p-6">
                    <span className={`text-2xl ${kronaOne.className} text-white hover:text-primary/90`}>
                        Rec Repo
                    </span>
                </div>

                {/* User Profile */}
                <div className="px-6 py-4 border-b border-stone-800">
                    <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            {session?.user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                                {session?.user?.name || 'User'}
                            </span>
                            <span className="text-xs text-stone-400">
                                {session?.user?.role?.toLowerCase() || 'student'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-1">
                        {renderNavItems(navItems)}
                    </div>
                </nav>

                {/* Sign Out Button */}
                <div className="p-4 border-t border-stone-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 mb-2"
                        onClick={() => handleNavigation('/settings')}
                    >
                        <Settings className="h-4 w-4" />
                        <span className="ml-3">Settings</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="ml-3">Sign out</span>
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={openSideNav} onOpenChange={setOpenSideNav}>
                <SheetContent
                    side="left"
                    className="w-[280px] p-0 bg-stone-900 border-transparent transition-transform duration-300 ease-in-out"
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6">
                            <span className={`text-2xl ${kronaOne.className} text-white hover:text-primary/90`}>
                                Rec Repo
                            </span>
                        </div>

                        {/* User Profile */}
                        <div className="px-6 py-4 border-b border-stone-800">
                            <div className="flex items-center space-x-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                    {session?.user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">
                                        {session?.user?.name || 'User'}
                                    </span>
                                    <span className="text-xs text-stone-400">
                                        {session?.user?.role?.toLowerCase() || 'student'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4">
                            <div className="space-y-1">
                                {renderNavItems(navItems)}
                            </div>
                        </nav>

                        {/* Sign Out Button */}
                        <div className="p-4 border-t border-stone-800">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 mb-2"
                                onClick={() => handleNavigation('/settings')}
                            >
                                <Settings className="h-4 w-4" />
                                <span className="ml-3">Settings</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sm font-medium text-destructive hover:bg-destructive/10"
                                onClick={handleSignOut}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="ml-3">Sign out</span>
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}