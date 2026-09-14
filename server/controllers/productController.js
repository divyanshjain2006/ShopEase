const Product = require('../models/Product');

// SEC-006: Escape regex special characters to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// SEC-021: Validate image URLs
const isValidImageUrl = (url) => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let query = {};

    if (search && typeof search === 'string') {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (category && category !== 'all' && typeof category === 'string') {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'priceLow') sortOption = { price: 1 };
    if (sort === 'priceHigh') sortOption = { price: -1 };

    const products = await Product.find(query).sort(sortOption);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name, description, price and category' });
    }

    if (!isValidImageUrl(image)) {
      return res.status(400).json({ success: false, message: 'Invalid image URL. Must be http or https.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      image: image || '',
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // SEC-004: Whitelist allowed fields to prevent mass assignment
    const { name, description, price, category, stock, image } = req.body;

    if (!isValidImageUrl(image)) {
      return res.status(400).json({ success: false, message: 'Invalid image URL. Must be http or https.' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock, image },
      { new: true, runValidators: true }
    );

    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Seed only if collection empty (safe for dev)
const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: 'Products already exist, nothing seeded' });
    }

    const products = [
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling over-ear headphones with 20h battery life.',
        price: 59.99,
        category: 'Electronics',
        stock: 25,
        image: 'https://placehold.co/300x300/111/fff?text=Headphones',
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches.',
        price: 89.99,
        category: 'Electronics',
        stock: 15,
        image: 'https://placehold.co/300x300/111/fff?text=Keyboard',
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton tee, unisex fit.',
        price: 19.99,
        category: 'Clothing',
        stock: 50,
        image: 'https://placehold.co/300x300/111/fff?text=T-Shirt',
      },
      {
        name: 'Denim Jacket',
        description: 'Classic denim jacket, medium fit.',
        price: 69.99,
        category: 'Clothing',
        stock: 12,
        image: 'https://placehold.co/300x300/111/fff?text=Denim+Jacket',
      },
      {
        name: 'Running Shoes',
        description: 'Lightweight cushioned running shoes.',
        price: 99.99,
        category: 'Footwear',
        stock: 20,
        image: 'https://placehold.co/300x300/111/fff?text=Shoes',
      },
      {
        name: 'Smartwatch',
        description: 'Fitness tracker with heart-rate monitor and notifications.',
        price: 149.99,
        category: 'Electronics',
        stock: 8,
        image: 'https://placehold.co/300x300/111/fff?text=Watch',
      },
      {
        name: 'Backpack',
        description: 'Durable 20L backpack, water resistant.',
        price: 44.99,
        category: 'Accessories',
        stock: 30,
        image: 'https://placehold.co/300x300/111/fff?text=Backpack',
      },
      {
        name: 'Sunglasses',
        description: 'Polarized UV400 sunglasses.',
        price: 29.99,
        category: 'Accessories',
        stock: 40,
        image: 'https://placehold.co/300x300/111/fff?text=Sunglasses',
      },
    ];

    await Product.insertMany(products);
    res.json({ success: true, message: `${products.length} products seeded` });
  } catch (error) {
    console.error('Seed products error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  seedProducts,
};
