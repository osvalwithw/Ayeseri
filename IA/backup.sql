-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: ballast.proxy.rlwy.net    Database: Development
-- ------------------------------------------------------
-- Server version	9.4.0

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
-- Table structure for table `employee_errors`
--

DROP TABLE IF EXISTS `employee_errors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_errors` (
  `Numentry` int NOT NULL AUTO_INCREMENT,
  `ID_EE` int NOT NULL,
  `ID_Error` int NOT NULL,
  `Load_Date` varchar(40) COLLATE utf8mb4_general_ci NOT NULL,
  `Load_hour` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`Numentry`),
  KEY `fk_error` (`ID_Error`),
  CONSTRAINT `fk_error` FOREIGN KEY (`ID_Error`) REFERENCES `errors` (`IDX`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_errors`
--

LOCK TABLES `employee_errors` WRITE;
/*!40000 ALTER TABLE `employee_errors` DISABLE KEYS */;
INSERT INTO `employee_errors` VALUES (9,3309711,1,'2025-06-13','18:08:32'),(10,3309711,17,'2025-06-13','18:08:32'),(11,3309711,18,'2025-06-13','18:08:32'),(12,3309711,31,'2025-06-13','18:08:32'),(13,45489411,17,'2025-06-13','18:08:32'),(14,45489411,31,'2025-06-13','18:08:32'),(15,6846968,31,'2025-06-13','18:08:32'),(16,97824,87,'2025-07-31','07:40:35'),(17,97824,88,'2025-07-31','07:40:35'),(20,97824,87,'2025-07-31','16:03:36'),(21,97824,88,'2025-07-31','16:03:36'),(22,97824,89,'2025-07-31','16:03:36'),(23,789191,89,'2025-07-31','16:04:26');
/*!40000 ALTER TABLE `employee_errors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `errors`
--

DROP TABLE IF EXISTS `errors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `errors` (
  `IDX` int NOT NULL AUTO_INCREMENT,
  `Error_Message` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `ID_Infotype` int NOT NULL,
  PRIMARY KEY (`IDX`),
  KEY `fk_errors_infotype` (`ID_Infotype`),
  CONSTRAINT `fk_errors_infotype` FOREIGN KEY (`ID_Infotype`) REFERENCES `infotypes` (`Infotype_IND`)
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `errors`
--

LOCK TABLES `errors` WRITE;
/*!40000 ALTER TABLE `errors` DISABLE KEYS */;
INSERT INTO `errors` VALUES (1,'Formatting error in the field P0001-ANSVH',2),(2,'Formatting error in the field P0006-STRAS',4),(3,'Formatting error in the field P0006-ORT01',4),(4,'Formatting error in the field P0006-LAND1',4),(5,'Formatting error in the field Q0006-TELNR',4),(6,'Formating error in the field P0001-BTRTL ',2),(7,'Formating error in the field P0002-GBDAT',3),(8,'Formatting error in field  P0002-NACHN',3),(9,'Formatting error in the field P0007-SCHKZ',5),(10,'Formatting error in the field P0001-KOSTL',2),(11,'Formatting error in the field Q0002-FATXT',3),(12,'Formatting error in the field P0007-ENDDA',5),(13,'Postal code GHI must have length 5',3),(14,'Cost center does not exist',2),(15,'Cost center 0010/3211210 blocked against direct postings on 28.11.2018',2),(16,'Invalid combination of action type 1G/action reason',1),(17,'Invalid combination of action type 1A/action reason CA',1),(18,'Invalid combination of action type 1B/action reason',1),(19,'Person is already being processed by user Daily PEN Scheduler SCHED_D_PEN',9),(20,'ID/number 2298259 already used for Person number 01691680',1),(21,'ID/number JIANWEI_XIE@JABIL.COM already used for Person number 01366840 (sample data)',1),(22,'Do not enter a personnel action for the date of hiring/transfer',1),(23,'config issue: Formatting error in the field RP50G-EINDA',10),(24,'config issue: P0001-ZZWORKCENTER workcell missing',2),(25,'config issue: PA30 0016 No entry in table T545T for GK',10),(26,'config issue: PA40 1B No entry in table T710 for the key 420150 on 19.11.2018',10),(27,'No entry in table T528B for    S 52407005',10),(28,'No batch input data for screen MP000800 2010',9),(29,'Next pay scale increase is in the past',6),(30,'Enter an employee subgroup',2),(31,'Enter a personnel area',2),(32,'Payroll area change possible only at the end of a payroll period',2),(33,'PayrArea unchangeable for periods for which payroll has run',2),(34,'The CO account assignment object belongs to company code 0949, not 0902',2),(35,'The CO account assignment object belongs to company code 0301, not 2401',2),(36,'No work schedule rule for key 0103ZY3942TW020220191014',5),(37,'Employee active since 24.02.2019 (sample date)',1),(38,'Change before earliest retro. date 24.12.2017 acc. to control rec. to py area L0',2),(39,'Future Action exists, check status fields',1),(40,'PA40 1B No entry in table T503 for    XVA',10),(41,'Space not allowed.',2),(86,'No work schedule rule for key 0103ZY3932MX030320250707',5),(87,'Change before earliest retro. date 07/07/2025 acc. to control rec. to py area MG',2),(88,'Person is already being processed by user 1567916',9),(89,'No work schedule rule for key 0103ZY3932MX030320250708',5);
/*!40000 ALTER TABLE `errors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `infotypes`
--

DROP TABLE IF EXISTS `infotypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `infotypes` (
  `Infotype_IND` int NOT NULL AUTO_INCREMENT,
  `ID_Infotype` text COLLATE utf8mb4_general_ci NOT NULL,
  `IT_text` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`Infotype_IND`),
  UNIQUE KEY `Infotype_IND` (`Infotype_IND`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `infotypes`
--

LOCK TABLES `infotypes` WRITE;
/*!40000 ALTER TABLE `infotypes` DISABLE KEYS */;
INSERT INTO `infotypes` VALUES (1,'0000','Personal Actions'),(2,'0001','Organization structure'),(3,'0002','Personal information'),(4,'0006','Employee Addresses'),(5,'0007','Planned work time'),(6,'0008','Payment for employee'),(7,'0014','Recurring payments and deductions'),(8,'0015','One time payments and deductions'),(9,'NITR','No Infotype related'),(10,'CFGI','Configuration Issue'),(11,'2006','Absence balance');
/*!40000 ALTER TABLE `infotypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_infotype_map`
--

DROP TABLE IF EXISTS `temp_infotype_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_infotype_map` (
  `Error_Message` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ID_Infotype` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_infotype_map`
--

LOCK TABLES `temp_infotype_map` WRITE;
/*!40000 ALTER TABLE `temp_infotype_map` DISABLE KEYS */;
INSERT INTO `temp_infotype_map` VALUES ('Formatting error in the field P0001-ANSVH','0001'),('Formatting error in the field P0006-STRAS','0006'),('Formatting error in the field P0006-ORT01','0006'),('Formatting error in the field P0006-LAND1','0006'),('Formatting error in the field Q0006-TELNR','0006'),('Formating error in the field P0001-BTRTL?','0001'),('Formating error in the field P0002-GBDAT','0002'),('Formatting error in field ?P0002-NACHN','0002'),('Formatting error in the field P0007-SCHKZ','0007'),('Formatting error in the field P0001-KOSTL','0001'),('Formatting error in the field Q0002-FATXT','0002'),('Formatting error in the field P0007-ENDDA','0007'),('Postal code GHI must have length?5','0006'),('Cost center does not exist','0001'),('Cost center 0010/3211210 blocked against direct postings on 28.11.2018','0001'),('Invalid combination of action type 1G/action reason','0000'),('Invalid combination of action type 1A/action reason CA','0000'),('Invalid combination of action type 1B/action reason','0000'),('Person is already being processed by user ','NITR'),('ID/number 2298259 already used for Person number 01691680','0000'),('ID/number JIANWEI_XIE@JABIL.COM already used for Person number 01366840 (sample data)','0000'),('Do not enter a personnel action for the date of hiring/transfer','0000'),('config issue: Formatting error in the field RP50G-EINDA','CFGI'),('config issue: P0001-ZZWORKCENTER workcell missing','0001'),('config issue: PA30 0016 No entry in table T545T for GK','CFGI'),('config issue: PA40 1B No entry in table T710 for the key?420150?on 19.11.2018','CFGI'),('No entry in table T528B for    S 52407005','CFGI'),('No batch input data for screen MP000800 2010','NITR'),('Next pay scale increase is in the past','0008'),('Enter an employee subgroup','0001'),('Enter a personnel area','0001'),('Payroll area change possible only at the end of a payroll period','0001'),('PayrArea unchangeable for periods for which payroll has run','0001'),('The CO account assignment object belongs to company code 0949, not 0902','0001'),('The CO account assignment object belongs to company code 0301, not 2401','0001'),('No work schedule rule for key 0103ZY3942TW020220191014','0007'),('Employee active since 24.02.2019 (sample date)','0000'),('Change before earliest retro. date 24.12.2017 acc. to control rec. to py area L0','0001'),('Future Action exists, check status fields','0000'),('PA40 1B No entry in table T503 for    XVA','CFGI'),('Space not allowed.','0001');
/*!40000 ALTER TABLE `temp_infotype_map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-10 15:02:34
