import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import {
  connectDB,
  User,
  Setting,
  Transaction,
  mongoose
} from './server/database.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const JWT_SECRET =
  process.env.JWT_SECRET || 'fintrack_super_secret_key_12345';

const app = express();
const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

app.use(cors());
app.use(express.json());

// ============================================================
// DATABASE CONNECTION MIDDLEWARE
// ============================================================

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

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

// ============================================================
// MULTER CONFIGURATION (memory only — image never touches disk)
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// ============================================================
// AI RECEIPT EXTRACTION (Gemini)
// ============================================================

async function extractReceiptData(imageBuffer, mimetype) {
  const base64Image = imageBuffer.toString('base64');

  const prompt = `Look at this receipt image and extract the transaction details.

Respond with ONLY a raw JSON object, no markdown formatting, no code fences, no explanation. Use exactly this shape:

{
  "name": "merchant/store name",
  "category": "one of: Food & Dining, Healthcare, Transportation, Groceries, Shopping, Entertainment, Utilities, Uncategorized",
  "amount": <final total paid as a number, no currency symbol>,
  "date": "the date on the receipt in YYYY-MM-DD format, or today's date if none is visible"
}

If you cannot read the image clearly or it isn't a receipt, set "amount" to null and "name" to "Unknown".`;

  const result = await geminiModel.generateContent([
    {
      inlineData: {
        data: base64Image,
        mimeType: mimetype
      }
    },
    { text: prompt }
  ]);

  const responseText = result.response.text();

  // Strip accidental code fences just in case
  const cleaned = responseText.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('AI returned an unreadable response');
  }

  return parsed;
}

// ============================================================
// DATABASE STATUS
// ============================================================

app.get('/api/db-status', checkDbConnection, (req, res) => {
  res.json({ connected: mongoose.connection.readyState === 1 });
});

// ============================================================
// AUTH APIs
// ============================================================

app.post('/api/auth/register', checkDbConnection, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
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
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
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
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// TRANSACTION APIs
// ============================================================

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

app.post('/api/transactions/clear', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    await Transaction.deleteMany({ userId: req.user.id });
    res.json({ message: 'All transactions cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// AUTO TRANSACTION / AI RECEIPT SCAN APIs
// ============================================================

// Upload receipt → Gemini vision extracts data → return parsed preview
// Image is never saved to disk or DB — buffer is discarded after this request
// ============================================================
// DEV/TEST: GENERATE FAKE TRANSACTION (no AI, no image needed)
// ============================================================

const FAKE_MERCHANTS = [
  { name: 'Starbucks Coffee', category: 'Food & Dining' },
  { name: 'Big Bazaar', category: 'Groceries' },
  { name: 'Apollo Pharmacy', category: 'Healthcare' },
  { name: 'Indian Oil Petrol Pump', category: 'Transportation' },
  { name: 'Croma Electronics', category: 'Shopping' },
  { name: 'PVR Cinemas', category: 'Entertainment' },
  { name: 'Electricity Board', category: 'Utilities' },
  { name: 'Dominos Pizza', category: 'Food & Dining' },
  { name: 'Reliance Fresh', category: 'Groceries' },
  { name: 'Uber', category: 'Transportation' }
];

const FAKE_STATUSES = ['Completed', 'Pending'];

function generateFakeTransactionData() {
  const merchant = FAKE_MERCHANTS[Math.floor(Math.random() * FAKE_MERCHANTS.length)];
  const amount = parseFloat((Math.random() * 2000 + 50).toFixed(2)); // 50 - 2050

  // random date within the last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  const rawDate = new Date();
  rawDate.setDate(rawDate.getDate() - daysAgo);

  return {
    name: merchant.name,
    type: 'Expense', // receipts are always expenses — income wouldn't come from a scanned receipt
    category: merchant.category,
    amount,
    date: rawDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    rawDate: rawDate.toISOString(),
    status: FAKE_STATUSES[Math.floor(Math.random() * FAKE_STATUSES.length)]
  };
}
// Generates a fake transaction and saves it directly — useful for testing
// the UI/list/filters without relying on the AI scan pipeline
app.post(
  '/api/transactions/auto/scan',
  checkDbConnection,
  authMiddleware,
  async (req, res) => {
    try {
      const fakeData = generateFakeTransactionData();

      // return as a preview, don't save yet — same shape your frontend expects
      return res.json({
        success: true,
        parsed: fakeData
      });
    } catch (err) {
      console.error('Fake scan error:', err);
      return res.status(500).json({ error: 'Failed to generate fake transaction' });
    }
  }
);
// Confirm parsed/edited data → save transaction (no image data at all)
app.post('/api/transactions/auto', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const { name, category, amount, date, rawDate } = req.body;
    if (!name || !category || amount == null || !date || !rawDate) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }
    const transaction = await Transaction.create({
      userId: req.user.id,
      name,
      category,
      amount,
      date,
      rawDate,
      status: 'Completed'
    });
    return res.status(201).json({ success: true, transaction });
  } catch (err) {
    console.error('Auto transaction save error:', err);
    return res.status(500).json({ error: 'Failed to save transaction' });
  }
});

// ============================================================
// SETTINGS APIs
// ============================================================

app.get('/api/settings', checkDbConnection, authMiddleware, async (req, res) => {
  try {
    const usernameSetting = await Setting.findOne({ key: 'username', userId: req.user.id });
    const currencySetting = await Setting.findOne({ key: 'currency', userId: req.user.id });
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

// ============================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image must be under 10MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// ============================================================
// DATABASE CONNECTION STATE
// ============================================================

let isDbConnected = false;
mongoose.connection.on('connected', () => { isDbConnected = true; });
mongoose.connection.on('disconnected', () => { isDbConnected = false; });
mongoose.connection.on('error', () => { isDbConnected = false; });

// ============================================================
// START EXPRESS SERVER
// ============================================================

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;