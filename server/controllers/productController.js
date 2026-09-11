const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'priceLow') sortOption = { price: 1 };
    if (sort === 'priceHigh') sortOption = { price: -1 };

    const products = await Product.find(query).sort(sortOption);

    res.json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name, description, price and category' });
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
