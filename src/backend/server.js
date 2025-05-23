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
import { connectToDatabase, userCollection, database } from './databaseConnection.js';
import { MongoClient, ObjectId } from 'mongodb';
import { Review, Activity, User } from './utils.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import axios from 'axios';
import { use } from 'react';
import friendsRouter from './friends.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

console.log("--- SERVER.JS IS RUNNING (Version Timestamp: " + new Date().toISOString() + ") ---");

const saltRounds = 12;
const expireTime = 24 * 60 * 60 * 1000;

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000', '/^https?://localhost(:\d+)?$/', process.env.FRONTEND_URL].filter(Boolean);
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin - ${origin}`);
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
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage: storage });

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const tmdbApiKey = process.env.VITE_TMDB_API_KEY;
const tmdbBaseUrl = process.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

console.log(`TMDB API Key Loaded: ${tmdbApiKey ? 'Yes (first few chars: ' + String(tmdbApiKey).substring(0, 5) + '...)' : 'NO!!! KEY IS MISSING!'}`);
console.log(`TMDB Base URL: ${tmdbBaseUrl}`);

const mongooseURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

mongoose.connect(mongooseURI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('Mongoose connected to DB cluster');
}).catch(err => {
  console.error('Mongoose connection error:', err);
  process.exit(1);
});

const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions?retryWrites=true&w=majority`,
  crypto: {
    secret: mongodb_session_secret
  },
  ttl: expireTime / 1000,
});

app.use(session({
  secret: node_session_secret,
  store: mongoStore,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: expireTime
  }
}));

app.use('/api/friends', friendsRouter);
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

