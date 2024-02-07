/*
  Warnings:

  - Added the required column `url` to the `episodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `films` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "episodes" ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "films" ADD COLUMN     "url" TEXT NOT NULL;
