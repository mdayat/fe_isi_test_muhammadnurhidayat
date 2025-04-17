/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "deleted_at";