const authenticate = async (req, res, next) => {
  console.log(`[AUTH MIDDLEWARE] Path: ${req.path}, Method: ${req.method}`);
  console.log(`[AUTH MIDDLEWARE] Session ID: ${req.sessionID}, Authenticated: ${req.session.authenticated}, Email: ${req.session.email}, UserID: ${req.session.userId}`);

  if (!req.session.authenticated || !req.session.email || !req.session.userId) {
    console.warn('[AUTH MIDDLEWARE] Unauthorized: Session not authenticated, email, or userId missing.');
    return res.status(401).json({ error: 'Unauthorized: Please log in.' });
  }

  try {
    if (!userCollection) {
      console.error("[AUTH MIDDLEWARE] CRITICAL: userCollection is not initialized!");
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    console.log(`[AUTH MIDDLEWARE] Attempting to find user with ID from session: ${req.session.userId}`);
    let userObjectId;
    try {
      userObjectId = new ObjectId(req.session.userId);
    } catch (idError) {
      console.error("[AUTH MIDDLEWARE] Invalid session.userId format for ObjectId:", req.session.userId, idError);
      req.session.destroy((destroyErr) => {
        if (destroyErr) console.error("[AUTH MIDDLEWARE] Error destroying session on invalid userId:", destroyErr);
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid session data. Please log in again.' });
    }

    const userDoc = await userCollection.findOne({ _id: userObjectId });

    if (!userDoc) {
      console.warn(`[AUTH MIDDLEWARE] User not found in DB for session userId: ${req.session.userId} (email: ${req.session.email}). Invalidating session.`);
      req.session.destroy(err => {
        if (err) console.error("[AUTH MIDDLEWARE] Error destroying invalid session:", err);
        else console.log("[AUTH MIDDLEWARE] Invalid session destroyed.");
      });
      return res.status(401).json({ error: 'Unauthorized: User session invalid. Please log in again.' });
    }

    req.currentUser = userDoc;
    req.currentUserId = userDoc._id;

    console.log(`[AUTH MIDDLEWARE] User ${userDoc.username} (ID: ${userDoc._id}) authenticated for path ${req.path}. Proceeding...`);
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Unexpected error during user lookup:', error);
    return res.status(500).json({ error: 'Internal server error during authentication process.' });
  }
};

async function fetchShowDetailsFromTMDB(showIdInput) {
  const showId = String(showIdInput);

  if (!showId || showId === "null" || showId === "undefined") {
    console.warn('[FETCH_TMDB] Attempted to fetch show details with invalid or empty ID:', showIdInput);
    return { name: `Unknown Show (ID: ${showIdInput})`, poster_path: null };
  }

  if (!tmdbApiKey) {
    console.error('[FETCH_TMDB] CRITICAL: TMDB_API_KEY is missing in environment variables!');
    return { name: `Show #${showId} (API Key Missing)`, poster_path: null };
  }

  console.log(`[FETCH_TMDB] Fetching details for show ID: ${showId}`);
  const requestUrl = `${tmdbBaseUrl}/tv/${showId}`;
  const axiosConfig = {
    params: { api_key: tmdbApiKey },
    timeout: 8000,
    headers: { 'Accept': 'application/json' }
  };

  try {
    console.log(`[FETCH_TMDB] Requesting URL: ${requestUrl} with key: ${tmdbApiKey.substring(0, 5)}...`);
    const tvRes = await axios.get(requestUrl, axiosConfig);

    if (tvRes.data && (tvRes.data.name || tvRes.data.original_name)) {
      console.log(`[FETCH_TMDB] Success for ID ${showId}: ${tvRes.data.name || tvRes.data.original_name}`);
      return {
        name: tvRes.data.name || tvRes.data.original_name,
        poster_path: tvRes.data.poster_path
      };
    }
    console.warn(`[FETCH_TMDB] No name in TMDB response for ID ${showId}. Data:`, tvRes.data);
    return { name: `Show #${showId} (Name Missing)`, poster_path: tvRes.data?.poster_path || null };

  } catch (tvErr) {
    console.error(`[FETCH_TMDB] FAILED for ID ${showId}. URL: ${requestUrl}`, {
      message: tvErr.message,
      status: tvErr.response?.status,
      responseData: tvErr.response?.data,
    });
    if (tvErr.response?.data?.status_message) {
      console.error(`[FETCH_TMDB] TMDB Specific Error for ID ${showId}: ${tvErr.response.data.status_message}`);
    }
    return { name: `Show #${showId} (TMDB Fetch Error)`, poster_path: null };
  }
}

async function logActivity(userId, action, targetId = null, details = {}) {
  try {
    if (['review_create', 'review_like', 'review_dislike', 'watchlist_add', 'watchlist_remove', 'mark_watched'].includes(action)) {
      if (targetId) {
        const showDetails = await fetchShowDetailsFromTMDB(targetId.toString());
        details.showName = showDetails.name;
        details.showImage = showDetails.poster_path ? `https://image.tmdb.org/t/p/w500${showDetails.poster_path}` : "https://via.placeholder.com/300x450";
      } else if (!['profile_update', 'login', 'logout', 'account_creation'].includes(action)) {
        console.warn(`[LOG_ACTIVITY] Target ID missing for relevant action: ${action}`);
      }
    }
    if (action === 'profile_update') {
      const userToLog = await userCollection.findOne({ _id: new ObjectId(userId) });
      if (userToLog) details.profilePhoto = userToLog.profilePic || '';
    }
    const activity = new Activity({
      userId: new ObjectId(userId),
      action,
      targetId: targetId ? targetId.toString() : null,
      details,
    });
    await activity.save();
    console.log(`[LOG_ACTIVITY] Logged: User ${userId}, Action ${action}, Target ${targetId || 'N/A'}`);
  } catch (error) {
    console.error('[LOG_ACTIVITY] Failed:', { message: error.message, userId, action, targetId });
  }
}

app.use(express.static(path.join(__dirname, '../../dist')));

app.post('/api/signup', async (req, res) => {
  if (!userCollection) return res.status(500).json({ success: false, message: 'Database not connected' });
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });

  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required()
  });
  const validationResult = schema.validate({ username, email, password });
  if (validationResult.error) return res.status(400).json({ success: false, message: validationResult.error.details[0].message });

  try {
    const existingUser = await userCollection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const insertResult = await userCollection.insertOne({
      username: username,
      email: email,
      password: hashedPassword,
      watchlist: [],
      profilePic: '',
      friends: [],
      friendRequestsSent: [],
      friendRequestsRecieved: [],
	  createdAt: new Date(),
	  updatedAt: new Date()
    });

    if (insertResult.insertedId) {
      await logActivity(insertResult.insertedId, 'account_creation');
      return res.status(201).json({ success: true, message: "Account created successfully" });
    }
    throw new Error("User insertion failed");
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.post('/api/login', async (req, res) => {
  if (!userCollection) return res.status(500).json({ success: false, message: 'Database not connected' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

  try {
    const user = await userCollection.findOne({ email: email });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    if (await bcrypt.compare(password, user.password)) {
      req.session.authenticated = true;
      req.session.email = user.email;
      req.session.userId = user._id.toString();
      req.session.cookie.maxAge = expireTime;

      req.session.save(async (err) => {
        if (err) {
          console.error("Session save error on login:", err);
          return res.status(500).json({ success: false, message: 'Login failed during session save' });
        }
        try {
          await logActivity(user._id, 'login');
        } catch (logError) {
          console.error("Error logging login activity:", logError);
        }
        console.log(`User ${user.username} logged in. Session ID: ${req.sessionID}`);
        return res.json({ success: true, message: "Logged in successfully", user: { _id: user._id.toString(), username: user.username, email: user.email, profilePic: user.profilePic } });
      });
    } else {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.get('/api/user', authenticate, (req, res) => {
  const { password, ...userWithoutPassword } = req.currentUser;
  res.json({ ...userWithoutPassword, _id: userWithoutPassword._id.toString() });
});

app.get('/api/getUserInfo', authenticate, (req, res) => {
  res.json({
    success: true,
    username: req.currentUser.username,
    profilePic: req.currentUser.profilePic || null,
    watchlist: req.currentUser.watchlist || [],
    email: req.currentUser.email,
    _id: req.currentUser._id.toString()
  });
});

app.get('/api/reviews', async (req, res) => {
  try {
    const { showId, sort = 'latest', userId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    let query = {};
    if (showId) query.showId = showId.toString();
    if (userId) query.userId = new ObjectId(userId);

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') sortOptions = { likesCount: -1, createdAt: -1 };
    if (sort === 'relevant') sortOptions = { rating: -1, createdAt: -1 };

    const reviews = await Review.find(query)
      .sort(sortOptions).skip(skip).limit(limitNum)
      .populate('userId', 'username profilePic').lean();
    const totalReviews = await Review.countDocuments(query);

    const formattedReviews = reviews.map(r => ({
      ...r, id: r._id.toString(), _id: r._id.toString(),
      username: r.userId?.username || "Anonymous", userProfilePic: r.userId?.profilePic,
      likes: Array.isArray(r.likes) ? r.likes.map(id => id.toString()) : [],
      dislikes: Array.isArray(r.dislikes) ? r.dislikes.map(id => id.toString()) : [],
    }));
    res.json({ reviews: formattedReviews, currentPage: pageNum, totalPages: Math.ceil(totalReviews / limitNum), totalReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
  }
});

app.post('/api/reviews', authenticate, async (req, res) => {
  try {
    const { rating, content, containsSpoiler, showId } = req.body;
    const loggedInUser = req.currentUser;
    if (!showId || content === undefined || rating === undefined) {
      return res.status(400).json({ error: 'Missing required fields: showId, content, and rating are required' });
    }
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating value. Must be between 0 and 5.' });
    }
    const reviewData = {
      showId: showId.toString(), userId: loggedInUser._id, username: loggedInUser.username,
      rating, content, containsSpoiler: !!containsSpoiler,
      likes: [], dislikes: [], createdAt: new Date()
    };
    const review = new Review(reviewData);
    const savedReview = await review.save();
    const populatedReview = await Review.findById(savedReview._id).populate('userId', 'username profilePic').lean();
    const formattedReview = {
      ...populatedReview, id: populatedReview._id.toString(), _id: populatedReview._id.toString(),
      username: populatedReview.userId?.username || "Anonymous", userProfilePic: populatedReview.userId?.profilePic,
      likes: [], dislikes: []
    };
    await logActivity(loggedInUser._id, 'review_create', showId.toString(), { rating, contentSummary: content.substring(0, 50) });
    return res.status(201).json(formattedReview);
  } catch (error) {
    console.error('Review creation error:', error);
    return res.status(500).json({ error: 'Database operation failed creating review', details: error.message });
  }
});

app.get('/api/reviews/most-liked', async (req, res) => {
  try {
    // You already have tmdbApiKey and tmdbBaseUrl defined globally, use them.
    if (!tmdbApiKey) {
      console.error('TMDB API key is not configured in server.js global scope for /api/reviews/most-liked.');
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    const { limit = 8 } = req.query; // Default to 8 reviews, or use the provided limit

    const mostLikedReviews = await Review.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" } // Calculate the size of the likes array
        }
      },
      { $sort: { likesCount: -1, createdAt: -1 } }, // Sort by likesCount descending, then by creation date descending
      { $limit: parseInt(limit) }, // Limit the number of results
      {
        $lookup: {
          from: "users", // The collection name for users
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" } // Deconstructs the user array field from the input documents to output a document for each element.
    ]);

    const formattedReviews = await Promise.all(
      mostLikedReviews.map(async (review) => {
        let showData = { name: 'Unknown Show', poster_path: null };

        if (review.showId) {
          try {
            // Use the globally defined tmdbBaseUrl and tmdbApiKey
            const tmdbUrl = `${tmdbBaseUrl}/tv/${review.showId}`;

            const response = await axios.get(tmdbUrl, {
              params: {
                api_key: tmdbApiKey // Use tmdbApiKey here
              },
              timeout: 5000
            });

            if (response.data) {
              showData.name = response.data.name || response.data.original_name || 'Unknown Show';
              showData.poster_path = response.data.poster_path;
            }
          } catch (apiError) {
            console.error(`Failed to fetch show details for ID ${review.showId}:`, apiError.message);
            showData.name = `Show ID: ${review.showId} (Fetch Error)`;
          }
        }

        return {
          ...review,
          id: review._id.toString(),
          userProfilePic: review.user?.profilePic || "/img/profilePhotos/generic_profile_picture.jpg",
          username: review.user?.username,
          showName: showData.name,
          posterPath: showData.poster_path, 
          showImage: showData.poster_path
            ? `https://image.tmdb.org/t/p/w500${showData.poster_path}`
            : "https://via.placeholder.com/300x450",
          likes: Array.isArray(review.likes) ? review.likes.map(id => id.toString()) : [],
          dislikes: Array.isArray(review.dislikes) ? review.dislikes.map(id => id.toString()) : []
        };
      })
    );

    res.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error fetching most liked reviews:', error);
    res.status(500).json({ error: 'Failed to fetch most liked reviews', details: error.message });
  }
});

app.get('/api/show/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured.' });
    }
    const showType = req.query.type || 'tv'; // Default to tv, or allow 'movie'
    const url = `https://api.themoviedb.org/3/${showType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,external_ids`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching show details for ID ${req.params.id}:`, error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Failed to fetch show details from TMDB: ${error.response.statusText}`,
        details: error.response.data
      });
    }
    res.status(500).json({ error: 'Failed to fetch show details', details: error.message });
  }
});


app.put('/api/reviews/:id', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { action } = req.body;
    const loggedInUserId = req.currentUserId;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).json({ error: 'Invalid review ID format' });
    if (!['like', 'dislike'].includes(action)) return res.status(400).json({ error: 'Invalid action.' });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (review.userId.equals(loggedInUserId)) return res.status(403).json({ error: 'You cannot vote on your own review.' });

    const userIdStr = loggedInUserId.toString();
    const alreadyLiked = review.likes.map(id => id.toString()).includes(userIdStr);
    const alreadyDisliked = review.dislikes.map(id => id.toString()).includes(userIdStr);
    let update = {};
    let logActionType = '';

    if (action === 'like') {
      if (alreadyLiked) {
        update = { $pull: { likes: loggedInUserId } };
        logActionType = 'review_unlike';
      } else {
        update = { $addToSet: { likes: loggedInUserId }, $pull: { dislikes: loggedInUserId } };
        logActionType = 'review_like';
      }
    } else if (action === 'dislike') {
      if (alreadyDisliked) {
        update = { $pull: { dislikes: loggedInUserId } };
        logActionType = 'review_undislike';
      } else {
        update = { $addToSet: { dislikes: loggedInUserId }, $pull: { likes: loggedInUserId } };
        logActionType = 'review_dislike';
      }
    }
    const updatedReview = await Review.findByIdAndUpdate(reviewId, update, { new: true }).populate('userId', 'username profilePic').lean();
    await logActivity(loggedInUserId, logActionType, review.showId, { reviewId });

    const responseReview = {
      ...updatedReview, id: updatedReview._id.toString(), _id: updatedReview._id.toString(),
      username: updatedReview.userId?.username || "Anonymous", userProfilePic: updatedReview.userId?.profilePic,
      likes: updatedReview.likes.map(id => id.toString()),
      dislikes: updatedReview.dislikes.map(id => id.toString())
    };
    res.json(responseReview);
  } catch (error) {
    console.error('Review vote update error:', error);
    res.status(500).json({ error: 'Failed to update vote', details: error.message });
  }
});

