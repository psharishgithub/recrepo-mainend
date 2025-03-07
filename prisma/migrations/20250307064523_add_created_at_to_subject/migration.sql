/*
  Warnings:

  - The primary key for the `ChatHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `embeddings` on the `File` table. All the data in the column will be lost.
  - Added the required column `aggregatedContent` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatHistory" DROP CONSTRAINT "ChatHistory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ChatHistory_id_seq";

-- AlterTable
ALTER TABLE "File" DROP CONSTRAINT "File_pkey",
DROP COLUMN "embeddings",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "File_id_seq";

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "aggregatedContent" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Embedding" (
    "id" SERIAL NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chunkId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "vector" DOUBLE PRECISION[],

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Embedding_subjectId_chunkId_idx" ON "Embedding"("subjectId", "chunkId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_subject_chunk" ON "Embedding"("subjectId", "chunkId");

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
