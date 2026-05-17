const Fuse = require('fuse.js');

// Category keyword mapping for simple AI-based classification
const categoryKeywords = {
  id_card: ['id', 'card', 'identity', 'student', 'college', 'library', 'access', 'badge', 'pass'],
  electronics: ['phone', 'mobile', 'laptop', 'tablet', 'charger', 'earphone', 'headphone', 'watch', 'calculator', 'pendrive', 'usb', 'camera', 'keyboard', 'mouse', 'power bank'],
  books: ['book', 'notebook', 'textbook', 'notes', 'record', 'assignment', 'journal', 'diary', 'copy', 'register', 'lab manual', 'practical', 'file'],
  documents: ['document', 'certificate', 'marksheet', 'marks card', 'hall ticket', 'admit card', 'aadhar', 'pan', 'passport', 'license', 'result', 'transcript', 'degree', 'bonafide'],
};

// Detect category from item name and description
const detectCategory = (itemName = '', description = '') => {
  const text = `${itemName} ${description}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return 'other';
};

// Validate image for relevant content using Cloudinary AI tags
const validateImageCategory = (tags = []) => {
  const normalizedTags = tags.map(t => t.toLowerCase());
  
  // Reject humans and animals
  const rejectTags = ['person', 'people', 'human', 'face', 'man', 'woman', 'boy', 'girl', 
                       'animal', 'dog', 'cat', 'bird', 'pet', 'wildlife'];
  
  const hasRejected = rejectTags.some(tag => normalizedTags.includes(tag));
  if (hasRejected) {
    return { valid: false, reason: 'Image contains humans or animals. Please upload a photo of the item.' };
  }

  // Accept relevant object tags
  const validTags = ['card', 'book', 'electronics', 'phone', 'laptop', 'document', 
                      'paper', 'text', 'technology', 'object', 'item', 'bag', 'wallet',
                      'key', 'watch', 'accessory', 'stationery'];
  
  const hasValid = validTags.some(tag => normalizedTags.some(t => t.includes(tag)));
  
  // If no specific tags match, allow it (better UX - don't over-restrict)
  return { valid: true, category: detectCategory(normalizedTags.join(' ')) };
};

// Smart matching algorithm using Fuse.js
const findMatches = async (newItem, existingItems, type = 'found') => {
  if (!existingItems || existingItems.length === 0) return [];

  const fuseOptions = {
    keys: [
      { name: 'itemName', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'category', weight: 0.2 }
    ],
    threshold: 0.4, // Lower = stricter match
    includeScore: true,
  };

  // For lost items search, map fields
  const searchItems = existingItems.map(item => ({
    ...item._doc || item,
    itemName: item.itemName || item.description || '',
    description: item.description || '',
    category: item.category || 'other',
  }));

  const fuse = new Fuse(searchItems, fuseOptions);
  
  const searchQuery = type === 'found' 
    ? `${newItem.description} ${newItem.category}`
    : `${newItem.itemName} ${newItem.description}`;

  const results = fuse.search(searchQuery);
  
  // Filter by date proximity (within 14 days)
  const dateFiltered = results.filter(result => {
    const itemDate = new Date(result.item.lostDate || result.item.foundDate || result.item.createdAt);
    const newDate = new Date(newItem.foundDate || newItem.lostDate || new Date());
    const diffDays = Math.abs((newDate - itemDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  });

  return dateFiltered.slice(0, 3).map(r => ({
    item: r.item,
    score: Math.round((1 - r.score) * 100),
  }));
};

// Calculate text similarity (simple)
const similarity = (str1 = '', str2 = '') => {
  const a = str1.toLowerCase().split(' ');
  const b = str2.toLowerCase().split(' ');
  const intersection = a.filter(word => b.includes(word));
  return intersection.length / Math.max(a.length, b.length);
};

module.exports = { detectCategory, validateImageCategory, findMatches, similarity };