app.get('/api/reviews/show/:showId', async (req, res) => {
  try {
    const { showId } = req.params;
    const reviews = await Review.find({ showId: showId })
      .populate('userId', 'username profilePic')
      .sort({ createdAt: -1 })
      .lean(); 

    const formattedReviews = reviews.map(r => ({
      ...r,
      id: r._id.toString(), 
      _id: r._id.toString(), 
      username: r.userId?.username || "Anonymous",
      userProfilePic: r.userId?.profilePic,
      likes: Array.isArray(r.likes) ? r.likes.map(id => id.toString()) : [], 
      dislikes: Array.isArray(r.dislikes) ? r.dislikes.map(id => id.toString()) : [], 
    }));

    res.json({ reviews: formattedReviews });
  } catch (error) {
    console.error(`Error fetching reviews for show ${req.params.showId}:`, error);
    res.status(500).json({ error: 'Failed to fetch show reviews', details: error.message });
  }
});

app.get('/api/user/reviews', authenticate, async (req, res) => {
  console.log(`[USER_REVIEWS_ROUTE] Request for user: ${req.currentUser?.username} (ID: ${req.currentUserId})`);
  try {
    const userId = req.currentUserId;
    if (!userId) {
      console.error("[USER_REVIEWS_ROUTE] Critical: currentUserId not found on req object!");
      return res.status(500).json({ error: 'User identification error.' });
    }

    const userReviews = await Review.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[USER_REVIEWS_ROUTE] Found ${userReviews.length} raw reviews for user ${userId}`);
    if (userReviews.length > 0) {
      console.log("[USER_REVIEWS_ROUTE] First raw review (check showId type):", JSON.stringify(userReviews[0], null, 2));
    }

    const reviewsWithShowDetails = await Promise.all(
      userReviews.map(async (review) => {
        let showIdToUse = review.showId || review.tmdbId || review.show_id;
        console.log(`[USER_REVIEWS_ROUTE] Processing review ${review._id}, original showId field value: ${showIdToUse}`);

        let showData = { name: 'Unknown Show (Processing Error)', poster_path: null };
        if (showIdToUse) {
          showData = await fetchShowDetailsFromTMDB(showIdToUse);
        } else {
          console.warn(`[USER_REVIEWS_ROUTE] No showId found for review ${review._id}`);
          showData.name = `Review ${review._id} (No Show ID)`;
        }

        return {
          ...review,
          id: review._id.toString(),
          _id: review._id.toString(),
          showName: showData.name,
          posterPath: showData.poster_path,
          likes: Array.isArray(review.likes) ? review.likes.map(id => id.toString()) : [],
          dislikes: Array.isArray(review.dislikes) ? review.dislikes.map(id => id.toString()) : [],
        };
      })
    );

    console.log(`[USER_REVIEWS_ROUTE] Returning ${reviewsWithShowDetails.length} reviews with details for ${req.currentUser?.username}.`);
    res.json(reviewsWithShowDetails);
  } catch (error) {
    console.error('[USER_REVIEWS_ROUTE] Critical error in route handler:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch user reviews', details: error.message });
  }
});

app.post('/api/users/mark-watched', authenticate, async (req, res) => {
  console.log(`[MARK_WATCHED] Received request body:`, JSON.stringify(req.body, null, 2));
  console.log(`[MARK_WATCHED] Request for user: ${req.currentUser?.username} (ID: ${req.currentUserId})`);
  const { showId, showName, posterPath, seasonNumber, episodes } = req.body;
  const userId = req.currentUserId;

  if (!showId || !showName || posterPath === undefined || !episodes || !Array.isArray(episodes) || episodes.length === 0) {
    console.warn("[MARK_WATCHED] Missing required fields or empty episodes array:", {
      showIdExists: !!showId,
      showNameExists: !!showName,
      posterPathDefined: posterPath !== undefined,
      posterPathValue: posterPath,
      episodesIsArray: Array.isArray(episodes),
      episodesCount: Array.isArray(episodes) ? episodes.length : 'N/A',
      seasonNumber
    });
    return res.status(400).json({ message: 'Missing required fields or no episodes selected for marking watched.' });
  }

  try {
    let userRecord = req.currentUser;
    let watchedHistory = userRecord.watchedHistory || [];
    const showIndex = watchedHistory.findIndex(item => item.showId === showId.toString());
    const newWatchedAt = new Date();

    if (showIndex > -1) {
      watchedHistory[showIndex].lastWatchedAt = newWatchedAt;
      const existingShowEpisodesById = new Map(watchedHistory[showIndex].episodes.map(ep => [ep.id.toString(), ep]));

      episodes.forEach(newEp => {
        const episodeToAddOrUpdate = {
          id: newEp.id,
          number: newEp.number,
          name: newEp.name,
          seasonNumber: seasonNumber,
          watchedAt: newWatchedAt
        };

        if (existingShowEpisodesById.has(newEp.id.toString())) {
          const epToUpdate = existingShowEpisodesById.get(newEp.id.toString());
          epToUpdate.watchedAt = newWatchedAt;
          if (epToUpdate.seasonNumber !== seasonNumber) epToUpdate.seasonNumber = seasonNumber;
        } else {
          watchedHistory[showIndex].episodes.push(episodeToAddOrUpdate);
        }
      });
    } else {
      watchedHistory.push({
        showId: showId.toString(),
        showName,
        posterPath,
        lastWatchedAt: newWatchedAt,
        episodes: episodes.map(ep => ({
          id: ep.id,
          number: ep.number,
          name: ep.name,
          seasonNumber: seasonNumber,
          watchedAt: newWatchedAt
        }))
      });
    }

    watchedHistory.sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));

    if (watchedHistory.length > 50) {
      watchedHistory = watchedHistory.slice(0, 50);
    }

    await userCollection.updateOne(
      { _id: userId },
      { $set: { watchedHistory: watchedHistory, updatedAt: new Date() } }
    );

    await logActivity(userId, 'mark_watched', showId.toString(), {
      episodeCount: episodes.length,
      season: seasonNumber
    });

    console.log(`[MARK_WATCHED] Successfully updated watched history for user ${userId}, show ${showId}`);
    res.status(200).json({ message: 'Watched status updated successfully.' });
  } catch (error) {
    console.error('[MARK_WATCHED] Error:', error);
    res.status(500).json({ message: 'Server error while updating watched status.', details: error.message });
  }
});

app.get('/api/users/recently-watched', authenticate, async (req, res) => {
  console.log(`[RECENTLY_WATCHED] Handler invoked for user: ${req.currentUser?.username} (ID: ${req.currentUserId})`);
  try {
    const userRecord = req.currentUser;

    if (!userRecord.watchedHistory || userRecord.watchedHistory.length === 0) {
      console.log(`[RECENTLY_WATCHED] No watched history for user ${userRecord?.username}`);
      return res.json([]);
    }

    const sortedWatchedHistory = [...userRecord.watchedHistory].sort((a, b) => {
      const dateA = a.lastWatchedAt ? new Date(a.lastWatchedAt) : new Date(0);
      const dateB = b.lastWatchedAt ? new Date(b.lastWatchedAt) : new Date(0);
      return dateB - dateA;
    });

    const recentlyWatched = sortedWatchedHistory.slice(0, 10).map(item => ({
      showId: item.showId,
      showName: item.showName,
      posterPath: item.posterPath,
      lastWatchedAt: item.lastWatchedAt,
    }));

    console.log(`[RECENTLY_WATCHED] Sending ${recentlyWatched.length} shows for ${userRecord?.username}.`);
    res.json(recentlyWatched);
  } catch (error) {
    console.error('[RECENTLY_WATCHED] Error processing request:', error);
    res.status(500).json({ error: 'Failed to fetch recently watched shows', details: error.message });
  }
});

app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await userCollection.findOne(
      { username },
      { projection: { username: 1, email: 1, profilePic: 1, createdAt: 1, watchedHistory: 1, watchlist: 1, _id: 1 } }
    );
    // ... (error handling if user not found) ...

    const userActivities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      user: { ...user, _id: user._id.toString() }, // Ensure _id is a string
      username: user.username,
      profilePic: user.profilePic || null,
      watchlist: user.watchlist || [],
      activities: userActivities, // This data is what RecentlyWatched will use
      _id: user._id.toString()
    });

  } catch (error) {
    console.error("Error fetching other user's profile:", error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
});

app.post('/api/upload-profile-image', authenticate, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const userId = req.currentUserId;
    const imageUrl = req.file.path;

    const result = await userCollection.updateOne(
      { _id: userId },
      { $set: { profilePic: imageUrl, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 1) {
      await logActivity(userId, 'profile_update', null, { field: 'profilePic' });
      return res.json({ success: true, imageUrl, message: 'Profile picture updated successfully' });
    } else if (result.matchedCount === 1 && result.modifiedCount === 0) {
      return res.json({ success: true, imageUrl, message: 'Profile picture is already up to date.' });
    } else {
      return res.status(404).json({ success: false, message: 'User not found or failed to update profile.' });
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture', error: error.message });
  }
});

app.get('/api/activities', authenticate, async (req, res) => {
  try {
    const userId = req.currentUserId; 

    const user = req.currentUser;

    const activities = await Activity.find({ userId: userId })
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

app.get('/api/users/:username/activities', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userCollection.findOne({ username }, { projection: { _id: 1 } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

app.get('/api/users/:username/reviews', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userCollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user._id;
    console.log(`Fetching reviews for user: ${username} (${userId})`);

    const userReviews = await Review.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${userReviews.length} reviews for user ${username}`);

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
          dislikes: Array.isArray(review.dislikes) ? review.dislikes : [],
          username: user.username
        };
      })
    );

    res.json(reviewsWithShowDetails);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/users/:username/watchlist', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userCollection.findOne(
      { username },
      { projection: { watchlist: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ watchlist: user.watchlist || [] });
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

