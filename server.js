import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from frontend

// ======= MONGODB SETUP =======
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogapp';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// ======= USER MODEL =======
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
});

const User = mongoose.model('User', userSchema);

// ======= MIDDLEWARE FOR JWT AUTH =======
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ======= ROUTES =======

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name });

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, name: newUser.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// SIGNIN
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PROTECTED ROUTE
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  res.json({ message: `Welcome ${req.user.email}! This is a protected route.` });
});

// ======= START SERVER =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
