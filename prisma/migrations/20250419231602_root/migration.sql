/*
  Warnings:

  - Added the required column `level` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "level" "TaskLevel" NOT NULL;

-- CreateTable
CREATE TABLE "CompletedTasks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "CompletedTasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompletedTasks" ADD CONSTRAINT "CompletedTasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedTasks" ADD CONSTRAINT "CompletedTasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
