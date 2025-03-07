-- DropForeignKey
ALTER TABLE "Embedding" DROP CONSTRAINT "Embedding_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "SavedResponse" DROP CONSTRAINT "SavedResponse_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedResponse" ADD CONSTRAINT "SavedResponse_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
