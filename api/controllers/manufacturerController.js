const Manufacturer = require('../models/Manufacturer');

const manufacturerController = {
  createManufacturer: async (req, res) => {
    try {
      const { manufacturerName, contactPerson, email, phoneNumber, productCategory, topProducts, marketShare, salesTrend, regions } = req.body;
      const userId = req.user.userId;

      const newManufacturer = new Manufacturer({
        manufacturerName,
        contactPerson,
        email,
        phoneNumber,
        productCategory,
        topProducts,
        marketShare,
        salesTrend,
        regions,
        userId,
      });

      const savedManufacturer = await newManufacturer.save();
      res.status(201).json(savedManufacturer);
    } catch (error) {
      console.error('Error creating manufacturer:', error);
      res.status(500).json({ error: 'Failed to create manufacturer' });
    }
  },

  getManufacturerDashboardData: async (req, res) => {
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
        regions: manufacturer.regions,
      });
    } catch (error) {
      console.error('Error fetching manufacturer data:', error);
      res.status(500).json({ error: 'Failed to fetch manufacturer data' });
    }
  },
};

module.exports = manufacturerController;
