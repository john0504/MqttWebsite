-- MySQL dump 10.13  Distrib 5.7.26, for Linux (x86_64)
--
-- Host: localhost    Database: mqtt_DB
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
-- Table structure for table `mqtt_client`
--

DROP TABLE IF EXISTS `mqtt_client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mqtt_client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `totalmoney` int(11) DEFAULT NULL,
  `totalgift` int(11) DEFAULT NULL,
  `money` int(11) DEFAULT NULL,
  `gift` int(11) DEFAULT NULL,
  `serial` varchar(127) DEFAULT NULL,
  `date` varchar(127) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mqtt_client`
--

LOCK TABLES `mqtt_client` WRITE;
/*!40000 ALTER TABLE `mqtt_client` DISABLE KEYS */;
INSERT INTO `mqtt_client` VALUES (23,2,2,2,2,'Capsule_999','1557902472324'),(24,2,2,2,2,'Capsule_998','1557902500607'),(25,2,3,2,3,'Capsule_998','1557902529498'),(26,3,3,2,2,'Capsule_997','1557902586001'),(27,3,3,2,2,'Capsule_997','1557907637246'),(28,3,3,3,3,'Capsule_998','1558574585729'),(29,3,4,3,4,'Capsule_998','1558581020506'),(30,4,4,4,4,'Capsule_998','1558588118102'),(31,4,5,4,5,'Capsule_998','1558588276537'),(32,5,5,5,5,'Capsule_998','1558588814450'),(33,6,5,6,5,'Capsule_998','1558935749803'),(34,6,6,6,6,'Capsule_998','1558935939124'),(35,7,6,7,6,'Capsule_998','1558939969541'),(36,8,6,8,6,'Capsule_998','1561708588223'),(37,8,7,8,7,'Capsule_998','1561708791101'),(38,9,7,9,7,'Capsule_998','1561709074953'),(39,10,7,10,7,'Capsule_998','1561709261376'),(40,11,7,11,7,'Capsule_998','1561709396726'),(41,12,7,12,7,'Capsule_998','1561709480645'),(42,13,7,13,7,'Capsule_998','1561709744502'),(43,14,7,14,7,'Capsule_998','1561709853199'),(44,15,7,15,7,'Capsule_998','1561709873758'),(45,15,8,15,8,'Capsule_998','1561709893245'),(46,17,8,17,8,'Capsule_998','1561710513402'),(47,19,8,19,8,'Capsule_998','1561710925137'),(48,19,9,19,9,'Capsule_998','1561710947512'),(49,20,9,20,9,'Capsule_998','1562035122485'),(50,20,9,20,9,'Capsule_995','1562050774364'),(51,23,9,23,9,'Capsule_998','1562231656203'),(52,24,9,24,9,'Capsule_998','1562305308520');
/*!40000 ALTER TABLE `mqtt_client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mqtt_machine`
--

DROP TABLE IF EXISTS `mqtt_machine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mqtt_machine` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(127) CHARACTER SET utf8 DEFAULT NULL,
  `serial` varchar(127) NOT NULL,
  `account` varchar(127) DEFAULT NULL,
  `ownerid` int(11) DEFAULT NULL,
  `storeid` int(11) DEFAULT NULL,
  `type` varchar(127) DEFAULT NULL,
  `bank` int(11) NOT NULL DEFAULT '0',
  `money` int(11) DEFAULT NULL,
  `totalmoney` int(11) DEFAULT NULL,
  `gift` int(11) DEFAULT NULL,
  `totalgift` int(11) DEFAULT NULL,
  `lat` varchar(15) DEFAULT NULL,
  `lng` varchar(15) DEFAULT NULL,
  `createdate` varchar(127) DEFAULT NULL,
  `updatedate` varchar(127) DEFAULT NULL,
  `expiredate` varchar(127) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sn` (`serial`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mqtt_machine`
--

LOCK TABLES `mqtt_machine` WRITE;
/*!40000 ALTER TABLE `mqtt_machine` DISABLE KEYS */;
INSERT INTO `mqtt_machine` VALUES (18,'機台1','Capsule_999','tywu@cectco.com',1,2,'EFAN_Capsule_001',0,0,2,3,2,'121.5061567','25.0436255','1557902472372',NULL,NULL),(19,'機台2','Capsule_998','tywu@cectco.com',1,2,'EFAN_Capsule_001',5,24,24,9,9,'121.5253001','25.0871996','1557902500688','1562307842323',NULL),(21,'機台3','Capsule_997','test2',4,3,'EFAN_Capsule_001',0,2,3,2,3,'121.5052828','25.0444418','1557902586042','1557907637991',NULL),(23,'機台2','Capsule_995',NULL,NULL,NULL,'EFAN_Capsule_001',0,20,20,9,9,'25.0871996','121.5253001','1562050774386',NULL,NULL);
/*!40000 ALTER TABLE `mqtt_machine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mqtt_payment`
--

DROP TABLE IF EXISTS `mqtt_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mqtt_payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(127) DEFAULT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `account` varchar(127) DEFAULT NULL,
  `serial` varchar(127) DEFAULT NULL,
  `createdate` varchar(127) DEFAULT NULL,
  `paydate` varchar(127) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mqtt_payment`
--

LOCK TABLES `mqtt_payment` WRITE;
/*!40000 ALTER TABLE `mqtt_payment` DISABLE KEYS */;
INSERT INTO `mqtt_payment` VALUES (2,'AC00000001',0,NULL,NULL,'1561628335205',NULL);
/*!40000 ALTER TABLE `mqtt_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mqtt_server`
--

DROP TABLE IF EXISTS `mqtt_server`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mqtt_server` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `log` varchar(255) NOT NULL,
  `date` varchar(127) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mqtt_server`
--

LOCK TABLES `mqtt_server` WRITE;
/*!40000 ALTER TABLE `mqtt_server` DISABLE KEYS */;
INSERT INTO `mqtt_server` VALUES (1,'Hello World!','1556867651085'),(2,'Hello World!','1556867796747'),(3,'hello world!','1556870461566'),(4,'hello!','1556870494666');
/*!40000 ALTER TABLE `mqtt_server` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mqtt_store`
--

DROP TABLE IF EXISTS `mqtt_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mqtt_store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(127) DEFAULT NULL,
  `account` varchar(127) DEFAULT NULL,
  `ownerid` int(11) DEFAULT NULL,
  `area` varchar(127) DEFAULT NULL,
  `lat` varchar(15) DEFAULT NULL,
  `lng` varchar(15) DEFAULT NULL,
  `address` varchar(127) DEFAULT NULL,
  `createdate` varchar(127) CHARACTER SET latin1 DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mqtt_store`
--

LOCK TABLES `mqtt_store` WRITE;
/*!40000 ALTER TABLE `mqtt_store` DISABLE KEYS */;
INSERT INTO `mqtt_store` VALUES (2,'店舖1','tywu@cectco.com',1,'新竹','121.0045282','24.7896018','大學路21號','1558426010464',1),(3,'店舖2','test',4,'新竹','121.5052828','25.0444418','大學路21號','1558428959029',1);
/*!40000 ALTER TABLE `mqtt_store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mqtt_user`
--

DROP TABLE IF EXISTS `mqtt_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mqtt_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(127) CHARACTER SET latin1 NOT NULL,
  `password` varchar(127) CHARACTER SET latin1 NOT NULL,
  `name` varchar(127) DEFAULT NULL,
  `createdate` varchar(127) CHARACTER SET latin1 DEFAULT NULL,
  `enable` tinyint(1) NOT NULL DEFAULT '1',
  `superuser` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `userid` (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mqtt_user`
--

LOCK TABLES `mqtt_user` WRITE;
/*!40000 ALTER TABLE `mqtt_user` DISABLE KEYS */;
INSERT INTO `mqtt_user` VALUES (1,'tywu','12345678','管理員','1558418968000',1,1),(4,'test','1234','顧客1','1558420506557',1,0),(5,'test3','1234','顧客3','1560222570683',1,0),(6,'test2','1234','測試2','1560229467022',1,0),(7,'test999','12345678','test999','1560323002533',1,0),(9,'tywu@cectco.com','12345678','tywu@cectco.com','1562224050710',1,0),(10,'cect','Cectco123@','admin','1558418968000',1,1);
/*!40000 ALTER TABLE `mqtt_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-07-09 16:07:25
