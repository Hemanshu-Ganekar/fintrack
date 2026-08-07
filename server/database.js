import mongoose from 'mongoose';

// Define User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Define Transaction Schema
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  rawDate: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Completed' }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Define Settings Schema
const SettingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  value: { type: String, required: true }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Setting = mongoose.model('Setting', SettingSchema);

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_tracker';
  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(connUri, {
        bufferCommands: false,
      });
    }
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    return true;
  } catch (error) {
    cached.promise = null;
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

export {
  connectDB,
  User,
  Transaction,
  Setting,
  mongoose
};
