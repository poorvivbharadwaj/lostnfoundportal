const express = require('express');
const router = express.Router();
const { FoundItem, LostItem } = require('../models');
const { upload, uploadToCloudinary } = require('../middleware/cloudinary');
const { detectCategory, findMatches } = require('../middleware/aiMatching');
const { sendMatchEmail } = require('../middleware/email');

// GET /api/found
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { approved: true };
    if (category && category !== 'all') filter.category = category;

    const items = await FoundItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await FoundItem.countDocuments(filter);
    res.json({ success: true, items, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/found/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/found
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { finderName, description, category: manualCategory } = req.body;

    if (!finderName || !description) {
      return res.status(400).json({ success: false, message: 'Finder name and description are required.' });
    }

    const category = manualCategory || detectCategory('', description);

    const itemData = {
      finderName,
      description,
      category,
      foundLocation: 'Room No 405',
      contactEmail: process.env.FOUND_CONTACT_EMAIL || 'lostfound@college.edu',
      contactPhone: process.env.FOUND_CONTACT_PHONE || '+91-9876543210',
      foundDate: new Date(),
      approved: false,
    };

    // Upload image if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        itemData.imageUrl = result.secure_url;
        itemData.imagePublicId = result.public_id;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError.message);
        // Continue without image
      }
    }

    const foundItem = new FoundItem(itemData);
    await foundItem.save();

    // AUTO MATCHING
    try {
      const approvedLostItems = await LostItem.find({ approved: true, matched: false });
      const matches = await findMatches(foundItem, approvedLostItems, 'found');

      if (matches.length > 0 && matches[0].score >= 40) {
        const bestMatch = matches[0];
        await FoundItem.findByIdAndUpdate(foundItem._id, {
          matched: true,
          matchedWith: bestMatch.item._id
        });
        await LostItem.findByIdAndUpdate(bestMatch.item._id, {
          matched: true,
          matchedWith: foundItem._id
        });

        if (bestMatch.item.email) {
          await sendMatchEmail(bestMatch.item.email, bestMatch.item.itemName, foundItem.description);
        }

        return res.status(201).json({
          success: true,
          message: 'Found item reported! A potential match was found and the owner has been notified.',
          item: foundItem,
          potentialMatch: { itemName: bestMatch.item.itemName, score: bestMatch.score }
        });
      }
    } catch (matchError) {
      console.error('Matching error:', matchError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Found item reported successfully! It will be visible after admin approval.',
      item: foundItem
    });
  } catch (error) {
    console.error('Found item post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/found/:id
router.delete('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;