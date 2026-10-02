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

export const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGODB_URI set, using local JSON database engine.');
    return false;
  }

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    console.log('[DB] Connecting to MongoDB Atlas Cluster...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('==================================================');
    console.log('🟢 CONNECTED SUCCESSFULLY TO MONGODB ATLAS CLUSTER!');
    console.log('==================================================');
    return true;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection warning:', err.message);
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
}

const mongooseModels = {};

function getMongooseModel(collectionName) {
  if (mongooseModels[collectionName]) return mongooseModels[collectionName];
  const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
  const model = mongoose.models[collectionName] || mongoose.model(collectionName, schema, collectionName);
  mongooseModels[collectionName] = model;
  return model;
}

class HybridDatabase {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.jsonDb = new JsonDatabase(collectionName);
  }

  isMongoActive() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  get model() {
    return getMongooseModel(this.collectionName);
  }

  async find(query = {}) {
    if (this.isMongoActive()) {
      const results = await this.model.find(query).lean();
      return results.map(doc => ({ ...doc, _id: doc._id.toString(), id: doc._id.toString() }));
    }
    return this.jsonDb.find(query);
  }

  async findOne(query = {}) {
    if (this.isMongoActive()) {
      const doc = await this.model.findOne(query).lean();
      return doc ? { ...doc, _id: doc._id.toString(), id: doc._id.toString() } : null;
    }
    return this.jsonDb.findOne(query);
  }

  async findById(id) {
    if (this.isMongoActive()) {
      let doc = null;
      try {
        doc = await this.model.findById(id).lean();
      } catch (e) {}
      if (!doc) {
        doc = await this.model.findOne({ $or: [{ _id: id }, { id }] }).lean();
      }
      return doc ? { ...doc, _id: doc._id.toString(), id: doc._id.toString() } : null;
    }
    return this.jsonDb.findById(id);
  }

  async insertOne(doc) {
    if (this.isMongoActive()) {
      const id = doc._id || doc.id || 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const created = await this.model.create({ _id: id, ...doc });
      const obj = created.toObject();
      return { ...obj, _id: obj._id.toString(), id: obj._id.toString() };
    }
    return this.jsonDb.insertOne(doc);
  }

  async updateOne(query, updates) {
    if (this.isMongoActive()) {
      const doc = await this.model.findOneAndUpdate(query, { $set: updates }, { new: true, upsert: true }).lean();
      return doc ? { ...doc, _id: doc._id.toString(), id: doc._id.toString() } : null;
    }
    return this.jsonDb.updateOne(query, updates);
  }

  async updateById(id, updates) {
    if (this.isMongoActive()) {
      let doc = null;
      try {
        doc = await this.model.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
      } catch (e) {}
      if (!doc) {
        doc = await this.model.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { $set: updates }, { new: true }).lean();
      }
      return doc ? { ...doc, _id: doc._id.toString(), id: doc._id.toString() } : null;
    }
    return this.jsonDb.updateById(id, updates);
  }
}

export const getDb = (collection) => new HybridDatabase(collection);
