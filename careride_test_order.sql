-- ─────────────────────────────────────────────────────────────
-- CareRide — Test Order Seed  (run AFTER careride_seed_testdata.sql)
-- Creates one ACCEPTED order (status=1) so Step 4 → 5 → payment
-- can be tested end-to-end with Stripe test mode.
-- ─────────────────────────────────────────────────────────────

USE `careride_db`;

-- Compute a safe new order ID (max across both tables + 1)
SET @new_order_id = (
  SELECT GREATEST(
    COALESCE((SELECT MAX(id) FROM order_inf),  0),
    COALESCE((SELECT MAX(id) FROM order_hist), 0)
  ) + 1
);

-- Resolve IDs from seed accounts
SET @client_id = (SELECT id FROM user_inf  WHERE login = '19493450213' LIMIT 1);
SET @vendor_id = (SELECT id FROM vendor_inf WHERE login = 'testvendor1' LIMIT 1);
SET @car_id    = (SELECT id FROM car_inf   WHERE vendor_id = @vendor_id AND block = 0 LIMIT 1);

-- Insert accepted order (status=1, price=$150, pickup 3 days from now)
INSERT INTO `order_inf` (
  `id`, `status`,
  `client_id`, `vendor_id`, `car_id`, `driver_id`,
  `pfrom_addr`,   `pfrom_city`,  `pfrom_city_id`,
  `pto_addr`,     `pto_city`,    `pto_city_id`,
  `p_dat`,
  `distance`, `price`,
  `whoride`, `cartype`, `weight`, `height`,
  `gender`, `datebirth`, `wheelchair`, `escort`, `covtst`, `roundtrip`,
  `services`, `overtime`,
  `contact`, `contact_first`, `contact_last`, `contact_phone`,
  `instruction`, `reason`, `pricemk`,
  `utc_offset`,
  `orderAt`, `acceptedAt`, `createdAt`, `updatedAt`
) VALUES (
  @new_order_id, 1,
  @client_id, @vendor_id, @car_id, 0,
  '123 Main St, Los Angeles, CA 90001', 'Los Angeles', 0,
  '456 Oak Ave, Los Angeles, CA 90002', 'Los Angeles', 0,
  '{}',
  25.00, 150.00,
  0, 1, 150, 66,
  '', 0, 0, 0, 0, 0,
  0, '{}',
  '9493450213', 'Test', 'Client', '9493450213',
  'Please ring doorbell on arrival.', '', '{"pricem":"3.50","costm":"87.50","baseprice":"0.50","commission":"8.80","total":"96.80","payout":"88.00"}',
  0,
  DATE_ADD(NOW(), INTERVAL 3 DAY), NOW(), NOW(), NOW()
);

-- Link to client in user_order so getLastOrders() finds it
INSERT INTO `user_order` (`client_id`, `order_id`)
VALUES (@client_id, @new_order_id);

-- ── Show result ───────────────────────────────────────────────
SELECT
  @new_order_id AS `test_order_id`,
  @client_id    AS `client_id`,
  @vendor_id    AS `vendor_id`,
  @car_id       AS `car_id`,
  CONCAT('Login: 19493450213  |  Password: Test1234') AS `login_creds`,
  CONCAT('/ride/step-4?id=', @new_order_id) AS `step4_url`,
  CONCAT('/ride/step-5?id=', @new_order_id) AS `step5_url`;
