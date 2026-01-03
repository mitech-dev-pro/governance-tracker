-- CreateTable
CREATE TABLE `audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('INTERNAL', 'EXTERNAL', 'COMPLIANCE', 'FINANCIAL', 'OPERATIONAL', 'IT', 'QUALITY') NOT NULL DEFAULT 'INTERNAL',
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'FIELD_WORK', 'REPORTING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `scope` TEXT NOT NULL,
    `leadAuditorId` INTEGER NULL,
    `departmentId` INTEGER NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `reportDate` DATETIME(3) NULL,
    `conclusion` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `audit_code_key`(`code`),
    INDEX `Audit_leadAuditorId_fkey`(`leadAuditorId`),
    INDEX `Audit_departmentId_fkey`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_finding` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auditId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'DEFERRED') NOT NULL DEFAULT 'OPEN',
    `category` VARCHAR(128) NOT NULL,
    `recommendation` TEXT NOT NULL,
    `responsibleId` INTEGER NULL,
    `dueDate` DATETIME(3) NULL,
    `closedDate` DATETIME(3) NULL,
    `evidenceUrl` VARCHAR(512) NULL,
    `remediationPlan` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AuditFinding_auditId_fkey`(`auditId`),
    INDEX `AuditFinding_responsibleId_fkey`(`responsibleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `auditId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL DEFAULT 1,
    `location` VARCHAR(255) NULL,
    `attendees` JSON NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AuditSchedule_auditId_fkey`(`auditId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetTag` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('COMPUTER', 'LAPTOP', 'MONITOR', 'PRINTER', 'SCANNER', 'NETWORKING', 'PERIPHERAL', 'ACCESSORY', 'MOBILE_DEVICE', 'SERVER', 'STORAGE', 'SOFTWARE_LICENSE', 'CONSUMABLE', 'OTHER') NOT NULL,
    `type` VARCHAR(128) NOT NULL,
    `brand` VARCHAR(128) NULL,
    `model` VARCHAR(128) NULL,
    `serialNumber` VARCHAR(255) NULL,
    `status` ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST', 'DAMAGED', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE',
    `condition` ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPAIR') NOT NULL DEFAULT 'GOOD',
    `location` VARCHAR(255) NULL,
    `departmentId` INTEGER NULL,
    `assignedToId` INTEGER NULL,
    `assignedToName` VARCHAR(255) NULL,
    `purchaseDate` DATETIME(3) NULL,
    `purchaseCost` DECIMAL(10, 2) NULL,
    `warrantyExpiry` DATETIME(3) NULL,
    `supplier` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `imageUrl` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `asset_assetTag_key`(`assetTag`),
    UNIQUE INDEX `asset_serialNumber_key`(`serialNumber`),
    INDEX `Asset_departmentId_fkey`(`departmentId`),
    INDEX `Asset_assignedToId_fkey`(`assignedToId`),
    INDEX `Asset_category_idx`(`category`),
    INDEX `Asset_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetId` INTEGER NOT NULL,
    `type` ENUM('ROUTINE', 'REPAIR', 'UPGRADE', 'INSPECTION', 'CLEANING', 'CALIBRATION') NOT NULL DEFAULT 'ROUTINE',
    `description` TEXT NOT NULL,
    `performedBy` VARCHAR(255) NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `completedDate` DATETIME(3) NULL,
    `cost` DECIMAL(10, 2) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE') NOT NULL DEFAULT 'SCHEDULED',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Maintenance_assetId_fkey`(`assetId`),
    INDEX `Maintenance_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetId` INTEGER NULL,
    `type` ENUM('CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'RETURN', 'DISPOSAL', 'PURCHASE', 'ADJUSTMENT') NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `fromLocation` VARCHAR(255) NULL,
    `toLocation` VARCHAR(255) NULL,
    `fromUserId` INTEGER NULL,
    `toUserId` INTEGER NULL,
    `reason` TEXT NULL,
    `notes` TEXT NULL,
    `movedBy` VARCHAR(255) NOT NULL,
    `movementDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovement_assetId_fkey`(`assetId`),
    INDEX `StockMovement_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit` ADD CONSTRAINT `Audit_leadAuditorId_fkey` FOREIGN KEY (`leadAuditorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit` ADD CONSTRAINT `Audit_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_finding` ADD CONSTRAINT `AuditFinding_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_finding` ADD CONSTRAINT `AuditFinding_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_schedule` ADD CONSTRAINT `AuditSchedule_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `audit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `Asset_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset` ADD CONSTRAINT `Asset_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance` ADD CONSTRAINT `Maintenance_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `asset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movement` ADD CONSTRAINT `StockMovement_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `asset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
