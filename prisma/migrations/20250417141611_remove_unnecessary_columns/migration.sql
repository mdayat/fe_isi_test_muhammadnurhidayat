/*
  Warnings:

  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task_audit_log" ALTER COLUMN "changes" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "updated_at";
