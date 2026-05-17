const express = require('express');
const router = express.Router();
const { LostItem, FoundItem } = require('../models');
const authMiddleware = require('../middleware/auth');
const { sendApprovalEmail } = require('../middleware/email');

// All admin routes require auth
router.use(authMiddleware);

// GET /api/admin/dashboard — stats overview
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalLost, totalFound, pendingLost, pendingFound,
      archivedLost, archivedFound, approvedLost, approvedFound, matchedItems
    ] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      LostItem.countDocuments({ status: 'pending' }),
      FoundItem.countDocuments({ status: 'pending' }),
      LostItem.countDocuments({ status: 'resolved' }),
      FoundItem.countDocuments({ status: 'resolved' }),
      LostItem.countDocuments({ approved: true }),
      FoundItem.countDocuments({ approved: true }),
      LostItem.countDocuments({ matched: true }),
    ]);

    res.json({
      success: true,
      stats: { totalLost, totalFound, pendingLost, pendingFound, archivedLost, archivedFound, approvedLost, approvedFound, matchedItems }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/lost — all lost items (pending + approved)
router.get('/lost', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const items = await LostItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/found — all found items
router.get('/found', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const items = await FoundItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/lost/:id/approve
router.patch('/lost/:id/approve', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Send approval email
    if (item.email) {
      await sendApprovalEmail(item.email, item.itemName, 'lost');
    }

    res.json({ success: true, message: 'Lost item approved and reporter notified', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/found/:id/approve
router.patch('/found/:id/approve', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, message: 'Found item approved', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/lost/:id/reject
router.patch('/lost/:id/reject', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'rejected' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Lost item rejected', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/found/:id/reject
router.patch('/found/:id/reject', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'rejected' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Found item rejected', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/lost/:id — update a lost item
router.patch('/lost/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.lostDate) payload.lostDate = new Date(payload.lostDate);
    const item = await LostItem.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Lost item updated', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/found/:id — update a found item
router.patch('/found/:id', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.foundDate) payload.foundDate = new Date(payload.foundDate);
    const item = await FoundItem.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Found item updated', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/lost/:id/archive — archive a lost item from public view
router.patch('/lost/:id/archive', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'resolved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Lost item archived', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/found/:id/archive — archive a found item from public view
router.patch('/found/:id/archive', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'resolved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Found item archived', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/lost/:id/restore — restore archived lost item
router.patch('/lost/:id/restore', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Lost item restored', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/found/:id/restore — restore archived found item
router.patch('/found/:id/restore', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Found item restored', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/lost/:id
router.delete('/lost/:id', async (req, res) => {
  try {
    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lost item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/found/:id
router.delete('/found/:id', async (req, res) => {
  try {
    await FoundItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Found item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
