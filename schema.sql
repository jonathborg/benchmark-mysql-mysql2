CREATE DATABASE `benchmark` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE TABLE `benchmark`.`person` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `number` VARCHAR(45) NOT NULL,
  `occupation` VARCHAR(45) NOT NULL,
  `lorem_ipsum` TEXT NOT NULL,
  PRIMARY KEY (`id`));
