import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [revenue, ordersToday, pendingOrders, lowStockProducts] = await Promise.all([
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({
      createdAt: { $gte: startOfToday, $lt: startOfTomorrow },
    }),
    Order.countDocuments({ status: 'pending' }),
    Product.countDocuments({ stock: { $lt: 5 } }),
  ]);

  res.json({
    totalRevenue: revenue[0]?.total || 0,
    ordersToday,
    pendingOrders,
    lowStockProducts,
  });
});
