-- CreateTable
CREATE TABLE "CreditCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cardNumber" TEXT,
    "type" TEXT,
    "expirationMonth" TEXT,
    "expirationYear" TEXT,
    "active" INTEGER NOT NULL DEFAULT 1,
    "csv" TEXT,
    "email" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "employeeId" TEXT NOT NULL,
    CONSTRAINT "CreditCard_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CreditCard_employeeId_idx" ON "CreditCard"("employeeId");
