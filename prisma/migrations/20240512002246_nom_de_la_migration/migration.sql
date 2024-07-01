-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_serieOwnerId_fkey";

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_serieOwnerId_fkey" FOREIGN KEY ("serieOwnerId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
