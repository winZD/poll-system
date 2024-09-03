-- CreateTable
CREATE TABLE "OrgTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ORG',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "UserTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "permissions" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "UserTable_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrgTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "RefreshTokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GRANTED'
);

-- CreateTable
CREATE TABLE "PollTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "iframeTitle" TEXT NOT NULL,
    "iframeSrc" TEXT NOT NULL,
    CONSTRAINT "PollTable_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrgTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "PollTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PollQuestionTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "PollQuestionTable_orgId_pollId_fkey" FOREIGN KEY ("orgId", "pollId") REFERENCES "PollTable" ("orgId", "id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "VotesTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "pollQuestionId" TEXT NOT NULL,
    "fingerPrint" TEXT NOT NULL,
    CONSTRAINT "VotesTable_pollQuestionId_fkey" FOREIGN KEY ("pollQuestionId") REFERENCES "PollQuestionTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "VotesTable_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "OrgTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgTable_email_key" ON "OrgTable"("email");

-- CreateIndex
CREATE INDEX "OrgTable_status_idx" ON "OrgTable"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserTable_email_key" ON "UserTable"("email");

-- CreateIndex
CREATE INDEX "UserTable_status_idx" ON "UserTable"("status");

-- CreateIndex
CREATE INDEX "RefreshTokens_familyId_idx" ON "RefreshTokens"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "PollTable_orgId_id_key" ON "PollTable"("orgId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PollQuestionTable_orgId_id_key" ON "PollQuestionTable"("orgId", "id");

-- CreateIndex
CREATE INDEX "VotesTable_orgId_fingerPrint_idx" ON "VotesTable"("orgId", "fingerPrint");
