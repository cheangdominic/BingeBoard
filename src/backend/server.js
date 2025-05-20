import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Joi from 'joi';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { MongoClient } from 'mongodb';
import { Review } from './utils.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import axios from 'axios';

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

const mongooseURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

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

// Mongoose connection
await mongoose.connect(mongooseURI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB cluster');
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

const authenticate = (req, res, next) => {
  if (!req.session.authenticated || !req.session.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = {
    email: req.session.email,
  };
  
  next();
};

app.get('/api/reviews', async (req, res) => {
  try {
    const { showId, sort = 'latest' } = req.query;

    if (!showId) {
      return res.status(400).json({ error: 'Show ID is required' });
    }
    
    console.log(`Fetching reviews for show ${showId} with sort: ${sort}`);

    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'likes.length': -1 };
        break;
      case 'relevant':
        sortOptions = { rating: -1, createdAt: -1 };
        break;
      case 'latest':
      default:
        sortOptions = { createdAt: -1 };
    }
    
    const reviews = await Review.find({ showId })
      .sort(sortOptions)
      .lean();
    
    console.log(`Found ${reviews.length} reviews`);

    const formattedReviews = reviews.map(review => ({
      ...review,
      id: review._id.toString(),
      _id: review._id.toString(),
      likes: Array.isArray(review.likes) ? review.likes : [],
      dislikes: Array.isArray(review.dislikes) ? review.dislikes : []
    }));
    
    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews', authenticate, async (req, res) => {
  try {
    console.log('Creating new review, mongoose connection state:', mongoose.connection.readyState);
    
    const { rating, content, containsSpoiler, showId } = req.body;
    
    if (!showId || !content || !rating) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'showId, content, and rating are required' 
      });
    }
    
    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const reviewData = {
      showId,
      userId: user._id,
      username: user.username,
      rating: Math.min(5, Math.max(1, rating)),
      content,
      containsSpoiler: !!containsSpoiler,
      likes: [],
      dislikes: [],
      createdAt: new Date()
    };
    
    console.log('Creating review with data:', reviewData);
    
    const review = new Review(reviewData);
    const savedReview = await review.save();
    
    console.log('Review saved successfully:', savedReview._id);
    
    const formattedReview = {
      ...savedReview.toObject(),
      id: savedReview._id.toString(),
      _id: savedReview._id.toString()
    };
    
    return res.status(201).json(formattedReview);
  } catch (error) {
    console.error('Review creation error:', error);
    return res.status(500).json({
      error: 'Database operation failed',
      details: error.message,
      mongodbState: mongoose.connection.readyState
    });
  }
});

app.put('/api/reviews/:id', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { action } = req.body;
    
    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "like" or "dislike"' });
    }
    
    console.log(`Processing ${action} for review ${reviewId}`);

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = user._id;

    if (!Array.isArray(review.likes)) review.likes = [];
    if (!Array.isArray(review.dislikes)) review.dislikes = [];
    
    if (action === 'like') {
      const alreadyLiked = review.likes.some(id => id.toString() === userId.toString());
      
      if (alreadyLiked) {
        review.likes = review.likes.filter(id => id.toString() !== userId.toString());
      } else {
        review.likes.push(userId);
        review.dislikes = review.dislikes.filter(id => id.toString() !== userId.toString());
      }
    } else if (action === 'dislike') {
      const alreadyDisliked = review.dislikes.some(id => id.toString() === userId.toString());
      
      if (alreadyDisliked) {
        review.dislikes = review.dislikes.filter(id => id.toString() !== userId.toString());
      } else {
        review.dislikes.push(userId);
        review.likes = review.likes.filter(id => id.toString() !== userId.toString());
      }
    }

    await review.save();
    console.log('Review vote updated successfully');

    const formattedReview = {
      ...review.toObject(),
      id: review._id.toString(),
      _id: review._id.toString()
    };
    
    res.json(formattedReview);
  } catch (error) {
    console.error('Review vote update error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await userCollection.findOne(
      { email: req.session.email },
      { projection: { password: 0 } } 
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SPA Fallback Route - MUST BE LAST
app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await userCollection.findOne(
      { username },
      { projection: { username: 1, email: 1, profilePic: 1 } }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user by username:", err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});


app.get('/api/getUserInfo', async (req, res) => {
  if (!req.session.authenticated || !req.session.email) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  try {
    const user = await userCollection.findOne(
      { email: req.session.email },
      { projection: { username: 1, profilePic: 1, watchlist: 1, _id: 0 } }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ 
      success: true, 
      username: user.username, 
      profilePic: user.profilePic || null,
      watchlist: user.watchlist || [] 
    });
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

app.post('/api/watchlist/add', async (req, res) => {
  if (!req.session || !req.session.email) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { showId } = req.body;
  if (!showId) {
    return res.status(400).json({ success: false, message: 'Missing show ID' });
  }

  try {
    const result = await userCollection.updateOne(
      { email: req.session.email },
      { $addToSet: { watchlist: showId } } 
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({ success: true, message: 'Already in watchlist' });
    }

    res.json({ success: true, message: 'Added to watchlist' });
  } catch (err) {
    console.error("Error updating watchlist:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/watchlist/remove', async (req, res) => {
  if (!req.session || !req.session.email) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { showId } = req.body;
  if (!showId) {
    return res.status(400).json({ success: false, message: 'Missing show ID' });
  }

  try {
    await userCollection.updateOne(
      { email: req.session.email },
      { $pull: { watchlist: showId } }
    );
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/chat', async (req, res) => {
  console.log('Received chat request with body:', req.body);

  try {
    // Validate input
    if (!req.body || !req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('Invalid request format');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request format. Expected { messages: [] }' 
      });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error' 
      });
    }

    // Prepare messages - ensure they have the required structure
    const messages = req.body.messages.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || ''
    }));

    console.log('Sending to OpenAI:', messages);

    // Make API call to OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    );

    // Validate OpenAI response
    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response:', response.data);
      return res.status(500).json({ 
        success: false,
        error: 'Unexpected API response format' 
      });
    }

    // Return successful response
    return res.json({ 
      success: true,
      reply: response.data.choices[0].message.content 
    });

  } catch (error) {
    console.error('Chat error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // Handle different error types
    if (error.response) {
      return res.status(502).json({ 
        success: false,
        error: error.response.data.error?.message || 'API service error' 
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        success: false,
        error: 'Request timeout' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

app.get('/api/average-rating', async (req, res) => {
  try {
    const { showId } = req.query;

    if (!showId) {
      return res.status(400).json({ error: 'Show ID is required' });
    }

    const result = await Review.aggregate([
      { $match: { showId } },
      {
        $group: {
          _id: '$showId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({ averageRating: null, totalReviews: 0 });
    }

    const { averageRating, totalReviews } = result[0];

    res.json({
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews
    });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ error: 'Failed to calculate average rating' });
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
