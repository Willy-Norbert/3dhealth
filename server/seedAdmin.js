import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://irabaruta:01402@mydb.qhgx1yd.mongodb.net/myproject?appName=mydb';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@healthed.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@healthed.com');
      
      // If it exists but role isn't admin, force it to admin
      if(existingAdmin.role !== 'admin') {
         existingAdmin.role = 'admin';
         await existingAdmin.save();
         console.log('Upgraded existing user to admin role.');
      }
      process.exit(0);
    }

    const adminUser = new User({
      name: 'System Admin',
      email: adminEmail,
      password: 'adminpassword',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user seeded successfully!');
    console.log('Email: admin@healthed.com');
    console.log('Password: adminpassword');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
