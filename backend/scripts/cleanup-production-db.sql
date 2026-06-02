-- ============================================================
-- AgocCare Production DB Cleanup
-- Removes all pending/test orders and their items
-- Run this in phpMyAdmin → SQL tab
-- ============================================================

-- Step 1: Delete order items for pending orders
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders WHERE status = 'pending'
);

-- Step 2: Delete pending orders
DELETE FROM orders WHERE status = 'pending';

-- Step 3: Verify result
SELECT
  status,
  COUNT(*) as count,
  SUM(total) as total_value
FROM orders
GROUP BY status;
