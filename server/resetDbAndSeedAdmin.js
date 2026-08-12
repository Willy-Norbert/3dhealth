import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

// Load .env from project root (same as server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const args = process.argv.slice(2);
const confirmed = args.includes('--confirm');
if (!confirmed) {
  console.log('This script will DROP the entire database.');
  console.log('Run with --confirm to proceed, and optionally --email=... --password=...');
  process.exit(1);
}

const getArg = (name, fallback) => {
  const match = args.find(a => a.startsWith(`--${name}=`));
  return match ? match.split('=')[1] : fallback;
};

const email = getArg('email', 'zakarythompson048@gmail.com');
const password = getArg('password', '12345678');
const name = getArg('name', 'Admin User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/my3dproject';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);

    // Drop the whole database
    await mongoose.connection.db.dropDatabase();
    console.log('Dropped database.');

    // Create admin user
    const admin = new User({ name, email, password, role: 'admin' });
    await admin.save();
    console.log('Admin user created:');
    console.log('  Email:', email);
    console.log('  Password:', password);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during reset:', err);
    process.exit(1);
  }
};

run();
