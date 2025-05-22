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
import { Activity } from './utils.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

const saltRounds = 12;
const expireTime = 24 * 60 * 60 * 1000;

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin === 'https://two800-202510-bby12.onrender.com' ||
      origin.startsWith('http://localhost:')
    ) {
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
 const apiKey = process.env.VITE_TMDB_API_KEY;
 const baseUrl = process.env.VITE_TMDB_BASE_URL;

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
    secure: true,
    maxAge: expireTime,
    sameSite: 'none'
  }
}));

async function logActivity(userId, action, targetId = null, details = {}) {
  try {
    // For actions that involve shows
    if (['review_create', 'review_like', 'review_dislike', 'watchlist_add', 'watchlist_remove'].includes(action)) {
      if (targetId) {
        try {
          // Use environment variables instead of VITE_* variables
          const tmdbUrl = `${process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'}/tv/${targetId}`;
          
          const response = await axios.get(tmdbUrl, {
            params: {
              api_key: process.env.TMDB_API_KEY
            },
            timeout: 5000 // 5 second timeout
            
          });

          if (response.data) {
         
            details.showName = response.data.name || 
                              response.data.original_name || 
                              response.data.original_title || 
                              "Unknown Show";
            
            details.showImage = response.data.poster_path
              ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}`
              : "https://via.placeholder.com/300x450";
          }
        } catch (apiError) {
          console.error('Failed to fetch show details from TMDB:', {
            error: apiError.message,
            targetId,
            action,
            response: apiError.response?.data
          });
          details.showName = `Show ID: ${targetId}`; // More informative than "Unknown Show"
          details.showImage = "https://via.placeholder.com/300x450";
        }
      } else {
        console.warn(`Target ID missing for action: ${action}`);
      }
    }
    

    // For profile updates
    if (action === 'profile_update') {
      const user = await userCollection.findOne({ _id: userId });
      if (user) {
        details.profilePhoto = user.profilePic || '';
      }
    }

    const activity = new Activity({
      userId,
      action,
      targetId,
      details,
    });

    await activity.save();
  } catch (error) {
    console.error('Failed to log activity:', {
      error: error.message,
      stack: error.stack,
      userId,
      action,
      targetId
    });
  }
}


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
    await logActivity(insertResult.insertedId, 'account_creation');

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

      await logActivity(result[0]._id, 'login');

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

async function fetchShowDetailsFromTMDB(showId) {
  if (!showId) {
    console.warn('Attempted to fetch show details with empty ID');
    return { name: 'Unknown Show', poster_path: null };
  }
  
  if (!apiKey) {
    console.error('TMDB_API_KEY is missing in environment variables');
    return { name: `Show #${showId}`, poster_path: null };
  }

  console.log(`Fetching details for show ID: ${showId}`);

  const axiosConfig = {
    params: { api_key: apiKey },
    timeout: 8000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  try {
    const tvRes = await axios.get(`${baseUrl}/tv/${showId}`, axiosConfig);
    
    if (tvRes.data && tvRes.data.name) {
      console.log(`Successfully retrieved TV show: ${tvRes.data.name}`);
      return {
        name: tvRes.data.name,
        poster_path: tvRes.data.poster_path
      };
    }
  } catch (tvErr) {
    console.error(`TV lookup failed for ID ${showId}:`, {
      status: tvErr.response?.status,
      data: tvErr.response?.data,
      message: tvErr.message
    });
  }

  return { 
    name: `Show #${showId}`, 
    poster_path: null 
  };
}

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

app.post('/api/reviews', async (req, res) => {
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


    await logActivity(user._id, 'review_create', showId, {
      rating,
      content,
      containsSpoiler,
    }
    );

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

app.put('/api/reviews/:id', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { action } = req.body;

    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "like" or "dislike"' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user._id;
    const userIdStr = userId.toString();

    if (!Array.isArray(review.likes)) review.likes = [];
    if (!Array.isArray(review.dislikes)) review.dislikes = [];

    const isOwnReview = review.userId && review.userId.toString() === userIdStr;
    if (isOwnReview) {
      return res.status(403).json({ error: 'You cannot vote on your own review' });
    }

    const alreadyLiked = review.likes.some(id => id && id.toString() === userIdStr);
    const alreadyDisliked = review.dislikes.some(id => id && id.toString() === userIdStr);

    // Log activity
    if (action === 'like') {
      if (alreadyLiked) {
        await logActivity(userId, 'review_unlike', reviewId);
      } else {
        await logActivity(userId, 'review_like', reviewId);
      }
    } else if (action === 'dislike') {
      if (alreadyDisliked) {
        await logActivity(userId, 'review_undislike', reviewId);
      } else {
        await logActivity(userId, 'review_dislike', reviewId);
      }
    }

    // Modify review votes
    if (action === 'like') {
      if (alreadyLiked) {
        review.likes = review.likes.filter(id => id && id.toString() !== userIdStr);
      } else {
        review.likes.push(userId);
        review.dislikes = review.dislikes.filter(id => id && id.toString() !== userIdStr);
      }
    } else if (action === 'dislike') {
      if (alreadyDisliked) {
        review.dislikes = review.dislikes.filter(id => id && id.toString() !== userIdStr);
      } else {
        review.dislikes.push(userId);
        review.likes = review.likes.filter(id => id && id.toString() !== userIdStr);
      }
    }

    await review.save();

    const responseReview = {
      ...review.toObject(),
      id: review._id.toString(),
      _id: review._id.toString(),
      likes: review.likes.map(id => id.toString()),
      dislikes: review.dislikes.map(id => id.toString())
    };

    res.json(responseReview);
  } catch (error) {
    console.error('Review vote update error:', error);
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/user', async (req, res) => {
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

app.get('/api/user/reviews', async (req, res) => {
  try {
    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = user._id;
    console.log(`Fetching reviews for user: ${userId}`);
    
    const userReviews = await Review.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${userReviews.length} reviews for user ${userId}`);
    
    const reviewsWithShowDetails = await Promise.all(
      userReviews.map(async (review) => {
        let showIdToUse = null;

        if (review.showId) showIdToUse = review.showId;
        else if (review.tmdbId) showIdToUse = review.tmdbId;
        else if (review.show_id) showIdToUse = review.show_id;
        
        console.log(`Processing review ${review._id}, using show ID: ${showIdToUse}`);

        let showData = { name: 'Unknown Show', poster_path: null };
        if (showIdToUse) {
          showData = await fetchShowDetailsFromTMDB(showIdToUse);
        }

        return {
          ...review,
          id: review._id.toString(),
          showId: showIdToUse,
          showName: showData.name,
          posterPath: showData.poster_path,
          likes: Array.isArray(review.likes) ? review.likes : [],
          dislikes: Array.isArray(review.dislikes) ? review.dislikes : []
        };
      })
    );
    
    res.json(reviewsWithShowDetails);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
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

    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const imageUrl = req.file.secure_url || req.file.url || req.file.path;

    const updatedUser = await userCollection.updateOne(
      { email: req.session.email },
      { $set: { profilePic: imageUrl } }
    );

    if (updatedUser.modifiedCount === 1) {
      await logActivity(user._id, 'profile_update', null, { field: 'profilePic' });
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

app.get('/api/activities', authenticate, async (req, res) => {
  try {
    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:username/activities', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userCollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await userCollection.updateOne(
      { email: req.session.email },
      { $addToSet: { watchlist: showId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({ success: true, message: 'Already in watchlist' });
    }

    await logActivity(user._id, 'watchlist_add', showId);
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
    const user = await userCollection.findOne({ email: req.session.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await userCollection.updateOne(
      { email: req.session.email },
      { $pull: { watchlist: showId } }
    );

    await logActivity(user._id, 'watchlist_remove', showId);
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
