-- MySQL dump 10.13  Distrib 5.7.26, for Linux (x86_64)
--
-- Host: localhost    Database: wawa_db
-- ------------------------------------------------------
-- Server version	5.7.26-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AccountTbl`
--

DROP TABLE IF EXISTS `AccountTbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccountTbl` (
  `AccountNo` int(11) NOT NULL AUTO_INCREMENT,
  `Account` char(128) NOT NULL,
  `Password` char(128) NOT NULL,
  `Name` char(128) NOT NULL,
  `CreateDate` int(11) DEFAULT NULL,
  `Enable` tinyint(1) NOT NULL DEFAULT '1',
  `SuperUser` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`AccountNo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccountTbl`
--

LOCK TABLES `AccountTbl` WRITE;
/*!40000 ALTER TABLE `AccountTbl` DISABLE KEYS */;
INSERT INTO `AccountTbl` VALUES (1,'cectco','Cectco123@','SuperAdmin',1563333264,1,1),(3,'tywu@cectco.com','12345678','tywu@cectco.com',1563342996,1,0),(4,'hylin@cectco.com','12345678','hylin@cectco.com',1563431075,1,0);
/*!40000 ALTER TABLE `AccountTbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AllowTbl`
--

DROP TABLE IF EXISTS `AllowTbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AllowTbl` (
  `DevNo` char(12) NOT NULL,
  `ExpireDate` int(11) DEFAULT NULL,
  PRIMARY KEY (`DevNo`),
  UNIQUE KEY `DevNo` (`DevNo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AllowTbl`
--

LOCK TABLES `AllowTbl` WRITE;
/*!40000 ALTER TABLE `AllowTbl` DISABLE KEYS */;
/*!40000 ALTER TABLE `AllowTbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DeviceTbl`
--

DROP TABLE IF EXISTS `DeviceTbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DeviceTbl` (
  `DevNo` char(12) NOT NULL,
  `DevName` char(128) DEFAULT NULL,
  `AccountNo` int(11) DEFAULT NULL,
  `PrjName` char(4) DEFAULT NULL,
  `DevAlias` char(128) DEFAULT NULL,
  `GroupNo` int(11) DEFAULT NULL,
  `S01` char(128) DEFAULT NULL,
  `S02` char(128) DEFAULT NULL,
  `CreateDate` int(11) DEFAULT NULL,
  `UpdateDate` int(11) DEFAULT NULL,
  `ExpireDate` int(11) DEFAULT NULL,
  PRIMARY KEY (`DevNo`),
  UNIQUE KEY `DevNo` (`DevNo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DeviceTbl`
--

LOCK TABLES `DeviceTbl` WRITE;
/*!40000 ALTER TABLE `DeviceTbl` DISABLE KEYS */;
INSERT INTO `DeviceTbl` VALUES ('38A28CEB32B5','Test001',3,'WAWA','',NULL,'24.7896211','121.0045206',1563866487,1563957637,1609459200),('409F38A78332','pppppppppppp',4,'WAWA','',NULL,'0','0',1563269254,1563957637,1609459200);
/*!40000 ALTER TABLE `DeviceTbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MessageTbl`
--

DROP TABLE IF EXISTS `MessageTbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MessageTbl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DevNo` char(12) DEFAULT NULL,
  `H60` int(11) DEFAULT NULL,
  `H61` int(11) DEFAULT NULL,
  `H62` int(11) DEFAULT NULL,
  `H63` int(11) DEFAULT NULL,
  `H64` int(11) DEFAULT NULL,
  `H65` int(11) DEFAULT NULL,
  `H66` int(11) DEFAULT NULL,
  `H67` int(11) DEFAULT NULL,
  `H68` int(11) DEFAULT NULL,
  `H69` int(11) DEFAULT NULL,
  `H6A` int(11) DEFAULT NULL,
  `H6B` int(11) DEFAULT NULL,
  `H6C` int(11) DEFAULT NULL,
  `H6D` int(11) DEFAULT NULL,
  `H6E` int(11) DEFAULT NULL,
  `H6F` int(11) DEFAULT NULL,
  `DateCode` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MessageTbl`
--

LOCK TABLES `MessageTbl` WRITE;
/*!40000 ALTER TABLE `MessageTbl` DISABLE KEYS */;
/*!40000 ALTER TABLE `MessageTbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PaymentTbl`
--

DROP TABLE IF EXISTS `PaymentTbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PaymentTbl` (
  `CardNo` char(128) NOT NULL,
  `AccountNo` int(11) DEFAULT NULL,
  `DevNo` int(11) DEFAULT NULL,
  `Used` tinyint(1) DEFAULT NULL,
  `PayDate` int(11) DEFAULT NULL,
  PRIMARY KEY (`CardNo`),
  UNIQUE KEY `CardNo` (`CardNo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PaymentTbl`
--

LOCK TABLES `PaymentTbl` WRITE;
/*!40000 ALTER TABLE `PaymentTbl` DISABLE KEYS */;
/*!40000 ALTER TABLE `PaymentTbl` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-07-24 17:30:26
