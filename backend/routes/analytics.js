const router = require('express').Router();
const db     = require('../models/db');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/', async (req, res) => {
  try {
    // Revenue last 7 days
    const [revenueByDay] = await db.query(`
      SELECT DATE(created_at) as date,
             COALESCE(SUM(total),0) as revenue,
             COUNT(*) as orders
      FROM orders
      WHERE status = 'paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`);

    // Orders by status
    const [ordersByStatus] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM orders GROUP BY status`);

    // Top selling products
    const [topProducts] = await db.query(`
      SELECT p.name, SUM(oi.qty) as sold, SUM(oi.qty * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY p.id ORDER BY sold DESC LIMIT 5`);

    // Sales by category
    const [byCategory] = await db.query(`
      SELECT c.name as category, SUM(oi.qty) as sold, SUM(oi.qty * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY c.id ORDER BY revenue DESC`);

    // Monthly revenue (last 6 months)
    const [monthly] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%b %Y') as month,
             COALESCE(SUM(total),0) as revenue,
             COUNT(*) as orders
      FROM orders
      WHERE status = 'paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY MIN(created_at) ASC`);

    // Summary KPIs
    const [[kpi]] = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status='paid' THEN total END),0) as total_revenue,
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status='paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status='cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(AVG(CASE WHEN status='paid' THEN total END),0) as avg_order_value,
        COUNT(CASE WHEN DATE(created_at)=CURDATE() THEN 1 END) as today_orders
      FROM orders`);

    const [[newUsers]] = await db.query(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND role='user'`);

    // Fill missing days in last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found   = revenueByDay.find(r => r.date?.toISOString?.()?.split('T')[0] === dateStr || r.date === dateStr);
      days.push({ date: d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }), revenue: Number(found?.revenue || 0), orders: Number(found?.orders || 0) });
    }

    res.json({
      kpi: { ...kpi, new_users: newUsers.count },
      revenueByDay: days,
      ordersByStatus: ordersByStatus.map(r => ({ name: r.status, value: Number(r.count) })),
      topProducts:   topProducts.map(r => ({ ...r, sold: Number(r.sold), revenue: Number(r.revenue) })),
      byCategory:    byCategory.map(r => ({ ...r, sold: Number(r.sold), revenue: Number(r.revenue) })),
      monthly:       monthly.map(r => ({ ...r, revenue: Number(r.revenue), orders: Number(r.orders) })),
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ message: 'Analytics failed' });
  }
});

module.exports = router;
