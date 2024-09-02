-- CreateTable
CREATE TABLE "UserTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ORG',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
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
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "PollTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PollQuestionTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "PollQuestionTable_userId_pollId_fkey" FOREIGN KEY ("userId", "pollId") REFERENCES "PollTable" ("userId", "id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "PollQuestionAnswerTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pollQuestionId" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    CONSTRAINT "PollQuestionAnswerTable_pollQuestionId_fkey" FOREIGN KEY ("pollQuestionId") REFERENCES "PollQuestionTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTable_email_key" ON "UserTable"("email");

-- CreateIndex
CREATE INDEX "UserTable_status_idx" ON "UserTable"("status");

-- CreateIndex
CREATE INDEX "RefreshTokens_familyId_idx" ON "RefreshTokens"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "PollTable_userId_id_key" ON "PollTable"("userId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "PollQuestionTable_userId_id_key" ON "PollQuestionTable"("userId", "id");

-- CreateIndex
CREATE INDEX "PollQuestionAnswerTable_macAddress_idx" ON "PollQuestionAnswerTable"("macAddress");
