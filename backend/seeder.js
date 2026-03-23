const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Order = require('./models/Order');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dropship');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
  },
];

const suppliers = [
  {
    name: 'Mega Electronics Supplier',
    apiEndpoint: 'https://api.megaelectronics.dummy/orders',
    apiKey: 'supp_test_123',
    contactEmail: 'orders@megaelectronics.dummy',
  },
  {
    name: 'Fashion Hub DropShip',
    apiEndpoint: 'https://api.fashionhub.dummy/orders',
    apiKey: 'supp_test_456',
    contactEmail: 'dropship@fashionhub.dummy',
  },
];

const productsData = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and high-fidelity audio.',
    price: 249.99,
    supplierPrice: 150.00,
    stock: 45,
    category: 'Electronics',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' }],
    rating: 4.8,
    numReviews: 12,
  },
  {
    name: 'Minimalist Smartwatch',
    description: 'Track your fitness, heart rate, and notifications with this sleek, minimalist smartwatch. Water-resistant up to 50m.',
    price: 129.99,
    supplierPrice: 65.00,
    stock: 20,
    category: 'Electronics',
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop' }],
    rating: 4.5,
    numReviews: 8,
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Comfortable mesh office chair with lumbar support, adjustable armrests, and a tilt mechanism.',
    price: 199.99,
    supplierPrice: 110.00,
    stock: 15,
    category: 'Furniture',
    images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop' }],
    rating: 4.2,
    numReviews: 5,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile blue switches and programmable macro keys.',
    price: 89.99,
    supplierPrice: 40.00,
    stock: 60,
    category: 'Electronics',
    images: [{ url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop' }],
    rating: 4.7,
    numReviews: 24,
  },
  {
    name: 'Canvas Weekend Duffel Bag',
    description: 'Durable canvas duffel bag perfect for short trips. Features leather accents and a separate shoe compartment.',
    price: 59.99,
    supplierPrice: 20.00,
    stock: 100,
    category: 'Accessories',
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop' }],
    rating: 4.0,
    numReviews: 3,
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 artisan-crafted ceramic coffee mugs. Microwave and dishwasher safe.',
    price: 34.99,
    supplierPrice: 12.00,
    stock: 80,
    category: 'Home',
    images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop' }],
    rating: 4.9,
    numReviews: 45,
  },
];

const importData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Supplier.deleteMany();

    // 1. Create Users
    const hashedUsers = await Promise.all(
      users.map(async (u) => {
        const salt = await bcrypt.genSalt(12);
        u.password = await bcrypt.hash(u.password, salt);
        return u;
      })
    );
    // Disable save hook for seeding to directly insert bulk hashed
    await User.insertMany(hashedUsers);

    // 2. Create Suppliers
    const createdSuppliers = await Supplier.insertMany(suppliers);
    const electronicsSupplierId = createdSuppliers[0]._id;
    const generalSupplierId = createdSuppliers[1]._id;

    // 3. Create Products with Suppliers
    const productsWithRefs = productsData.map((p, index) => {
      return {
        ...p,
        supplierId: p.category === 'Electronics' ? electronicsSupplierId : generalSupplierId,
      };
    });

    await Product.insertMany(productsWithRefs);

    console.log('✅ Demo Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Supplier.deleteMany();

    console.log('🗑️ Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with destroy: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
