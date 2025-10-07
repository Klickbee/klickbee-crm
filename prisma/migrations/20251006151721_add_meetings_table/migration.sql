-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('Scheduled', 'Confirmed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MeetingFrequency" AS ENUM ('Daily', 'Weekly', 'Monthly', 'Yearly');

-- CreateEnum
CREATE TYPE "MeetingEnds" AS ENUM ('Never', 'After', 'OnDate');

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "repeatMeeting" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "MeetingFrequency" NOT NULL DEFAULT 'Daily',
    "repeatOn" TEXT,
    "repeatEvery" INTEGER NOT NULL DEFAULT 0,
    "ends" "MeetingEnds" NOT NULL DEFAULT 'Never',
    "location" TEXT,
    "linkedId" TEXT NOT NULL,
    "assignedId" TEXT,
    "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MeetingStatus" NOT NULL DEFAULT 'Scheduled',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "files" JSONB,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_linkedId_idx" ON "Meeting"("linkedId");

-- CreateIndex
CREATE INDEX "Meeting_assignedId_idx" ON "Meeting"("assignedId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_linkedId_fkey" FOREIGN KEY ("linkedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_assignedId_fkey" FOREIGN KEY ("assignedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
