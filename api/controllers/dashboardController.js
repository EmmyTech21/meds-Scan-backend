const Manufacturer = require('../models/Manufacturer');

const dashboardController = {
  getDashboardData: async (req, res) => {
    try {
      const userId = req.user.userId;
      const manufacturer = await Manufacturer.findOne({ userId });

      if (!manufacturer) {
        return res.status(404).json({ error: 'No data found for this manufacturer' });
      }

      res.json({
        salesTrend: manufacturer.salesTrend,
        marketShare: manufacturer.marketShare,
        topProducts: manufacturer.topProducts,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  },
};

module.exports = dashboardController;
