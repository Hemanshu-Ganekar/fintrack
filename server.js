import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, User, Transaction, Setting, mongoose } from './server/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fintrack_super_secret_key_12345';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection state cache (no longer used for connection blocking, handled in middleware)
let isDbConnected = false;

// Watch connection state
mongoose.connection.on('connected', () => {
  isDbConnected = true;
});
mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
});
mongoose.connection.on('error', () => {
  isDbConnected = false;
});


// Helper database verification middleware
const checkDbConnection = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    const connected = await connectDB();
    if (!connected) {
      return res.status(503).json({ 
        error: 'Database connection is offline. Please make sure MongoDB is running and your connection URI in .env is correct.' 
      });
    }
  }
  next();
};

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// --- ROUTES ---

// Database Status Endpoint
app.get('/api/db-status', checkDbConnection, (req, res) => {
  res.json({ connected: mongoose.connection.readyState === 1 });
});

// 0. Auth APIs
app.post('/api/auth/register', checkDbConnection, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', checkDbConnection, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found with this email' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Transactions APIs
app.get('/api/transactions', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ rawDate: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const newTx = new Transaction({ ...req.body, userId: req.user.id });
    const savedTx = await newTx.save();
    res.status(201).json(savedTx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/transactions/:id', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const updatedTx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(updatedTx);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/transactions/:id', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const deletedTx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all data (for specific user)
app.post('/api/transactions/clear', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    await Transaction.deleteMany({ userId: req.user.id });
    res.json({ message: 'All transactions cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 2. Settings APIs
app.get('/api/settings', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const usernameSetting = await Setting.findOne({ key: 'username', userId: req.user.id });
    const currencySetting = await Setting.findOne({ key: 'currency', userId: req.user.id });

    // Try to get user's real name if setting not found
    const user = await User.findById(req.user.id);

    res.json({
      username: usernameSetting ? usernameSetting.value : user.name,
      currency: currencySetting ? currencySetting.value : 'Rs.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', checkDbConnection, authMiddleware, async (req, res) => {
  const { username, currency } = req.body;
  try {
    if (username !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'username', userId: req.user.id }, 
        { value: username }, 
        { upsert: true, new: true }
      );
    }
    if (currency !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'currency', userId: req.user.id }, 
        { value: currency }, 
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production (optional stub)
// app.use(express.static(path.join(__dirname, 'dist')));

// Start Express App (only if not running on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
