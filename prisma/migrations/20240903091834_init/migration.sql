-- CreateTable
CREATE TABLE "IframeTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "IframeTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserTable" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
