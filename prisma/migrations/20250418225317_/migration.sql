/*
  Warnings:

  - You are about to drop the column `solution` on the `Task` table. All the data in the column will be lost.
  - Added the required column `taskId` to the `SubTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubTask" ADD COLUMN     "taskId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "solution";

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
