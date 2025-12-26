-- AlterTable
ALTER TABLE `user` ADD COLUMN `two_factor_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `two_factor_method` VARCHAR(20) NULL;

-- CreateTable
CREATE TABLE `two_factor_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `code` VARCHAR(6) NOT NULL,
    `magic_token` VARCHAR(64) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `two_factor_codes_magic_token_key`(`magic_token`),
    INDEX `two_factor_codes_user_id_idx`(`user_id`),
    INDEX `two_factor_codes_code_idx`(`code`),
    INDEX `two_factor_codes_magic_token_idx`(`magic_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `two_factor_codes` ADD CONSTRAINT `two_factor_codes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
