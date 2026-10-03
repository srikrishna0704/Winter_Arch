import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'winter_arc_secret_key_90_days';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '90d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const protect = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  if (token.startsWith('token_gmail_')) {
    const email = token.replace('token_gmail_', '');
    req.userId = 'user_gmail_' + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }

  req.userId = decoded.id;
  next();
};

export const optionalAuth = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    if (token.startsWith('token_gmail_')) {
      const email = token.replace('token_gmail_', '');
      req.userId = 'user_gmail_' + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    } else {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        req.userId = decoded.id;
      }
    }
  }

  if (!req.userId) {
    req.userId = 'user_gmail_srikrishna_gmail_com';
  }

  next();
};

