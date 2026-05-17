const mongoose = require('mongoose');

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: { 
    type: String, 
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number']
  }
}, { timestamps: true });

// Lost Item Model
const lostItemSchema = new mongoose.Schema({
  reporterName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  phone: { type: String, trim: true },
  itemName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['id_card', 'electronics', 'books', 'documents', 'other'],
    default: 'other'
  },
  lostDate: { type: Date, required: true },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  approved: { type: Boolean, default: false },
  matched: { type: Boolean, default: false },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'resolved'], default: 'pending' }
}, { timestamps: true });

// Found Item Model
const foundItemSchema = new mongoose.Schema({
  finderName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['id_card', 'electronics', 'books', 'documents', 'other'],
    default: 'other'
  },
  foundLocation: { type: String, default: 'Room No 405', trim: true },
  contactEmail: { type: String, default: 'lostfound@college.edu' },
  contactPhone: { type: String, default: '+91-XXXXXXXXXX' },
  foundDate: { type: Date, default: Date.now },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  approved: { type: Boolean, default: false },
  matched: { type: Boolean, default: false },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'resolved'], default: 'pending' }
}, { timestamps: true });

// Admin Model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const LostItem = mongoose.model('LostItem', lostItemSchema);
const FoundItem = mongoose.model('FoundItem', foundItemSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, LostItem, FoundItem, Admin };
