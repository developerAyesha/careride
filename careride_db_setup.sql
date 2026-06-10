-- --------------------------------------------------------
-- CareRide Database Setup
-- MySQL 5.7 | Run this file to create all tables
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `careride_db` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `careride_db`;

CREATE TABLE IF NOT EXISTS `car_city` (
  `car_id` int(10) unsigned NOT NULL,
  `city_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`car_id`,`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `car_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `block` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `vendor_id` int(10) unsigned NOT NULL,
  `busy` int(10) unsigned NOT NULL DEFAULT '0',
  `model` varchar(64) NOT NULL DEFAULT '',
  `plate` varchar(32) NOT NULL DEFAULT '',
  `color` varchar(32) NOT NULL DEFAULT '',
  `cartype` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `city` varchar(64) NOT NULL DEFAULT '',
  `city_id` int(10) unsigned NOT NULL,
  `city_radius` int(10) unsigned NOT NULL DEFAULT '0',
  `pricemile` decimal(8,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `car_inf_vendor_id_index` (`vendor_id`),
  KEY `car_inf_city_id_index` (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `cities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` int(10) unsigned NOT NULL DEFAULT '0',
  `title` varchar(64) NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cities_code_index` (`code`),
  KEY `cities_title_index` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=14860 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `driver_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(32) NOT NULL,
  `passw` varchar(64) NOT NULL DEFAULT '',
  `vendor_id` int(10) unsigned NOT NULL,
  `busy` int(10) unsigned NOT NULL DEFAULT '0',
  `block` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `first_name` varchar(64) NOT NULL DEFAULT '',
  `second_name` varchar(64) NOT NULL DEFAULT '',
  `last_name` varchar(64) NOT NULL DEFAULT '',
  `email` varchar(64) NOT NULL DEFAULT '',
  `avatar` varchar(64) NOT NULL DEFAULT '',
  `city` varchar(32) NOT NULL DEFAULT '',
  `license` varchar(32) NOT NULL DEFAULT '',
  `lastorder_id` int(10) unsigned NOT NULL DEFAULT '0',
  `rang` decimal(4,2) NOT NULL DEFAULT '0.00',
  `token` char(128) NOT NULL DEFAULT '',
  `lastAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `driver_inf_login_unique` (`login`),
  KEY `driver_inf_vendor_id_index` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=308 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `order_chg` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `status_from` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `status_to` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `who_id` int(10) unsigned NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_chg_vendor_id_index` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `order_hist` (
  `id` int(10) unsigned NOT NULL,
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `client_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `car_id` int(10) unsigned NOT NULL,
  `driver_id` int(10) unsigned NOT NULL,
  `pfrom_addr` varchar(128) NOT NULL DEFAULT '',
  `pfrom_city` varchar(64) NOT NULL DEFAULT '',
  `pfrom_city_id` int(10) unsigned NOT NULL,
  `pto_addr` varchar(128) NOT NULL DEFAULT '',
  `pto_city` varchar(64) NOT NULL DEFAULT '',
  `pto_city_id` int(10) unsigned NOT NULL,
  `p_dat` text NOT NULL,
  `distance` decimal(6,2) NOT NULL DEFAULT '0.00',
  `price` decimal(6,2) NOT NULL DEFAULT '0.00',
  `whoride` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `cartype` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `weight` decimal(6,2) NOT NULL DEFAULT '0.00',
  `height` decimal(6,2) NOT NULL DEFAULT '0.00',
  `gender` varchar(1) NOT NULL DEFAULT '',
  `datebirth` int(10) unsigned NOT NULL,
  `wheelchair` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `escort` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `covtst` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `rate` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `roundtrip` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `services` int(10) unsigned NOT NULL,
  `overtime` varchar(250) NOT NULL DEFAULT '',
  `contact` varchar(16) NOT NULL DEFAULT '',
  `contact_first` varchar(64) NOT NULL DEFAULT '',
  `contact_last` varchar(64) NOT NULL DEFAULT '',
  `contact_phone` varchar(16) NOT NULL DEFAULT '',
  `instruction` text NOT NULL,
  `reason` varchar(120) NOT NULL DEFAULT '',
  `pricemk` varchar(250) NOT NULL DEFAULT '',
  `utc_offset` int(11) NOT NULL DEFAULT '0',
  `orderAt` datetime DEFAULT NULL,
  `acceptedAt` datetime DEFAULT NULL,
  `payAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_hist_client_id_index` (`client_id`),
  KEY `order_hist_vendor_id_index` (`vendor_id`),
  KEY `order_hist_driver_id_index` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `order_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `client_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  `car_id` int(10) unsigned NOT NULL,
  `driver_id` int(10) unsigned NOT NULL,
  `pfrom_addr` varchar(128) NOT NULL DEFAULT '',
  `pfrom_city` varchar(64) NOT NULL DEFAULT '',
  `pfrom_city_id` int(10) unsigned NOT NULL,
  `pto_addr` varchar(128) NOT NULL DEFAULT '',
  `pto_city` varchar(64) NOT NULL DEFAULT '',
  `pto_city_id` int(10) unsigned NOT NULL,
  `p_dat` text NOT NULL,
  `distance` decimal(6,2) NOT NULL DEFAULT '0.00',
  `price` decimal(6,2) NOT NULL DEFAULT '0.00',
  `whoride` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `cartype` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `weight` decimal(6,2) NOT NULL DEFAULT '0.00',
  `height` decimal(6,2) NOT NULL DEFAULT '0.00',
  `gender` varchar(1) NOT NULL DEFAULT '',
  `datebirth` int(10) unsigned NOT NULL,
  `wheelchair` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `escort` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `covtst` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `rate` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `roundtrip` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `services` int(10) unsigned NOT NULL,
  `overtime` varchar(250) NOT NULL DEFAULT '',
  `contact` varchar(16) NOT NULL DEFAULT '',
  `contact_first` varchar(64) NOT NULL DEFAULT '',
  `contact_last` varchar(64) NOT NULL DEFAULT '',
  `contact_phone` varchar(16) NOT NULL DEFAULT '',
  `instruction` text NOT NULL,
  `reason` varchar(120) NOT NULL DEFAULT '',
  `pricemk` varchar(250) NOT NULL DEFAULT '',
  `utc_offset` int(11) NOT NULL DEFAULT '0',
  `orderAt` datetime DEFAULT NULL,
  `acceptedAt` datetime DEFAULT NULL,
  `payAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_inf_client_id_index` (`client_id`),
  KEY `order_inf_vendor_id_index` (`vendor_id`),
  KEY `order_inf_driver_id_index` (`driver_id`)
) ENGINE=InnoDB AUTO_INCREMENT=841 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `order_preset` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL DEFAULT '0',
  `title` varchar(64) NOT NULL DEFAULT '',
  `whoride` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `cartype` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `weight` decimal(6,2) NOT NULL DEFAULT '0.00',
  `height` decimal(6,2) NOT NULL DEFAULT '0.00',
  `gender` varchar(1) NOT NULL DEFAULT '',
  `datebirth` int(10) unsigned NOT NULL DEFAULT '0',
  `wheelchair` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `escort` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `services` int(10) unsigned NOT NULL DEFAULT '0',
  `contact` varchar(16) NOT NULL DEFAULT '',
  `instruction` text NOT NULL,
  `reason` varchar(64) NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_preset_client_id_index` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `order_vendor` (
  `order_id` int(10) unsigned NOT NULL,
  `vendor_id` int(10) unsigned NOT NULL,
  KEY `order_vendor_vendor_id_index` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pay_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) unsigned NOT NULL DEFAULT '0',
  `client_id` int(10) unsigned NOT NULL,
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `holded` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `payment_id` varchar(64) NOT NULL DEFAULT '',
  `amount` int(10) unsigned NOT NULL DEFAULT '0',
  `token` varchar(128) NOT NULL DEFAULT '',
  `paiment_tx` varchar(128) NOT NULL DEFAULT '',
  `detail` text NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pay_inf_order_id_index` (`order_id`),
  KEY `pay_inf_payment_id_index` (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=665 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `staff_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(32) NOT NULL,
  `passw` varchar(64) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `email` varchar(64) NOT NULL DEFAULT '',
  `phone` varchar(32) NOT NULL DEFAULT '',
  `role` char(2) NOT NULL DEFAULT '',
  `block` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `gid` int(10) unsigned NOT NULL DEFAULT '0',
  `avatar` varchar(64) NOT NULL DEFAULT '',
  `language` char(2) NOT NULL DEFAULT '',
  `token` char(128) NOT NULL DEFAULT '',
  `lastAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_inf_login_unique` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `user_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(32) NOT NULL,
  `passw` varchar(64) NOT NULL DEFAULT '',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `block` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `activated` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `company_name` varchar(64) NOT NULL DEFAULT '',
  `first_name` varchar(64) NOT NULL DEFAULT '',
  `second_name` varchar(64) NOT NULL DEFAULT '',
  `last_name` varchar(64) NOT NULL DEFAULT '',
  `email` varchar(64) NOT NULL DEFAULT '',
  `avatar` varchar(64) NOT NULL DEFAULT '',
  `address` varchar(64) NOT NULL DEFAULT '',
  `city` varchar(32) NOT NULL DEFAULT '',
  `state` varchar(4) NOT NULL DEFAULT '',
  `zipcode` int(10) unsigned NOT NULL DEFAULT '0',
  `datebirth` int(10) unsigned NOT NULL DEFAULT '0',
  `gender` varchar(1) NOT NULL DEFAULT '',
  `facility_name` varchar(32) NOT NULL DEFAULT '',
  `lastorder_id` int(10) unsigned NOT NULL DEFAULT '0',
  `rang` decimal(4,2) NOT NULL DEFAULT '0.00',
  `token` char(128) NOT NULL DEFAULT '',
  `lastAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_inf_login_unique` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=2364 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `user_order` (
  `client_id` int(10) unsigned NOT NULL,
  `order_id` int(10) unsigned NOT NULL DEFAULT '0',
  KEY `user_order_client_id_index` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `vendor_inf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(32) NOT NULL,
  `passw` varchar(64) NOT NULL DEFAULT '',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `block` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `company_name` varchar(64) NOT NULL DEFAULT '',
  `first_name` varchar(64) NOT NULL DEFAULT '',
  `second_name` varchar(64) NOT NULL DEFAULT '',
  `last_name` varchar(64) NOT NULL DEFAULT '',
  `email` varchar(64) NOT NULL DEFAULT '',
  `avatar` varchar(64) NOT NULL DEFAULT '',
  `address` varchar(64) NOT NULL DEFAULT '',
  `city` varchar(32) NOT NULL DEFAULT '',
  `state` varchar(4) NOT NULL DEFAULT '',
  `zipcode` int(10) unsigned NOT NULL DEFAULT '0',
  `license` varchar(160) NOT NULL DEFAULT '',
  `costmt1` decimal(6,2) NOT NULL DEFAULT '0.00',
  `costmt2` decimal(6,2) NOT NULL DEFAULT '0.00',
  `baseprice1` decimal(6,2) NOT NULL DEFAULT '0.50',
  `baseprice2` decimal(6,2) NOT NULL DEFAULT '0.50',
  `services` int(10) unsigned NOT NULL DEFAULT '0',
  `car_count` varchar(4) NOT NULL DEFAULT '',
  `car_free` int(10) unsigned NOT NULL DEFAULT '0',
  `driver_count` varchar(4) NOT NULL DEFAULT '',
  `driver_free` int(10) unsigned NOT NULL DEFAULT '0',
  `token` char(128) NOT NULL DEFAULT '',
  `approveAt` datetime DEFAULT NULL,
  `lastAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_inf_login_unique` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `vendor_overt` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vendor_id` int(10) unsigned DEFAULT NULL,
  `timefrom` int(10) unsigned NOT NULL DEFAULT '0',
  `timeto` int(10) unsigned NOT NULL DEFAULT '0',
  `price` decimal(6,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_overt_vendor_id_index` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=488 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `vendor_srvc` (
  `vendor_id` int(10) unsigned NOT NULL,
  `service_id` int(10) unsigned NOT NULL,
  `price` decimal(6,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`vendor_id`,`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `vendor_stripe` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `acc_complete` int(10) unsigned NOT NULL DEFAULT '0',
  `acc_id` varchar(64) NOT NULL DEFAULT '',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=195 DEFAULT CHARSET=utf8;
