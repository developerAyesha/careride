-- --------------------------------------------------------
-- CareRide Test Data Seed
-- Run AFTER careride_db_setup.sql
-- Password for ALL accounts below: Test1234
-- --------------------------------------------------------

USE `careride_db`;

-- ── 1. Admin / Staff user ──────────────────────────────
-- Login: admin | Password: Test1234 | Role: a (admin)
INSERT INTO `staff_inf`
  (`login`, `passw`, `name`, `email`, `role`, `block`, `gid`, `token`, `createdAt`, `updatedAt`)
VALUES
  ('admin', '$2b$10$bZlYdDVNH69RWXR3IK919OvIhQo2s0kEdSgchWENtGn5GKThKwn3i',
   'Admin User', 'admin@careride.com', 'a', 0, 0, 'admintoken001', NOW(), NOW());


-- ── 2. Client user (for booking ride flow) ─────────────
-- Login: 19493450213  | Password: Test1234
-- Login must start with 1 or 3 and be 10+ chars (US phone format)
INSERT INTO `user_inf`
  (`login`, `passw`, `status`, `block`, `activated`,
   `first_name`, `last_name`, `email`,
   `token`, `createdAt`, `updatedAt`)
VALUES
  ('19493450213',
   '$2b$10$bZlYdDVNH69RWXR3IK919OvIhQo2s0kEdSgchWENtGn5GKThKwn3i',
   0, 0, 1,
   'Test', 'Client', 'testclient@careride.com',
   'clienttoken001', NOW(), NOW());


-- ── 3. Test Vendor (needed for Dev Force-Match in step 4) ──
-- Login: testvendor1 | Password: Test1234 | Status: 1 (approved)
INSERT INTO `vendor_inf`
  (`login`, `passw`, `status`, `block`,
   `company_name`, `first_name`, `last_name`, `email`,
   `costmt1`, `costmt2`, `baseprice1`, `baseprice2`,
   `services`, `token`, `createdAt`, `updatedAt`)
VALUES
  ('testvendor1',
   '$2b$10$bZlYdDVNH69RWXR3IK919OvIhQo2s0kEdSgchWENtGn5GKThKwn3i',
   1, 0,
   'Test Transport Co', 'Vendor', 'Test', 'vendor@careride.com',
   0.00, 0.00, 0.50, 0.50,
   0, 'vendortoken001', NOW(), NOW());


-- ── 4. Test Car for the vendor (needed for Dev Force-Match) ──
-- cartype 1 = Wheelchair, cartype 2 = Gurney
INSERT INTO `car_inf`
  (`block`, `vendor_id`, `busy`, `model`, `plate`, `color`,
   `cartype`, `city`, `city_id`, `city_radius`, `pricemile`,
   `createdAt`, `updatedAt`)
VALUES
  (0, LAST_INSERT_ID(), 0, 'Toyota Sienna', 'TEST-001', 'White',
   1, 'Los Angeles', 1, 100, 3.50,
   NOW(), NOW());


-- ── 5. Vendor Stripe record (required to avoid stripe errors) ──
INSERT INTO `vendor_stripe`
  (`acc_complete`, `acc_id`, `createdAt`, `updatedAt`)
VALUES
  (0, '', NOW(), NOW());
