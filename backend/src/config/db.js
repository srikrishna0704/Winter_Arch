import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGODB_URI set, using embedded JSON database engine.');
    return false;
  }

  try {
    console.log('[DB] Connecting to MongoDB Atlas Cluster...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    isMongoConnected = true;
    console.log('==================================================');
    console.log('🟢 CONNECTED SUCCESSFULLY TO MONGODB ATLAS CLUSTER!');
    console.log('   Cluster: cluster0.wow1g1b.mongodb.net');
    console.log('   Database: winter_arc');
    console.log('==================================================');
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection attempt warning (using hybrid persistent store):', err.message);
    isMongoConnected = false;
    return false;
  }
};

class JsonDatabase {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.data = this._loadData();
  }

  _loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.error(`Error loading database file ${this.filePath}:`, err);
    }
    return [];
  }

  _saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving database file ${this.filePath}:`, err);
    }
  }

  find(query = {}) {
    return this.data.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query = {}) {
    const results = this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  findById(id) {
    return this.findOne({ _id: id }) || this.findOne({ id });
  }

  insertOne(doc) {
    const id = doc._id || doc.id || 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const newDoc = { _id: id, createdAt: new Date().toISOString(), ...doc };
    this.data.push(newDoc);
    this._saveData();
    return newDoc;
  }

  insertMany(docs) {
    return docs.map(doc => this.insertOne(doc));
  }

  updateOne(query, updates) {
    const index = this.data.findIndex(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    if (index !== -1) {
      const updatedDoc = {
        ...this.data[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.data[index] = updatedDoc;
      this._saveData();
      return updatedDoc;
    }
    return null;
  }

  updateById(id, updates) {
    const existing = this.findById(id);
    if (existing) {
      return this.updateOne({ _id: existing._id }, updates);
    }
    return null;
  }

  deleteOne(query) {
    const index = this.data.findIndex(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this._saveData();
      return deleted;
    }
    return null;
  }

  deleteMany(query = {}) {
    const initialLen = this.data.length;
    this.data = this.data.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return true;
        }
      }
      return false;
    });
    this._saveData();
    return initialLen - this.data.length;
  }

  clear() {
    this.data = [];
    this._saveData();
  }
}

export const getDb = (collection) => new JsonDatabase(collection);
