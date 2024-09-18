/*
  Warnings:

  - You are about to drop the column `location` on the `VotesTable` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VotesTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "pollQuestionId" TEXT NOT NULL,
    "fingerPrint" TEXT NOT NULL,
    "ipAddress" TEXT,
    "hostname" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "loc" TEXT,
    "org" TEXT,
    "postal" TEXT,
    "timezone" TEXT,
    CONSTRAINT "VotesTable_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "PollTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "VotesTable_pollQuestionId_fkey" FOREIGN KEY ("pollQuestionId") REFERENCES "PollQuestionTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "VotesTable_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrgTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_VotesTable" ("fingerPrint", "id", "ipAddress", "orgId", "pollId", "pollQuestionId") SELECT "fingerPrint", "id", "ipAddress", "orgId", "pollId", "pollQuestionId" FROM "VotesTable";
DROP TABLE "VotesTable";
ALTER TABLE "new_VotesTable" RENAME TO "VotesTable";
CREATE INDEX "VotesTable_orgId_fingerPrint_idx" ON "VotesTable"("orgId", "fingerPrint");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
