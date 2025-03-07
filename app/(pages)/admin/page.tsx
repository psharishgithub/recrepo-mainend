'use client'

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LoadingSpinner from "@/app/components/loadingspinner";
import { motion } from "framer-motion";
import CreateSubject from "./create-subject";
import SubjectList from "./subject-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    redirect("/api/auth/signin");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-stone-400">Create and manage subjects in the repository.</p>
        </div>
        
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-stone-800">
            <TabsTrigger value="create" className="data-[state=active]:bg-stone-700">
              Subject Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-stone-700">
              Role Management
            </TabsTrigger>
            <TabsTrigger value="danger" className="data-[state=active]:bg-stone-700">
              Danger Zone
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-8 mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Create New Subject</h2>
              <CreateSubject />
            </div>
          </TabsContent>
          
          <TabsContent value="danger" className="space-y-8 mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
              <p className="text-stone-400">Warning: Actions performed here cannot be undone.</p>
              <SubjectList />
            </div>
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-8 mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Role Management</h2>
              <p className="text-stone-400">Role management features coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
