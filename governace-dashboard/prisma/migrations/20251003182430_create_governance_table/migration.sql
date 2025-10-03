-- CreateTable
CREATE TABLE `GovernanceList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `ownerId` INTEGER NULL,
    `action` TEXT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `Notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GovernanceList_item_key`(`item`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GovernanceList` ADD CONSTRAINT `GovernanceList_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
