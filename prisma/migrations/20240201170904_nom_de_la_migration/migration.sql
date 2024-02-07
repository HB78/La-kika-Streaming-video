/*
  Warnings:

  - Made the column `photo` on table `series` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "episodes" ALTER COLUMN "photo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "series" ALTER COLUMN "photo" SET NOT NULL,
ALTER COLUMN "genre" DROP NOT NULL;
