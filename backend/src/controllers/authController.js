import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

const UserDb = getDb('users');

export const register = (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existing = UserDb.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = UserDb.insertOne({
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    });

    const token = generateToken(user._id);

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = UserDb.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = (req, res) => {
  try {
    const user = UserDb.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const googleLogin = (req, res) => {
  try {
    const { email, name, picture, googleId, credential } = req.body;
    let userEmail = email;
    let userName = name;
    let userPicture = picture;
    let userGId = googleId;

    if (credential) {
      try {
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        userEmail = payload.email;
        userName = payload.name;
        userPicture = payload.picture;
        userGId = payload.sub;
      } catch (e) {
        console.warn('Failed to parse Google JWT credential:', e);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Gmail email address is required' });
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    let user = UserDb.findOne({ email: cleanEmail });

    if (!user) {
      user = UserDb.insertOne({
        email: cleanEmail,
        name: userName || cleanEmail.split('@')[0],
        googleId: userGId || `gid_${Date.now()}`,
        avatar: userPicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        authProvider: 'google',
        createdAt: new Date().toISOString()
      });
    } else {
      user = UserDb.updateOne({ _id: user._id }, {
        googleId: userGId || user.googleId || `gid_${Date.now()}`,
        avatar: userPicture || user.avatar,
        authProvider: 'google',
        name: userName || user.name
      });
    }

    const token = generateToken(user._id);
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

