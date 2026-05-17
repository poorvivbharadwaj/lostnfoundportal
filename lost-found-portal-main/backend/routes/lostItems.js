const express = require('express');
const router = express.Router();
const { LostItem, FoundItem } = require('../models');
const { upload, uploadToCloudinary } = require('../middleware/cloudinary');
const { detectCategory, findMatches } = require('../middleware/aiMatching');
const { sendMatchEmail } = require('../middleware/email');

// GET /api/lost
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { approved: true };
    if (category && category !== 'all') filter.category = category;

    const items = await LostItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LostItem.countDocuments(filter);
    res.json({ success: true, items, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/lost/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/lost
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { reporterName, email, phone, itemName, description, lostDate } = req.body;

    if (!reporterName || !email || !itemName || !description || !lostDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const category = detectCategory(itemName, description);

    const itemData = {
      reporterName,
      email,
      phone,
      itemName,
      description,
      lostDate: new Date(lostDate),
      category,
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
        // Continue without image rather than failing
      }
    }

    const lostItem = new LostItem(itemData);
    await lostItem.save();

    res.status(201).json({
      success: true,
      message: 'Lost item reported successfully! It will be visible after admin approval.',
      item: lostItem
    });
  } catch (error) {
    console.error('Lost item post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/lost/:id
router.delete('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    const item = await LostItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;