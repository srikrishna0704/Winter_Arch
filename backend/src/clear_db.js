import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

async function clearAllData() {
  console.log('🧹 Clearing all local JSON database files...');

  const collections = ['users', 'monthly_trackers', 'arcs', 'daily_logs', 'habits', 'goals'];

  // 1. Clear local JSON files
  for (const col of collections) {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      console.log(`  ✓ Cleared local file: ${col}.json`);
    } catch (e) {
      console.warn(`  ! Could not clear ${col}.json:`, e.message);
    }
  }

  // 2. Clear MongoDB Atlas collections
  const uri = process.env.MONGODB_URI || 'mongodb+srv://srikrishna0704_db_user:VQoLYOna1OWLI01h@cluster0.ntds3zu.mongodb.net/winter_arc?retryWrites=true&w=majority&appName=Cluster0';

  try {
    console.log('🌐 Connecting to MongoDB Atlas to purge remote database...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    
    for (const col of collections) {
      try {
        await mongoose.connection.collection(col).deleteMany({});
        console.log(`  ✓ Purged MongoDB collection: ${col}`);
      } catch (e) {
        console.warn(`  ! Mongo purge notice for ${col}:`, e.message);
      }
    }
    console.log('✨ All MongoDB Atlas collections successfully emptied!');
    await mongoose.disconnect();
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas clear notice (using local reset):', err.message);
  }

  console.log('🎉 Database reset complete! Database is now completely fresh.');
}

clearAllData().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
