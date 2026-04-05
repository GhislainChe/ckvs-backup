-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: ckvs_offline
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applied_practices`
--

DROP TABLE IF EXISTS `applied_practices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applied_practices` (
  `appliedId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `practiceId` int NOT NULL,
  `status` enum('APPLIED','REPORTED') NOT NULL DEFAULT 'APPLIED',
  `appliedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reportedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`appliedId`),
  UNIQUE KEY `unique_user_practice` (`userId`,`practiceId`),
  KEY `fk_applied_practice` (`practiceId`),
  CONSTRAINT `fk_applied_practice` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`practiceId`) ON DELETE CASCADE,
  CONSTRAINT `fk_applied_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applied_practices`
--

LOCK TABLES `applied_practices` WRITE;
/*!40000 ALTER TABLE `applied_practices` DISABLE KEYS */;
INSERT INTO `applied_practices` VALUES (23,36,27,'REPORTED','2026-03-09 07:40:49','2026-03-09 07:41:36'),(24,40,27,'APPLIED','2026-03-09 08:55:15',NULL),(25,34,28,'APPLIED','2026-03-09 11:11:19',NULL),(26,42,29,'APPLIED','2026-03-09 21:04:35',NULL),(27,26,29,'REPORTED','2026-03-10 10:45:22','2026-03-10 10:46:59'),(28,26,28,'APPLIED','2026-03-10 10:55:09',NULL),(29,2,28,'APPLIED','2026-03-25 15:52:27',NULL),(30,2,29,'REPORTED','2026-03-25 15:52:44','2026-03-25 15:53:50'),(31,2,27,'APPLIED','2026-03-25 15:52:56',NULL);
/*!40000 ALTER TABLE `applied_practices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `commentId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `practiceId` int NOT NULL,
  `parentCommentId` int DEFAULT NULL,
  `content` text NOT NULL,
  `status` enum('VISIBLE','HIDDEN','DELETED') NOT NULL DEFAULT 'VISIBLE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`commentId`),
  KEY `userId` (`userId`),
  KEY `practiceId` (`practiceId`),
  KEY `parentCommentId` (`parentCommentId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`practiceId`),
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parentCommentId`) REFERENCES `comments` (`commentId`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (25,38,28,NULL,'who can bake beans','VISIBLE','2026-03-09 08:07:48'),(26,34,27,NULL,'It\'s true it protect the seeds but crops also need the sunlight energy inorder to grow','VISIBLE','2026-03-09 11:20:24'),(27,34,28,NULL,'Low slippers are mostly preferred during dry season','VISIBLE','2026-03-09 11:22:17'),(28,34,28,25,'Can beans be baked ?','VISIBLE','2026-03-09 11:23:12'),(29,41,28,NULL,'Good practice thou','VISIBLE','2026-03-09 15:24:54'),(30,2,28,25,'Who are you\nwhat kind of practice is this?','HIDDEN','2026-03-10 10:53:15'),(31,26,28,NULL,'this practice is actually very efficient','VISIBLE','2026-03-11 00:55:30'),(32,2,28,NULL,'Hello is this practice really reliable?','VISIBLE','2026-03-25 15:51:31'),(33,2,29,NULL,'this practice is good','VISIBLE','2026-04-02 14:23:58');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `croptypes`
--

DROP TABLE IF EXISTS `croptypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `croptypes` (
  `cropTypeId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`cropTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `croptypes`
--

LOCK TABLES `croptypes` WRITE;
/*!40000 ALTER TABLE `croptypes` DISABLE KEYS */;
INSERT INTO `croptypes` VALUES (4,'Maize'),(5,'Beans'),(6,'Tomato'),(7,'Cassava'),(8,'Plantain'),(9,'Rice'),(10,'Cocoa'),(11,'Coffee'),(12,'Groundnut'),(13,'Potato'),(14,'Others');
/*!40000 ALTER TABLE `croptypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flags`
--

DROP TABLE IF EXISTS `flags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flags` (
  `flagId` int NOT NULL AUTO_INCREMENT,
  `reporterUserId` int NOT NULL,
  `targetType` enum('PRACTICE','OUTCOME','COMMENT') NOT NULL,
  `targetId` int NOT NULL,
  `reason` enum('SPAM','FALSE_INFO','ABUSIVE','OTHER') NOT NULL,
  `details` varchar(500) DEFAULT NULL,
  `status` enum('PENDING','RESOLVED') NOT NULL DEFAULT 'PENDING',
  `reviewedBy` int DEFAULT NULL,
  `actionTaken` enum('NO_ACTION','HIDE_COMMENT','REMOVE_PRACTICE','REJECT_OUTCOME') NOT NULL DEFAULT 'NO_ACTION',
  `reviewNote` varchar(500) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewedAt` datetime DEFAULT NULL,
  `isUndone` tinyint(1) NOT NULL DEFAULT '0',
  `undoneBy` int DEFAULT NULL,
  `undoneAt` datetime DEFAULT NULL,
  `undoNote` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`flagId`),
  KEY `reporterUserId` (`reporterUserId`),
  KEY `reviewedBy` (`reviewedBy`),
  CONSTRAINT `flags_ibfk_1` FOREIGN KEY (`reporterUserId`) REFERENCES `users` (`userId`),
  CONSTRAINT `flags_ibfk_2` FOREIGN KEY (`reviewedBy`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flags`
--

LOCK TABLES `flags` WRITE;
/*!40000 ALTER TABLE `flags` DISABLE KEYS */;
INSERT INTO `flags` VALUES (23,36,'PRACTICE',27,'FALSE_INFO',NULL,'RESOLVED',2,'NO_ACTION','i dont see any problem with his practice','2026-03-09 07:40:44','2026-03-10 10:50:49',0,NULL,NULL,NULL),(24,26,'COMMENT',30,'FALSE_INFO',NULL,'RESOLVED',2,'HIDE_COMMENT',NULL,'2026-03-11 00:54:07','2026-03-11 00:54:37',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `flags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notificationId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(120) NOT NULL,
  `message` text NOT NULL,
  `linkUrl` varchar(255) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'SYSTEM',
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationId`),
  KEY `userId` (`userId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (9,2,'Your comment was removed','A moderator removed your comment for violating community guidelines.','/app/discussions?practiceId=28','MODERATION',0,'2026-03-11 00:54:37');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `outcomereports`
--

DROP TABLE IF EXISTS `outcomereports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outcomereports` (
  `reportId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `practiceId` int NOT NULL,
  `outcomeType` enum('EFFECTIVE','PARTIAL','INEFFECTIVE') NOT NULL,
  `outcomeScore` decimal(3,1) NOT NULL,
  `similarContext` enum('Y','N') NOT NULL,
  `observation` text,
  `timeToResult` enum('LT_1_WEEK','WEEK_1_2','WEEK_3_4','GT_1_MONTH') DEFAULT NULL,
  `recommendation` enum('YES','MAYBE','NO') DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('VALID','REJECTED') NOT NULL DEFAULT 'VALID',
  PRIMARY KEY (`reportId`),
  UNIQUE KEY `uniq_user_practice` (`userId`,`practiceId`),
  KEY `practiceId` (`practiceId`),
  CONSTRAINT `outcomereports_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  CONSTRAINT `outcomereports_ibfk_2` FOREIGN KEY (`practiceId`) REFERENCES `practices` (`practiceId`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `outcomereports`
--

LOCK TABLES `outcomereports` WRITE;
/*!40000 ALTER TABLE `outcomereports` DISABLE KEYS */;
INSERT INTO `outcomereports` VALUES (30,36,27,'PARTIAL',0.5,'N',NULL,NULL,'MAYBE','2026-03-09 07:41:36','VALID'),(31,26,29,'EFFECTIVE',1.0,'Y',NULL,NULL,'YES','2026-03-10 10:46:59','VALID'),(32,2,29,'EFFECTIVE',1.0,'Y',NULL,NULL,'YES','2026-03-25 15:53:50','VALID');
/*!40000 ALTER TABLE `outcomereports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `practices`
--

DROP TABLE IF EXISTS `practices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `practices` (
  `practiceId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `overview` text,
  `steps` text NOT NULL,
  `materials` text,
  `season` varchar(50) DEFAULT NULL,
  `location` varchar(120) DEFAULT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `status` enum('ACTIVE','REMOVED') NOT NULL DEFAULT 'ACTIVE',
  `effectivenessScore` decimal(5,2) NOT NULL DEFAULT '0.00',
  `confidenceLevel` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cropTypeId` int DEFAULT NULL,
  `problemTypeId` int DEFAULT NULL,
  PRIMARY KEY (`practiceId`),
  KEY `userId` (`userId`),
  KEY `fk_practices_crop` (`cropTypeId`),
  KEY `fk_practices_problem` (`problemTypeId`),
  CONSTRAINT `fk_practices_crop` FOREIGN KEY (`cropTypeId`) REFERENCES `croptypes` (`cropTypeId`) ON DELETE SET NULL,
  CONSTRAINT `fk_practices_problem` FOREIGN KEY (`problemTypeId`) REFERENCES `problemtypes` (`problemTypeId`) ON DELETE SET NULL,
  CONSTRAINT `practices_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `practices`
--

LOCK TABLES `practices` WRITE;
/*!40000 ALTER TABLE `practices` DISABLE KEYS */;
INSERT INTO `practices` VALUES (22,16,'Neem Extract for Aphid Control','Aphids are common pests affecting vegetables like tomatoes and beans. Neem extract provides an organic solution to reduce pest infestation while preserving beneficial insects.','Using neem leaves to produce a natural pesticide that controls aphids without harming crops.','1. Collect fresh neem leaves.\n2. Crush the leaves and soak them in water for 24 hours.\n3. Filter the mixture.\n4. Spray the liquid on affected crops early in the morning.','Fresh neem leaves, water, container, sprayer','Rainy season','Centre Region, Cameroon','https://5.imimg.com/data5/SELLER/Default/2022/11/AU/KS/VT/4945880/neem-extract-8-by-gv-1000x1000.jpg','ACTIVE',0.00,'LOW','2026-03-09 03:59:21',6,9),(23,19,'Mulching to Retain Soil Moisture','Mulching improves soil structure, reduces evaporation, and protects crops from extreme temperatures.','Applying organic mulch around crops to retain soil moisture and suppress weeds.','1. Collect dry grass or leaves.\n2. Spread mulch around plants.\n3. Leave space around the plant stem.\n4. Replace mulch as it decomposes.','Dry grass, leaves, crop residues','Dry season','West Region, Cameroon','https://th.bing.com/th/id/OIP.b8gW1od2rb6BeR39a8KSsAHaE8?w=232&h=180&c=7&r=0&o=7&pid=1.7&rm=3','ACTIVE',0.00,'LOW','2026-03-09 04:05:13',4,6),(24,18,'Intercropping Maize and Beans','Beans fix nitrogen in the soil, benefiting maize growth while maximizing productivity.','Growing maize and beans together to improve soil fertility and maximize land use.','1. Prepare farmland.\n2. Plant maize in rows.\n3. Plant beans between maize rows.\n4. Maintain proper spacing.','Maize seeds, bean seeds, farming tools','Rainy season','North West Region, Cameroon','https://images.unsplash.com/photo-1625246333195-78d9c38ad449','ACTIVE',0.00,'LOW','2026-03-09 04:07:58',4,5),(25,21,'Compost for Soil Fertility Improvement','Compost enhances soil fertility, reduces waste, and supports sustainable agriculture.','Producing compost from organic waste to improve soil nutrients.','1. Gather organic waste.\n2. Layer green and dry materials.\n3. Water lightly.\n4. Turn compost regularly.','Organic waste, dry leaves, water','All seasons','South West Region, Cameroon','https://th.bing.com/th/id/OIP.GLqhsnTc54xuVFNy--ZDMgHaEK?w=295&h=180&c=7&r=0&o=7&pid=1.7&rm=3','ACTIVE',0.00,'LOW','2026-03-09 04:12:01',7,2),(26,24,'Crop Rotation for Pest Prevention','Crop rotation disrupts pest cycles and improves soil nutrient balance.','Changing crops each season to reduce pest buildup and maintain soil health.','1. Plan crop sequence.\n2. Avoid planting the same crop repeatedly.\n3. Alternate legumes and cereals.','Farm planning tools','All seasons','Adamawa Region, Cameroon','https://images.unsplash.com/photo-1500382017468-9049fed747ef','ACTIVE',0.00,'LOW','2026-03-09 04:14:52',14,1),(27,21,'Organic Weed Control Using Mulch','Organic mulching blocks sunlight from reaching weed seeds, preventing their growth.','Suppressing weeds naturally using organic mulch materials.','1. Clear existing weeds.\n2. Apply thick mulch layer.\n3. Maintain mulch regularly.','Straw, dry leaves, grass','Rainy season','Centre Region, Cameroon','https://images.unsplash.com/photo-1523741543316-beb7fc7023d8','ACTIVE',0.50,'LOW','2026-03-09 04:17:52',6,3),(28,38,'food','chop','blk','cocoa',NULL,'All seasons','dubai','https://res.cloudinary.com/duptpodad/image/upload/v1773043615/ckvs_practices/practice_1773043614715_482615781.jpg','ACTIVE',0.00,'LOW','2026-03-09 08:06:55',NULL,NULL),(29,41,'How yo treat crops','Plantain cultivation',NULL,'Land preparation: Clear the land and loosen the soil. Plantain grows best in fertile, well-drained soil.\r\nPlanting: Use healthy plantain suckers and plant them in holes about 30–40 cm deep, spacing them about 2–3 meters apart.\r\nWatering: Water regularly, especially during dry periods, but avoid waterlogging.\r\nWeeding and mulching: Remove weeds and add mulch to keep moisture in the soil.\r\nFertilizing: Apply organic manure or fertilizer to improve growth.\r\nPest and disease control: Monitor plants and remove infected leaves or plants.\r\nHarvesting: Plantain is usually ready for harvest 8–12 months after planting when the fruits are fully developed.','Cutlass','All seasons','Makenene','https://res.cloudinary.com/duptpodad/image/upload/v1773069780/ckvs_practices/practice_1773069780431_518660751.jpg','ACTIVE',1.00,'LOW','2026-03-09 15:23:01',8,5);
/*!40000 ALTER TABLE `practices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problemtypes`
--

DROP TABLE IF EXISTS `problemtypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problemtypes` (
  `problemTypeId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`problemTypeId`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problemtypes`
--

LOCK TABLES `problemtypes` WRITE;
/*!40000 ALTER TABLE `problemtypes` DISABLE KEYS */;
INSERT INTO `problemtypes` VALUES (1,'Pest infestation'),(2,'Soil fertility decline'),(3,'Weed invasion'),(4,'Fungal disease'),(5,'Low crop yield'),(6,'Water stress'),(7,'Poor soil drainage'),(8,'Leaf spot disease'),(9,'Aphid attack'),(10,'Stem borer infestation'),(11,'Óthers');
/*!40000 ALTER TABLE `problemtypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `userRole` enum('USER','MODERATOR','ADMIN') NOT NULL DEFAULT 'USER',
  `credibilityScore` decimal(5,2) NOT NULL DEFAULT '0.00',
  `userStatus` enum('ACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL DEFAULT 'OTHER',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'System Administrator','admin@ckvs.vercel.app','$2b$10$pDUyaa7e.L83/H3XAds9n.5Y7Fmi7JJgPnGCAf6IGdQQDHR54a6rK','ADMIN',1.00,'ACTIVE','2026-01-31 00:18:31','OTHER'),(16,'John Mbella','john.mbella@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:36:51','OTHER'),(18,'Grace Tabi','grace.tabi@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:38:12','OTHER'),(19,'Dr. Amina Nfor','amina.nfor@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:39:17','OTHER'),(20,'Samuel Tanyi','samuel.tanyi@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:40:56','OTHER'),(21,'Linda Nkem','linda.nkem@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.25,'ACTIVE','2026-03-09 03:40:56','OTHER'),(22,'Peter Fon','peter.fon@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:40:56','OTHER'),(23,'Esther Neba','esther.neba@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:40:56','OTHER'),(24,'Michael Ndzi','michael.ndzi@ckvs.org','$2b$10$CwTycUXWue0Thq9StjUM0uJ8q9q4CPGK/c/pX9nuSUXGMWzME2Yay','USER',0.00,'ACTIVE','2026-03-09 03:40:56','OTHER'),(25,'Mbome Mejang Cynthia','cynthiambomemejang@gmail.com','$2b$10$6N.qaNz/R/2oofzGl/nTB.h74J22qW0Qp.wWykyZ.uwhh55Lf5.tu','USER',0.00,'ACTIVE','2026-03-09 05:44:27','FEMALE'),(26,'Ndong Ghislain Che','ghislainche2007@gmail.com','$2b$10$jXGGJ7HDZv9Xv1fgEStaHu74lIBQ/kQAxePaulLAttZQZ7kHpKlk6','USER',0.00,'ACTIVE','2026-03-09 05:47:06','MALE'),(27,'Fang Aurailly','fangfangaurailly@gmail.com','$2b$10$fhf5Zy9Uw7P2Ue73YxlWOOKWBryTO.QY.NNoINOTht2tOObMbiK5O','USER',0.00,'ACTIVE','2026-03-09 05:47:52','FEMALE'),(28,'Chefor Godwin','cheforgodwin01@gmail.com','$2b$10$t3vBimDI5i58PUO/cWdQ0uS9RTKTsePBRfFtGtBx0SSIQ7XtLdBfa','USER',0.00,'ACTIVE','2026-03-09 05:48:40','MALE'),(29,'Mauricette Mah','mauricettemah@gmail.com','$2b$10$rMuWCGUzcSCIszfU9jKEbeYHq27MUMIAzYc2iTaH5ESeeNC81iUJu','USER',0.00,'ACTIVE','2026-03-09 05:49:16','FEMALE'),(30,'Che Bless','cbless673@gmail.com','$2b$10$zWfAYDKslVX96R/pN8TQR.g5VfQTmfmCZ6pLYoUdLfeaoMcu4yTpC','USER',0.00,'ACTIVE','2026-03-09 05:56:14','MALE'),(31,'Ngwa davila ','ngwadavila@gmail.com','$2b$10$GdmXGUYQn5PAear2hBbSCO9GX8lRx/NyaK9gzO8GGINq8YZKEogZG','USER',0.00,'ACTIVE','2026-03-09 06:06:39','FEMALE'),(32,'Djomo Kaisi','kaisidjomo@gmail.com','$2b$10$p/SGDB7mdx/zWzMBp.qdOOoAroH9.4z7duhPt2EpTSlbUswv83gNm','USER',0.00,'ACTIVE','2026-03-09 06:15:15','FEMALE'),(33,'Nso Keshuanza Rosa milka ','keshuanzanso@gmail.com','$2b$10$y0mRGwLAfzkVT5XBirKspO5WfSeZUzawdlnhO4FzPBqmL/zslTDL.','USER',0.00,'ACTIVE','2026-03-09 06:23:53','FEMALE'),(34,'Blandine Pinky','pinkyblandine8@gmail.com','$2b$10$OlRSO7nMdxNzpIGfmOHS8.OUy0PFNM9DbMmKuGVUqcoVQ5jUYiKwu','USER',0.00,'ACTIVE','2026-03-09 06:27:58','FEMALE'),(35,'Nateu farhel ','taliaharper89@gmail.com','$2b$10$g0pe21CEXpYxNEyc5mkHMOgGorfKf2HR321YMNBXNdkbf4Oqt3f46','USER',0.00,'ACTIVE','2026-03-09 07:35:56','MALE'),(36,'Bandoski','bandoski@gmail.com','$2b$10$.csXfPRoW4oo16pi5z.unuhTpThvtfuRBf3TdO.BSoilelehJ01Sy','USER',0.00,'ACTIVE','2026-03-09 07:39:06','OTHER'),(37,'Agbor Thomas','agborthomasayukcarmelo@gmail.com','$2b$10$aggmGotffCHkQN5i3Icwc.K6kah58OsY.Ov9ZAOcf7GSiUzOgEYYu','USER',0.00,'ACTIVE','2026-03-09 07:39:49','MALE'),(38,'Che casandra','dreamers@gmail.com','$2b$10$uzqn19ogyf/peWFE9..aPO4OMgeZEwhhGTn930CZ3FmzEx6.EgWfW','USER',0.00,'ACTIVE','2026-03-09 08:04:08','MALE'),(39,'Tommy','nuvodiobama@gmail.com','$2b$10$Fr2DG9pn/WzCIaTTb0ABdu4.DtMCOPMgw.axbEml2xywgIf3DGFLe','USER',0.00,'ACTIVE','2026-03-09 08:05:20','MALE'),(40,'Lendzele Goodwill','lendzelegoodwill@gmail.com','$2b$10$85efc0/RIi6UuTUho1GNfO3PZJURpLtIEslm.5F4H4nQ.B/ukFrEW','USER',0.00,'ACTIVE','2026-03-09 08:53:23','MALE'),(41,'Ghetto Maczi','maczighetto@gmail.com','$2b$10$EKftsSyWbjm63a4dYwiPju215aUC5qSg1HV7lshaTOYkHBO7WhuRK','USER',1.00,'ACTIVE','2026-03-09 15:15:47','MALE'),(42,'Kevin Omgba','kevinomgba1@gmail.com','$2b$10$9Vuridk.mzw37rim6FDaJ.HppwW346xoppX8YRhsZfGXE7mWqp35i','USER',0.00,'ACTIVE','2026-03-09 21:03:25','MALE'),(43,'Rachelle Carly','carlypaker@gmail.com','$2b$10$2lyPM9zj29zx9ZaGftksmOnXsi6chuOEGGmI65/OJeIXjc9E9TjjC','USER',0.00,'ACTIVE','2026-03-22 19:34:09','MALE');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-05 23:34:05
