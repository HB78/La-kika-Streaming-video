/*
  Warnings:

  - Made the column `title` on table `series` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "films" ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'film';

-- AlterTable
ALTER TABLE "series" ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'serie',
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "photo" DROP NOT NULL;