app.get('/api/users/:username/reviews', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userCollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user._id;
    console.log(`Fetching reviews for user: ${username} (${userId})`);

    const userReviews = await Review.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${userReviews.length} reviews for user ${username}`);

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
          dislikes: Array.isArray(review.dislikes) ? review.dislikes : [],
          username: user.username
        };
      })
    );

    res.json(reviewsWithShowDetails);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/users/:username/watchlist', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userCollection.findOne(
      { username },
      { projection: { watchlist: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ watchlist: user.watchlist || [] });
  } catch (error) {
    console.error('Error fetching user watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

app.post('/api/logout', async (req, res) => {
  if (req.session && req.session.authenticated) {
    const userIdToLog = req.session.userId;
    const userEmailForLog = req.session.email;

    req.session.destroy(async (err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ success: false, message: 'Could not log out, please try again.' });
      }

      if (userIdToLog) {
        try {
          await logActivity(new mongoose.Types.ObjectId(userIdToLog), 'logout');
        } catch (logErr) {
          console.error("Error logging logout activity for userId:", userIdToLog, logErr);
        }
      } else if (userEmailForLog) {
        console.warn(`Logout for ${userEmailForLog}, but userId not in session for direct logging. Attempting lookup.`);
        try {
          const user = await userCollection.findOne({email: userEmailForLog}, {projection: {_id: 1}});
          if (user) {
            await logActivity(user._id, 'logout');
          } else {
            console.warn(`User with email ${userEmailForLog} not found for logout logging.`);
          }
        } catch (lookupErr) {
          console.error("Error fetching user by email for logout log:", lookupErr);
        }
      } else {
        console.warn("Logout occurred, but no user identifier in session for activity logging.");
      }
      
      res.clearCookie('connect.sid', { path: '/' });
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  } else {
    res.clearCookie('connect.sid', { path: '/' });
    return res.json({ success: true, message: 'No active session to log out from or already logged out' });
  }
});

app.post('/api/watchlist/add', authenticate, async (req, res) => {
  const { showId } = req.body;
  const userId = req.currentUserId;
  if (!showId) return res.status(400).json({ success: false, message: 'Missing show ID' });
  try {
    const result = await userCollection.updateOne({ _id: userId }, { $addToSet: { watchlist: showId.toString() } });
    if (result.modifiedCount === 0 && result.matchedCount === 1) {
      return res.status(200).json({ success: true, message: 'Already in watchlist' });
    } else if (result.modifiedCount === 1) {
      await logActivity(userId, 'watchlist_add', showId.toString());
      return res.json({ success: true, message: 'Added to watchlist' });
    }
    return res.status(404).json({ success: false, message: 'User not found or watchlist update failed' });
  } catch (err) {
    console.error("Error updating watchlist:", err);
    res.status(500).json({ success: false, message: 'Server error adding to watchlist' });
  }
});

app.post('/api/watchlist/remove', authenticate, async (req, res) => {
  const { showId } = req.body;
  const userId = req.currentUserId;

  if (!showId) {
    return res.status(400).json({ success: false, message: 'Missing show ID' });
  }

  try {
    const result = await userCollection.updateOne(
      { _id: userId },
      { $pull: { watchlist: showId } }
    );

    if (result.matchedCount === 0) {
      console.warn(`[WATCHLIST_REMOVE] User not found with ID: ${userId}, though authenticate passed.`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ success: true, message: 'Show was not in watchlist or already removed.' });
    }

    await logActivity(userId, 'watchlist_remove', showId.toString());
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) {
    console.error("Error removing from watchlist:", err);
    res.status(500).json({ success: false, message: 'Server error while removing from watchlist' });
  }
});

app.get('/api/watchlist', authenticate, async (req, res) => {
  try {
    const user = req.currentUser;
    if (!user.watchlist || user.watchlist.length === 0) return res.json([]);

    const watchlistDetails = await Promise.all(
      user.watchlist.map(async (showId) => {
        try {
          const tmdbUrl = `${tmdbBaseUrl}/tv/${showId}`;
          const response = await axios.get(tmdbUrl, { params: { api_key: tmdbApiKey }, timeout: 5000 });
          return {
            id: response.data.id, name: response.data.name, poster_path: response.data.poster_path,
            vote_average: response.data.vote_average, vote_count: response.data.vote_count,
            first_air_date: response.data.first_air_date
          };
        } catch (error) {
          console.warn(`TMDB fetch failed for watchlist item ${showId}:`, error.message);
          return { id: showId, name: `Show ID: ${showId} (Fetch Error)`, poster_path: null };
        }
      })
    );
    res.json(watchlistDetails.filter(Boolean));
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist", details: error.message });
  }
});

app.post('/api/chat', authenticate, async (req, res) => {
  try {
    if (!req.body || !req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('Invalid request format');
      return res.status(400).json({
        success: false,
        error: 'Invalid request format. Expected { messages: [] }'
      });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, error: 'Server AI configuration error.' });
    }
    const messages = req.body.messages.map(msg => ({ role: msg.role || 'user', content: msg.content || '' }));
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      { model: "gpt-3.5-turbo", messages: messages, max_tokens: 150, temperature: 0.7, },
      { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json', }, timeout: 10000 }
    );
    if (!response.data?.choices?.[0]?.message?.content) {
      return res.status(500).json({ success: false, error: 'Unexpected AI API response format.' });
    }
    return res.json({ success: true, reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Chat API error:', error.response ? error.response.data : error.message);
    if (error.response) return res.status(error.response.status || 502).json({ success: false, error: error.response.data.error?.message || 'AI service error.' });
    if (error.code === 'ECONNABORTED') return res.status(504).json({ success: false, error: 'AI Request timeout.' });
    return res.status(500).json({ success: false, error: 'Internal server error with AI chat.' });
  }
});

app.get('/api/average-rating', async (req, res) => {
  try {
    const { showId } = req.query;
    if (!showId) return res.status(400).json({ error: 'Show ID is required' });

    const result = await Review.aggregate([
      { $match: { showId: showId.toString() } },
      { $group: { _id: '$showId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);
    if (result.length === 0) return res.json({ averageRating: null, totalReviews: 0 });

    const { averageRating, totalReviews } = result[0];
    res.json({ averageRating: parseFloat(averageRating.toFixed(2)), totalReviews });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ error: 'Failed to calculate average rating', details: error.message });
  }
});

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });
}).catch(err => {
  console.error("❌ Failed to connect to MongoDB:", err);
  process.exit(1);
});