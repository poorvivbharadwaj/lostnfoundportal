const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const { LostItem, FoundItem } = require('../models');

// GET /api/search?q=wallet&category=electronics&type=lost
router.get('/', async (req, res) => {
  try {
    const { q, category, type, dateFrom, dateTo } = req.query;

    const baseFilter = { approved: true };
    if (category && category !== 'all') baseFilter.category = category;

    let lostItems = [], foundItems = [];

    if (type !== 'found') {
      const lostFilter = { ...baseFilter };
      if (dateFrom) lostFilter.lostDate = { $gte: new Date(dateFrom) };
      if (dateTo) lostFilter.lostDate = { ...lostFilter.lostDate, $lte: new Date(dateTo) };
      lostItems = await LostItem.find(lostFilter).sort({ createdAt: -1 }).limit(100);
    }

    if (type !== 'lost') {
      const foundFilter = { ...baseFilter };
      if (dateFrom) foundFilter.foundDate = { $gte: new Date(dateFrom) };
      if (dateTo) foundFilter.foundDate = { ...foundFilter.foundDate, $lte: new Date(dateTo) };
      foundItems = await FoundItem.find(foundFilter).sort({ createdAt: -1 }).limit(100);
    }

    // Apply Fuse.js search if query is provided
    if (q && q.trim()) {
      const fuseLostOptions = {
        keys: ['itemName', 'description', 'reporterName'],
        threshold: 0.4,
        includeScore: true,
      };
      const fuseFoundOptions = {
        keys: ['description', 'finderName'],
        threshold: 0.4,
        includeScore: true,
      };

      if (lostItems.length > 0) {
        const fuse = new Fuse(lostItems, fuseLostOptions);
        lostItems = fuse.search(q).map(r => r.item);
      }

      if (foundItems.length > 0) {
        const fuse = new Fuse(foundItems, fuseFoundOptions);
        foundItems = fuse.search(q).map(r => r.item);
      }
    }

    res.json({ success: true, lostItems, foundItems, total: lostItems.length + foundItems.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
