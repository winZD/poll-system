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
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VotesTable_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "PollTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "VotesTable_pollQuestionId_fkey" FOREIGN KEY ("pollQuestionId") REFERENCES "PollQuestionTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "VotesTable_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrgTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_VotesTable" ("city", "country", "fingerPrint", "hostname", "id", "ipAddress", "loc", "org", "orgId", "pollId", "pollQuestionId", "postal", "region", "timezone", "userAgent") SELECT "city", "country", "fingerPrint", "hostname", "id", "ipAddress", "loc", "org", "orgId", "pollId", "pollQuestionId", "postal", "region", "timezone", "userAgent" FROM "VotesTable";
DROP TABLE "VotesTable";
ALTER TABLE "new_VotesTable" RENAME TO "VotesTable";
CREATE INDEX "VotesTable_orgId_fingerPrint_idx" ON "VotesTable"("orgId", "fingerPrint");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
