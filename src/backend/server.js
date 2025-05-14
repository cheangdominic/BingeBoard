import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

const saltRounds = 12;
const expireTime = 24 * 60 * 60 * 1000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pics', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp',], 
  },
});

const upload = multer({ storage: storage });

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
const client = new MongoClient(atlasURI);

let database;
let userCollection;

async function connectToDatabase() {
  try {
    await client.connect();
    database = client.db(mongodb_database);
    userCollection = database.collection('users');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
  crypto: {
    secret: mongodb_session_secret
  }
});

app.use(session({
  secret: node_session_secret,
  store: mongoStore,
  saveUninitialized: false,
  resave: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: expireTime
  }
}));

app.use(express.static(path.join(__dirname, '../../dist')));

app.post('/api/signup', async (req, res) => {
  if (!userCollection) {
    return res.status(500).json({ success: false, message: 'Database not connected' });
  }

  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields are required' 
    });
  }

  const schema = Joi.object({
    username: Joi.string().alphanum().max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required()
  });

  const validationResult = schema.validate({ username, email, password });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    return res.status(400).json({ success: false, message: validationResult.error.details[0].message });
  }

  try {
    const existingUser = await userCollection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await userCollection.insertOne({
      username: username,
      email: email,
      password: hashedPassword,
      watchlist: [],
      profilePic: '',
    });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.post('/api/login', async (req, res) => {
  if (!userCollection) {
    return res.status(500).json({ success: false, message: 'Database not connected' });
  }

  const { email, password } = req.body;

  const schema = Joi.string().email().required();
  const validationResult = schema.validate(email);
  if (validationResult.error != null) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    const result = await userCollection.find({ email: email }).project({ email: 1, password: 1, _id: 1 }).toArray();
    
    if (result.length != 1) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (await bcrypt.compare(password, result[0].password)) {
      req.session.authenticated = true;
      req.session.email = email;
      req.session.cookie.maxAge = expireTime;

      await database.collection('userSessions').insertOne({
        email,
        loginTime: new Date(),
        sessionData: req.session,
      });

      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.get('/api/active-users', async (req, res) => {
  try {
    const usersCollection = database.collection('users');
    const activeUsers = await usersCollection.countDocuments();
    res.json({ success: true, activeUsers });
  } catch (err) {
    console.error("Failed to count users:", err);
    res.status(500).json({ success: false, error: "Failed to fetch total users" });
  }
});

app.get('/api/users', async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }

  try {
    const exactMatches = await userCollection.find({
      $or: [
        { username: search },
        { email: search }
      ]
    }).toArray();

    const similarMatches = await userCollection.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).toArray();

    const filteredSimilarMatches = similarMatches.filter(
      (user) => !exactMatches.some((exactUser) => exactUser._id.toString() === user._id.toString())
    );

    res.json({ exactMatches, similarMatches: filteredSimilarMatches });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

app.get('/api/getUserInfo', async (req, res) => {
  if (!req.session.authenticated || !req.session.email) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  try {
    const user = await userCollection.findOne(
      { email: req.session.email },
      { projection: { username: 1, _id: 0 } }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, username: user.username, fullName: user.fullName || "" });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ success: false, message: 'Failed to get user info' });
  }
});

app.post('/api/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!req.session.email) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const imageUrl = req.file.secure_url || req.file.url || req.file.path;

    const updatedUser = await userCollection.updateOne(
      { email: req.session.email },
      { $set: { profilePic: imageUrl } }
    );

    if (updatedUser.modifiedCount === 1) {
      return res.json({ 
        success: true, 
        imageUrl,
        message: 'Profile picture updated successfully'
      });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile picture',
      error: error.message 
    });
  }
});

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
