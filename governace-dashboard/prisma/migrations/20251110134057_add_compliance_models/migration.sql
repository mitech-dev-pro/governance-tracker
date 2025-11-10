-- CreateTable
CREATE TABLE `control` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(128) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'DEPRECATED') NOT NULL DEFAULT 'ACTIVE',
    `frequency` ENUM('CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'AD_HOC') NOT NULL DEFAULT 'MONTHLY',
    `ownerId` INTEGER NULL,
    `departmentId` INTEGER NULL,
    `policyId` INTEGER NULL,
    `riskId` INTEGER NULL,
    `effectiveness` TINYINT NULL,
    `lastReviewed` DATETIME(3) NULL,
    `nextReview` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `control_code_key`(`code`),
    INDEX `Control_ownerId_fkey`(`ownerId`),
    INDEX `Control_departmentId_fkey`(`departmentId`),
    INDEX `Control_policyId_fkey`(`policyId`),
    INDEX `Control_riskId_fkey`(`riskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `policy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(128) NOT NULL,
    `status` ENUM('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `version` VARCHAR(32) NOT NULL,
    `ownerId` INTEGER NULL,
    `departmentId` INTEGER NULL,
    `approvedBy` INTEGER NULL,
    `approvedDate` DATETIME(3) NULL,
    `effectiveDate` DATETIME(3) NULL,
    `reviewDate` DATETIME(3) NULL,
    `attachmentUrl` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `policy_code_key`(`code`),
    INDEX `Policy_ownerId_fkey`(`ownerId`),
    INDEX `Policy_departmentId_fkey`(`departmentId`),
    INDEX `Policy_approvedBy_fkey`(`approvedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `controlId` INTEGER NULL,
    `assessorId` INTEGER NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'SCHEDULED',
    `result` ENUM('PASSED', 'FAILED', 'PARTIALLY_COMPLIANT', 'NOT_APPLICABLE') NULL,
    `score` TINYINT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `completedDate` DATETIME(3) NULL,
    `findings` TEXT NULL,
    `recommendations` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Assessment_controlId_fkey`(`controlId`),
    INDEX `Assessment_assessorId_fkey`(`assessorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `control` ADD CONSTRAINT `Control_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `control` ADD CONSTRAINT `Control_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `control` ADD CONSTRAINT `Control_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `policy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `control` ADD CONSTRAINT `Control_riskId_fkey` FOREIGN KEY (`riskId`) REFERENCES `risk`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy` ADD CONSTRAINT `Policy_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy` ADD CONSTRAINT `Policy_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy` ADD CONSTRAINT `Policy_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment` ADD CONSTRAINT `Assessment_controlId_fkey` FOREIGN KEY (`controlId`) REFERENCES `control`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment` ADD CONSTRAINT `Assessment_assessorId_fkey` FOREIGN KEY (`assessorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
