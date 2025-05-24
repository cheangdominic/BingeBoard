/**
 * @file Main server file for the BingeBoard application.
 * @description This file sets up an Express server, configures middleware (CORS, body parsing, session management),
 * connects to MongoDB (using both native driver and Mongoose), defines API routes for various functionalities
 * including user authentication, TMDB data fetching, reviews, watchlist, friend management, activity logging,
 * profile image uploads (using Cloudinary), and an AI chat feature. It also serves the frontend application.
 * @module server
 */

// Import dotenv for loading environment variables from a .env file
import dotenv from 'dotenv';
// Configure dotenv to load environment variables
dotenv.config();
// Import the Express framework
import express from 'express';
// Import express-session for session management
import session from 'express-session';
// Import connect-mongo to store Express sessions in MongoDB
import MongoStore from 'connect-mongo';
// Import Mongoose, an ODM library for MongoDB
import mongoose from 'mongoose';
// Import bcrypt for password hashing
import bcrypt from 'bcrypt';
// Import Joi for data validation
import Joi from 'joi';
// Import body-parser middleware to parse request bodies
import bodyParser from 'body-parser';
// Import cors middleware for enabling Cross-Origin Resource Sharing
import cors from 'cors';
// Import fileURLToPath to convert file URLs to path strings (for ES modules)
import { fileURLToPath } from 'url';
// Import path module for working with file and directory paths
import path from 'path';
// Import database connection utilities and collections
import { connectToDatabase, userCollection, database } from './databaseConnection.js';
// Import MongoClient and ObjectId from the mongodb driver
import { MongoClient, ObjectId } from 'mongodb';
// Import Mongoose models for Review, Activity, and User (though User model usage seems overridden by userCollection)
import { Review, Activity, User } from './utils.js';
// Import Cloudinary v2 SDK for image and video management
import { v2 as cloudinary } from 'cloudinary';
// Import multer for handling multipart/form-data, primarily used for file uploads
import multer from 'multer';
// Import CloudinaryStorage for multer to directly upload files to Cloudinary
import { CloudinaryStorage } from 'multer-storage-cloudinary';
// Import axios for making HTTP requests (e.g., to TMDB API, OpenAI API)
import axios from 'axios';
// Import 'use' from 'react', its purpose in this backend context is unclear and might be unused or a remnant.
import { use } from 'react';
// Import the router for friend-related API endpoints
import friendsRouter from './friends.js';

// Get the current file's path (ES module equivalent of __filename)
const __filename = fileURLToPath(import.meta.url);
// Get the current directory's path (ES module equivalent of __dirname)
const __dirname = path.dirname(__filename);

// Create an Express application instance
const app = express();
// Define the port the server will listen on, from environment variables or default to 3001
const port = process.env.PORT || 3001;

// Log server startup with a timestamp for version tracking
console.log("--- SERVER.JS IS RUNNING (Version Timestamp: " + new Date().toISOString() + ") ---");

// Define the number of salt rounds for bcrypt password hashing
const saltRounds = 12;
// Define the session expiration time (24 hours in milliseconds)
const expireTime = 24 * 60 * 60 * 1000; // 1 day

// Configure CORS (Cross-Origin Resource Sharing) middleware
app.use(cors({
  /**
   * Determines if a given origin is allowed.
   * @param {string} origin - The origin of the request.
   * @param {function} callback - The callback function (err, allow) to indicate if origin is allowed.
   */
  origin: (origin, callback) => {
    // List of allowed origins, including environment variable for frontend URL
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000','https://bingeboard-4zzn.onrender.com', '/^https?://localhost(:\d+)?$/', process.env.FRONTEND_URL].filter(Boolean);
    // Allow requests with no origin (like mobile apps or curl requests) or if origin is in the allowed list
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      // Log and block requests from non-allowed origins
      console.warn(`CORS: Blocked origin - ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  // Allow credentials (cookies, authorization headers, etc.) to be sent with requests
  credentials: true
}));

// Use body-parser middleware to parse incoming JSON request bodies
app.use(bodyParser.json());
// Use Express middleware to parse URL-encoded request bodies (with extended: false, uses querystring library)
app.use(express.urlencoded({ extended: false }));

// Configure Cloudinary SDK with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure CloudinaryStorage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // The configured Cloudinary instance
  params: {
    folder: 'profile_pics', // The folder in Cloudinary where files will be stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed image formats
  },
});

// Initialize Multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

// Retrieve MongoDB connection details from environment variables
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE; // Database name for Mongoose/main app data
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET; // Secret for encrypting session data in MongoStore
const node_session_secret = process.env.NODE_SESSION_SECRET; // Secret for signing the session ID cookie

// Retrieve TMDB API key and base URL from environment variables
const tmdbApiKey = process.env.VITE_TMDB_API_KEY;
const tmdbBaseUrl = process.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'; // Default TMDB API base URL

// Log TMDB API key status
console.log(`TMDB API Key Loaded: ${tmdbApiKey ? 'Yes (first few chars: ' + String(tmdbApiKey).substring(0, 5) + '...)' : 'NO!!! KEY IS MISSING!'}`);
// Log TMDB base URL
console.log(`TMDB Base URL: ${tmdbBaseUrl}`);

// Construct the MongoDB connection URI for Mongoose
const mongooseURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}?retryWrites=true&w=majority`;

// Connect Mongoose to the MongoDB cluster
mongoose.connect(mongooseURI, {
  serverSelectionTimeoutMS: 30000, // Timeout after 30s for server selection
  socketTimeoutMS: 45000, // Timeout after 45s for socket inactivity
}).then(() => {
  // Log successful Mongoose connection
  console.log('Mongoose connected to DB cluster');
}).catch(err => {
  // Log Mongoose connection error and exit the process
  console.error('Mongoose connection error:', err);
  process.exit(1);
});

// Create a MongoStore instance for storing sessions in MongoDB
const mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions?retryWrites=true&w=majority`, // Separate collection/DB for sessions
  crypto: {
    secret: mongodb_session_secret // Secret used to encrypt session data in the store
  },
  ttl: expireTime / 1000, // Session time-to-live in seconds (matches cookie maxAge)
});

// Trust the first proxy, necessary if the app is behind a reverse proxy (e.g., Heroku, Nginx) for secure cookies
app.set('trust proxy', 1);

// Event listener for Mongoose connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB cluster'); // Duplicate log, but harmless
});

// Configure and use express-session middleware
app.use(session({
  secret: node_session_secret, // Secret used to sign the session ID cookie
  store: mongoStore, // Use MongoStore for session persistence
  saveUninitialized: false, // Don't save new sessions that haven't been modified
  resave: false, // Don't force session save if not modified
  cookie: {
    secure: true, // Ensures cookie is sent only over HTTPS (requires 'trust proxy' if behind proxy)
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    sameSite: 'none', // Allows cross-site cookie sending (necessary for some OAuth flows or if frontend/backend are on different domains with 'secure: true')
    maxAge: expireTime // Cookie expiration time in milliseconds
  }
}));

// Mount the friendsRouter for all routes starting with /api/friends
app.use('/api/friends', friendsRouter);

/**
 * @route GET /api/users
 * @description Searches for users by username or email.
 * Returns exact matches and similar (case-insensitive regex) matches separately.
 * @param {string} req.query.search - The search term for username or email.
 * @returns {object} JSON response:
 *  - `{ exactMatches: Array<User>, similarMatches: Array<User> }` on success.
 *  - `{ success: false, message: string }` on failure (e.g., missing search query, server error).
 * @async
 */
app.get('/api/users', async (req, res) => {
  // Extract search query from request query parameters
  const { search } = req.query;

  // If search query is missing, return a 400 Bad Request error
  if (!search) {
    return res.status(400).json({ success: false, message: 'Search query is required' });
  }

  try {
    // Find users with exact matches for username or email
    const exactMatches = await userCollection.find({
      $or: [
        { username: search },
        { email: search }
      ]
    }).toArray();

    // Find users with similar (case-insensitive regex) matches for username or email
    const similarMatches = await userCollection.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).toArray();

    // Filter out users from similarMatches that are already in exactMatches
    const filteredSimilarMatches = similarMatches.filter(
      (user) => !exactMatches.some((exactUser) => exactUser._id.toString() === user._id.toString())
    );

    // Respond with both exact and filtered similar matches
    res.json({ exactMatches, similarMatches: filteredSimilarMatches });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching users fails
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

/**
 * @middleware authenticate
 * @description Middleware to authenticate users based on session data.
 * Checks if the session is authenticated and contains valid user email and ID.
 * Fetches the user from the database and attaches `currentUser` and `currentUserId` to the `req` object.
 * @param {object} req - Express request object. Expected to have `req.session`.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void|object} Calls `next()` on successful authentication, or sends a JSON error response (401 or 500).
 * @async
 */
const authenticate = async (req, res, next) => {
  // Log authentication attempt details
  console.log(`[AUTH MIDDLEWARE] Path: ${req.path}, Method: ${req.method}`);
  console.log(`[AUTH MIDDLEWARE] Session ID: ${req.sessionID}, Authenticated: ${req.session.authenticated}, Email: ${req.session.email}, UserID: ${req.session.userId}`);

  // Check if session is authenticated and essential user info is present
  if (!req.session.authenticated || !req.session.email || !req.session.userId) {
    console.warn('[AUTH MIDDLEWARE] Unauthorized: Session not authenticated, email, or userId missing.');
    return res.status(401).json({ error: 'Unauthorized: Please log in.' });
  }

  try {
    // Critical check for userCollection initialization
    if (!userCollection) {
      console.error("[AUTH MIDDLEWARE] CRITICAL: userCollection is not initialized!");
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    console.log(`[AUTH MIDDLEWARE] Attempting to find user with ID from session: ${req.session.userId}`);
    let userObjectId;
    try {
      // Convert session userId string to MongoDB ObjectId
      userObjectId = new ObjectId(req.session.userId);
    } catch (idError) {
      // Handle invalid ObjectId format in session
      console.error("[AUTH MIDDLEWARE] Invalid session.userId format for ObjectId:", req.session.userId, idError);
      // Destroy the invalid session
      req.session.destroy((destroyErr) => {
        if (destroyErr) console.error("[AUTH MIDDLEWARE] Error destroying session on invalid userId:", destroyErr);
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid session data. Please log in again.' });
    }

    // Find the user in the database using the ObjectId
    const userDoc = await userCollection.findOne({ _id: userObjectId });

    // If user is not found in the database, invalidate the session
    if (!userDoc) {
      console.warn(`[AUTH MIDDLEWARE] User not found in DB for session userId: ${req.session.userId} (email: ${req.session.email}). Invalidating session.`);
      req.session.destroy(err => {
        if (err) console.error("[AUTH MIDDLEWARE] Error destroying invalid session:", err);
        else console.log("[AUTH MIDDLEWARE] Invalid session destroyed.");
      });
      return res.status(401).json({ error: 'Unauthorized: User session invalid. Please log in again.' });
    }

    // Attach user document and user ID to the request object for subsequent handlers
    req.currentUser = userDoc;
    req.currentUserId = userDoc._id;

    // Log successful authentication and proceed to the next middleware/handler
    console.log(`[AUTH MIDDLEWARE] User ${userDoc.username} (ID: ${userDoc._id}) authenticated for path ${req.path}. Proceeding...`);
    next();
  } catch (error) {
    // Handle unexpected errors during the authentication process
    console.error('[AUTH MIDDLEWARE] Unexpected error during user lookup:', error);
    return res.status(500).json({ error: 'Internal server error during authentication process.' });
  }
};

/**
 * Fetches TV show details from The Movie Database (TMDB) API.
 * @async
 * @function fetchShowDetailsFromTMDB
 * @param {string|number} showIdInput - The ID of the TV show to fetch from TMDB.
 * @returns {Promise<object>} A promise that resolves to an object containing the show's name and poster path.
 *  - `{ name: string, poster_path: string | null }` on success.
 *  - `{ name: string (error message), poster_path: null }` on failure (e.g., invalid ID, API key missing, TMDB error).
 */
async function fetchShowDetailsFromTMDB(showIdInput) {
  // Convert showIdInput to string for consistent handling
  const showId = String(showIdInput);

  // Validate showId
  if (!showId || showId === "null" || showId === "undefined") {
    console.warn('[FETCH_TMDB] Attempted to fetch show details with invalid or empty ID:', showIdInput);
    return { name: `Unknown Show (ID: ${showIdInput})`, poster_path: null };
  }

  // Check if TMDB API key is available
  if (!tmdbApiKey) {
    console.error('[FETCH_TMDB] CRITICAL: TMDB_API_KEY is missing in environment variables!');
    return { name: `Show #${showId} (API Key Missing)`, poster_path: null };
  }

  console.log(`[FETCH_TMDB] Fetching details for show ID: ${showId}`);
  // Construct the request URL for TMDB API
  const requestUrl = `${tmdbBaseUrl}/tv/${showId}`;
  // Configure axios request
  const axiosConfig = {
    params: { api_key: tmdbApiKey }, // API key as a query parameter
    timeout: 8000, // Request timeout of 8 seconds
    headers: { 'Accept': 'application/json' } // Specify accepted response format
  };

  try {
    console.log(`[FETCH_TMDB] Requesting URL: ${requestUrl} with key: ${tmdbApiKey.substring(0, 5)}...`);
    // Make the GET request to TMDB API
    const tvRes = await axios.get(requestUrl, axiosConfig);

    // Check if response contains show name
    if (tvRes.data && (tvRes.data.name || tvRes.data.original_name)) {
      console.log(`[FETCH_TMDB] Success for ID ${showId}: ${tvRes.data.name || tvRes.data.original_name}`);
      return {
        name: tvRes.data.name || tvRes.data.original_name, // Use name or original_name
        poster_path: tvRes.data.poster_path // Poster path
      };
    }
    // Warn if no name is found in the response
    console.warn(`[FETCH_TMDB] No name in TMDB response for ID ${showId}. Data:`, tvRes.data);
    return { name: `Show #${showId} (Name Missing)`, poster_path: tvRes.data?.poster_path || null };

  } catch (tvErr) {
    // Log detailed error information if TMDB request fails
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

/**
 * Logs a user activity to the database.
 * Fetches show details from TMDB if the activity is related to a show and `targetId` is provided.
 * Fetches user profile picture if the activity is 'profile_update'.
 * @async
 * @function logActivity
 * @param {ObjectId|string} userId - The ID of the user performing the action.
 * @param {string} action - The type of action performed (e.g., 'review_create', 'login').
 * @param {string|ObjectId|null} [targetId=null] - The ID of the target entity (e.g., show ID, review ID), if applicable.
 * @param {object} [details={}] - Additional details about the activity.
 * @returns {Promise<void>} A promise that resolves when the activity is logged or fails silently on error.
 */
async function logActivity(userId, action, targetId = null, details = {}) {
  try {
    // For actions related to shows, fetch show details to enrich the log
    if (['review_create', 'review_like', 'review_dislike', 'watchlist_add', 'watchlist_remove', 'mark_watched'].includes(action)) {
      if (targetId) {
        const showDetails = await fetchShowDetailsFromTMDB(targetId.toString());
        details.showName = showDetails.name;
        details.showImage = showDetails.poster_path ? `https://image.tmdb.org/t/p/w500${showDetails.poster_path}` : "https://via.placeholder.com/300x450";
      } else if (!['profile_update', 'login', 'logout', 'account_creation'].includes(action)) {
        // Warn if targetId is missing for actions that usually require it
        console.warn(`[LOG_ACTIVITY] Target ID missing for relevant action: ${action}`);
      }
    }
    // For profile updates, include the (new) profile photo URL in details
    if (action === 'profile_update') {
      const userToLog = await userCollection.findOne({ _id: new ObjectId(userId) });
      if (userToLog) details.profilePhoto = userToLog.profilePic || '';
    }
    // Create a new Activity document using the Mongoose model
    const activity = new Activity({
      userId: new ObjectId(userId), // Ensure userId is an ObjectId
      action,
      targetId: targetId ? targetId.toString() : null, // Store targetId as string
      details,
    });
    // Save the activity to the database
    await activity.save();
    console.log(`[LOG_ACTIVITY] Logged: User ${userId}, Action ${action}, Target ${targetId || 'N/A'}`);
  } catch (error) {
    // Log errors during activity logging but don't let it crash the main operation
    console.error('[LOG_ACTIVITY] Failed:', { message: error.message, userId, action, targetId });
  }
}

// Serve static files from the '../../dist' directory (typically the frontend build output)
app.use(express.static(path.join(__dirname, '../../dist')));

/**
 * @route POST /api/signup
 * @description Registers a new user.
 * Validates input, checks for existing user, hashes password, and stores user in the database.
 * Logs 'account_creation' activity.
 * @param {object} req.body - Expected properties: `username`, `email`, `password`.
 * @returns {object} JSON response:
 *  - `{ success: true, message: "Account created successfully" }` on success (201).
 *  - `{ success: false, message: string }` on failure (400 for validation/existing user, 500 for server error).
 * @async
 */
app.post('/api/signup', async (req, res) => {
  // Check if userCollection is available
  if (!userCollection) return res.status(500).json({ success: false, message: 'Database not connected' });
  // Destructure user details from request body
  const { username, email, password } = req.body;
  // Basic check for required fields
  if (!username || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });

  // Define Joi schema for input validation
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required()
  });
  // Validate request body against the schema
  const validationResult = schema.validate({ username, email, password });
  if (validationResult.error) return res.status(400).json({ success: false, message: validationResult.error.details[0].message });

  try {
    // Check if a user with the same username or email already exists
    const existingUser = await userCollection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username or email already exists' });

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert the new user into the database
    const insertResult = await userCollection.insertOne({
      username: username,
      email: email,
      password: hashedPassword,
      watchlist: [], // Initialize empty watchlist
      profilePic: '', // Initialize empty profile picture URL
      friends: [], // Initialize empty friends list
      friendRequestsSent: [], // Initialize empty sent friend requests list
      friendRequestsRecieved: [], // Initialize empty received friend requests list
	  createdAt: new Date(), // Record creation timestamp
	  updatedAt: new Date() // Record update timestamp
    });

    // If user insertion was successful, log activity and respond
    if (insertResult.insertedId) {
      await logActivity(insertResult.insertedId, 'account_creation');
      return res.status(201).json({ success: true, message: "Account created successfully" });
    }
    // Throw error if insertion failed for some reason
    throw new Error("User insertion failed");
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if signup fails
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

/**
 * @route POST /api/login
 * @description Logs in an existing user.
 * Validates input, finds user by email, compares hashed password, and establishes a session.
 * Logs 'login' activity.
 * @param {object} req.body - Expected properties: `email`, `password`.
 * @returns {object} JSON response:
 *  - `{ success: true, message: "Logged in successfully", user: object }` on success. `user` object contains `_id`, `username`, `email`, `profilePic`.
 *  - `{ success: false, message: string }` on failure (400 for missing fields, 401 for auth failure, 500 for server error).
 * @async
 */
app.post('/api/login', async (req, res) => {
  // Check if userCollection is available
  if (!userCollection) return res.status(500).json({ success: false, message: 'Database not connected' });
  // Destructure email and password from request body
  const { email, password } = req.body;
  // Basic check for required fields
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });

  try {
    // Find the user by email
    const user = await userCollection.findOne({ email: email });
    // If user not found, return 401 Unauthorized
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    // Compare provided password with the hashed password in the database
    if (await bcrypt.compare(password, user.password)) {
      // If passwords match, set session properties
      req.session.authenticated = true;
      req.session.email = user.email;
      req.session.userId = user._id.toString(); // Store user ID as string in session
      req.session.cookie.maxAge = expireTime; // Reset cookie expiration time

      // Save the session
      req.session.save(async (err) => {
        if (err) {
          // Handle session save error
          console.error("Session save error on login:", err);
          return res.status(500).json({ success: false, message: 'Login failed during session save' });
        }
        try {
          // Log the login activity
          await logActivity(user._id, 'login');
        } catch (logError) {
          // Log error if activity logging fails, but don't fail the login
          console.error("Error logging login activity:", logError);
        }
        // Log successful login and respond
        console.log(`User ${user.username} logged in. Session ID: ${req.sessionID}`);
        return res.json({ success: true, message: "Logged in successfully", user: { _id: user._id.toString(), username: user.username, email: user.email, profilePic: user.profilePic } });
      });
    } else {
      // If passwords don't match, return 401 Unauthorized
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if login fails
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

/**
 * @route GET /api/user
 * @description Fetches the currently authenticated user's details (excluding password).
 * Uses the `authenticate` middleware.
 * @param {object} req - Express request object, `req.currentUser` is populated by `authenticate` middleware.
 * @returns {object} JSON response containing user details (e.g., `_id`, `username`, `email`, `profilePic`, etc.).
 * @async
 */
app.get('/api/user', authenticate, (req, res) => {
  // Destructure password from currentUser and spread the rest into userWithoutPassword
  const { password, ...userWithoutPassword } = req.currentUser;
  // Respond with user details, ensuring _id is a string
  res.json({ ...userWithoutPassword, _id: userWithoutPassword._id.toString() });
});

/**
 * @route GET /api/getUserInfo
 * @description Fetches specific information about the currently authenticated user.
 * Used by frontend to get essential user data like username, profile picture, watchlist.
 * Uses the `authenticate` middleware.
 * @param {object} req - Express request object, `req.currentUser` is populated by `authenticate` middleware.
 * @returns {object} JSON response:
 *  - `{ success: true, username: string, profilePic: string|null, watchlist: Array, email: string, _id: string }` on success.
 * @async
 */
app.get('/api/getUserInfo', authenticate, (req, res) => {
  // Respond with selected user information
  res.json({
    success: true,
    username: req.currentUser.username,
    profilePic: req.currentUser.profilePic || null, // Profile picture URL or null
    watchlist: req.currentUser. watchlist || [], // User's watchlist or empty array
    email: req.currentUser.email,
    _id: req.currentUser._id.toString() // User ID as string
  });
});

/**
 * @route GET /api/reviews
 * @description Fetches reviews, optionally filtered by showId or userId, with sorting and pagination.
 * Populates user details (username, profilePic) for each review.
 * @param {string} [req.query.showId] - ID of the show to filter reviews by.
 * @param {string} [req.query.sort='latest'] - Sort order ('latest', 'popular', 'relevant').
 * @param {string} [req.query.userId] - ID of the user to filter reviews by.
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=10] - Number of reviews per page.
 * @returns {object} JSON response:
 *  - `{ reviews: Array<Review>, currentPage: number, totalPages: number, totalReviews: number }` on success.
 *  - `{ error: string, details?: string }` on failure (500 for server error).
 * @async
 */
app.get('/api/reviews', async (req, res) => {
  try {
    // Destructure query parameters with default values
    const { showId, sort = 'latest', userId, page = 1, limit = 10 } = req.query;
    // Parse page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    // Initialize query object for Mongoose
    let query = {};
    if (showId) query.showId = showId.toString(); // Filter by showId if provided
    if (userId) query.userId = new ObjectId(userId); // Filter by userId if provided (convert to ObjectId)

    // Define sort options based on 'sort' query parameter
    let sortOptions = { createdAt: -1 }; // Default: latest first
    if (sort === 'popular') sortOptions = { likesCount: -1, createdAt: -1 }; // Popular: most likes, then latest
    if (sort === 'relevant') sortOptions = { rating: -1, createdAt: -1 }; // Relevant: highest rating, then latest

    // Fetch reviews from database with query, sort, skip, and limit
    const reviews = await Review.find(query)
      .sort(sortOptions).skip(skip).limit(limitNum)
      .populate('userId', 'username profilePic') // Populate user details
      .lean(); // Use .lean() for plain JavaScript objects
    // Count total number of reviews matching the query (for pagination)
    const totalReviews = await Review.countDocuments(query);

    // Format reviews for response
    const formattedReviews = reviews.map(r => ({
      ...r, id: r._id.toString(), _id: r._id.toString(), // Ensure _id and id are strings
      username: r.userId?.username || "Anonymous", // Use populated username or "Anonymous"
      userProfilePic: r.userId?.profilePic, // Use populated profile picture
      likes: Array.isArray(r.likes) ? r.likes.map(id => id.toString()) : [], // Ensure likes are string IDs
      dislikes: Array.isArray(r.dislikes) ? r.dislikes.map(id => id.toString()) : [], // Ensure dislikes are string IDs
    }));
    // Respond with formatted reviews and pagination info
    res.json({ reviews: formattedReviews, currentPage: pageNum, totalPages: Math.ceil(totalReviews / limitNum), totalReviews });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching reviews fails
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
  }
});

/**
 * @route POST /api/reviews
 * @description Creates a new review for a show.
 * Requires authentication. Validates input data.
 * Logs 'review_create' activity.
 * @param {object} req.body - Expected properties: `rating` (number 0-5), `content` (string), `containsSpoiler` (boolean), `showId` (string).
 * @param {object} req - Express request object, `req.currentUser` is populated by `authenticate` middleware.
 * @returns {object} JSON response:
 *  - The created and populated review object on success (201).
 *  - `{ error: string, details?: string }` on failure (400 for validation, 500 for server error).
 * @async
 */
app.post('/api/reviews', authenticate, async (req, res) => {
  try {
    // Destructure review data from request body
    const { rating, content, containsSpoiler, showId } = req.body;
    // Get logged-in user from `req.currentUser` (set by `authenticate` middleware)
    const loggedInUser = req.currentUser;
    // Validate required fields
    if (!showId || content === undefined || rating === undefined) {
      return res.status(400).json({ error: 'Missing required fields: showId, content, and rating are required' });
    }
    // Validate rating value
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating value. Must be between 0 and 5.' });
    }
    // Prepare review data object
    const reviewData = {
      showId: showId.toString(), userId: loggedInUser._id, username: loggedInUser.username, // Store username denormalized, though populate is used later
      rating, content, containsSpoiler: !!containsSpoiler, // Ensure containsSpoiler is boolean
      likes: [], dislikes: [], createdAt: new Date() // Initialize likes, dislikes, and timestamp
    };
    // Create a new Review document
    const review = new Review(reviewData);
    // Save the review to the database
    const savedReview = await review.save();
    // Populate user details for the saved review
    const populatedReview = await Review.findById(savedReview._id).populate('userId', 'username profilePic').lean();
    // Format the review for response
    const formattedReview = {
      ...populatedReview, id: populatedReview._id.toString(), _id: populatedReview._id.toString(),
      username: populatedReview.userId?.username || "Anonymous", userProfilePic: populatedReview.userId?.profilePic,
      likes: [], dislikes: [] // Ensure likes/dislikes are initialized as empty arrays in response for a new review
    };
    // Log the review creation activity
    await logActivity(loggedInUser._id, 'review_create', showId.toString(), { rating, contentSummary: content.substring(0, 50) });
    // Respond with the created review (201 Created)
    return res.status(201).json(formattedReview);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if review creation fails
    console.error('Review creation error:', error);
    return res.status(500).json({ error: 'Database operation failed creating review', details: error.message });
  }
});

/**
 * @route GET /api/reviews/most-liked
 * @description Fetches a list of the most liked reviews.
 * Reviews are augmented with show details (name, poster) from TMDB and user details.
 * @param {number} [req.query.limit=8] - The maximum number of most liked reviews to return.
 * @returns {object} JSON response:
 *  - `{ reviews: Array<ReviewWithShowDetails> }` on success. `ReviewWithShowDetails` includes review data, user data, and TMDB show data.
 *  - `{ error: string, details?: string }` on failure (500 for server or TMDB API error).
 * @async
 */
app.get('/api/reviews/most-liked', async (req, res) => {
  try {
    // Check if TMDB API key is configured
    if (!tmdbApiKey) {
      console.error('TMDB API key is not configured in server.js global scope for /api/reviews/most-liked.');
      return res.status(500).json({ error: 'TMDB API key not configured on server.' });
    }

    // Get limit from query parameters, default to 8
    const { limit = 8 } = req.query;

    // Aggregate pipeline to find most liked reviews
    const mostLikedReviews = await Review.aggregate([
      {
        // Add a field 'likesCount' representing the number of likes
        $addFields: {
          likesCount: { $size: "$likes" }
        }
      },
      // Sort by likesCount descending, then by creation date descending
      { $sort: { likesCount: -1, createdAt: -1 } },
      // Limit the number of results
      { $limit: parseInt(limit) },
      {
        // Lookup user details from the 'users' collection
        $lookup: {
          from: "users", // The name of the users collection in MongoDB
          localField: "userId",
          foreignField: "_id",
          as: "user" // Output array field
        }
      },
      // Deconstruct the 'user' array (assuming one user per review)
      { $unwind: "$user" }
    ]);

    // Format reviews and fetch show details from TMDB for each
    const formattedReviews = await Promise.all(
      mostLikedReviews.map(async (review) => {
        let showData = { name: 'Unknown Show', poster_path: null };

        // If review has a showId, fetch details from TMDB
        if (review.showId) {
          try {
            const tmdbUrl = `${tmdbBaseUrl}/tv/${review.showId}`;
            // Make request to TMDB API
            const response = await axios.get(tmdbUrl, {
              params: { api_key: tmdbApiKey },
              timeout: 5000 // 5-second timeout for TMDB request
            });

            // If TMDB response has data, update showData
            if (response.data) {
              showData.name = response.data.name || response.data.original_name || 'Unknown Show';
              showData.poster_path = response.data.poster_path;
            }
          } catch (apiError) {
            // Log error if TMDB fetch fails for a specific show
            console.error(`Failed to fetch show details for ID ${review.showId}:`, apiError.message);
            showData.name = `Show ID: ${review.showId} (Fetch Error)`;
          }
        }

        // Return formatted review object
        return {
          ...review,
          id: review._id.toString(), // Ensure ID is a string
          userProfilePic: review.user?.profilePic || "/img/profilePhotos/generic_profile_picture.jpg", // User profile pic or default
          username: review.user?.username, // Username
          showName: showData.name, // Show name from TMDB
          posterPath: showData.poster_path,  // Show poster path from TMDB
          showImage: showData.poster_path // Full URL for show image
            ? `https://image.tmdb.org/t/p/w500${showData.poster_path}`
            : "https://via.placeholder.com/300x450", // Placeholder if no image
          likes: Array.isArray(review.likes) ? review.likes.map(id => id.toString()) : [], // Ensure likes are string IDs
          dislikes: Array.isArray(review.dislikes) ? review.dislikes.map(id => id.toString()) : [] // Ensure dislikes are string IDs
        };
      })
    );

    // Respond with the formatted reviews
    res.json({ reviews: formattedReviews });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching most liked reviews fails
    console.error('Error fetching most liked reviews:', error);
    res.status(500).json({ error: 'Failed to fetch most liked reviews', details: error.message });
  }
});

/**
 * @route GET /api/show/:id
 * @description Fetches detailed information about a specific show (TV or movie) from TMDB.
 * Appends credits, videos, and external IDs to the TMDB response.
 * @param {string} req.params.id - The TMDB ID of the show/movie.
 * @param {string} [req.query.type='tv'] - The type of media ('tv' or 'movie').
 * @returns {object} JSON response:
 *  - TMDB API response data on success.
 *  - `{ error: string, details?: string }` on failure (500 for TMDB API key missing or TMDB error, or specific TMDB status).
 * @async
 */
app.get('/api/show/:id', async (req, res) => {
  try {
    // Get show ID from route parameters
    const { id } = req.params;
    // Get TMDB API key from environment variables
    const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
    // Check if API key is configured
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB API key not configured.' });
    }
    // Determine show type (tv or movie) from query parameter, default to 'tv'
    const showType = req.query.type || 'tv';
    // Construct TMDB API URL
    const url = `https://api.themoviedb.org/3/${showType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,external_ids`;
    // Make GET request to TMDB API
    const response = await axios.get(url);
    // Respond with data from TMDB
    res.json(response.data);
  } catch (error) {
    // Log and handle errors during TMDB fetch
    console.error(`Error fetching show details for ID ${req.params.id}:`, error.message);
    if (error.response) {
      // If TMDB returns an error, forward its status and data
      return res.status(error.response.status).json({
        error: `Failed to fetch show details from TMDB: ${error.response.statusText}`,
        details: error.response.data
      });
    }
    // Generic server error if TMDB request fails for other reasons
    res.status(500).json({ error: 'Failed to fetch show details', details: error.message });
  }
});

/**
 * @route PUT /api/reviews/:id
 * @description Likes or dislikes a review.
 * Requires authentication. Prevents users from voting on their own reviews.
 * Toggles like/dislike status (e.g., liking a disliked review removes dislike and adds like).
 * Logs 'review_like', 'review_dislike', 'review_unlike', or 'review_undislike' activity.
 * @param {string} req.params.id - The ID of the review to vote on.
 * @param {object} req.body - Expected property: `action` ('like' or 'dislike').
 * @param {object} req - Express request object, `req.currentUserId` populated by `authenticate` middleware.
 * @returns {object} JSON response:
 *  - The updated and populated review object on success.
 *  - `{ error: string }` on failure (400 for invalid input, 403 for self-vote, 404 if review not found, 500 for server error).
 * @async
 */
app.put('/api/reviews/:id', authenticate, async (req, res) => {
  try {
    // Get review ID from route parameters
    const reviewId = req.params.id;
    // Get action (like/dislike) from request body
    const { action } = req.body;
    // Get logged-in user's ID from `req.currentUserId`
    const loggedInUserId = req.currentUserId;

    // Validate review ID format
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).json({ error: 'Invalid review ID format' });
    // Validate action type
    if (!['like', 'dislike'].includes(action)) return res.status(400).json({ error: 'Invalid action.' });

    // Find the review by ID
    const review = await Review.findById(reviewId);
    // If review not found, return 404
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    // Prevent user from voting on their own review
    if (review.userId.equals(loggedInUserId)) return res.status(403).json({ error: 'You cannot vote on your own review.' });

    // Convert user ID to string for comparison with array elements
    const userIdStr = loggedInUserId.toString();
    // Check if user has already liked or disliked the review
    const alreadyLiked = review.likes.map(id => id.toString()).includes(userIdStr);
    const alreadyDisliked = review.dislikes.map(id => id.toString()).includes(userIdStr);
    // Initialize update object for MongoDB and activity log type
    let update = {};
    let logActionType = '';

    // Logic for 'like' action
    if (action === 'like') {
      if (alreadyLiked) {
        // If already liked, remove like (unlike)
        update = { $pull: { likes: loggedInUserId } };
        logActionType = 'review_unlike';
      } else {
        // If not liked (or disliked), add like and remove dislike if present
        update = { $addToSet: { likes: loggedInUserId }, $pull: { dislikes: loggedInUserId } };
        logActionType = 'review_like';
      }
    } else if (action === 'dislike') { // Logic for 'dislike' action
      if (alreadyDisliked) {
        // If already disliked, remove dislike (undislike)
        update = { $pull: { dislikes: loggedInUserId } };
        logActionType = 'review_undislike';
      } else {
        // If not disliked (or liked), add dislike and remove like if present
        update = { $addToSet: { dislikes: loggedInUserId }, $pull: { likes: loggedInUserId } };
        logActionType = 'review_dislike';
      }
    }
    // Update the review in the database and get the updated document
    const updatedReview = await Review.findByIdAndUpdate(reviewId, update, { new: true }).populate('userId', 'username profilePic').lean();
    // Log the vote activity
    await logActivity(loggedInUserId, logActionType, review.showId, { reviewId });

    // Format the updated review for response
    const responseReview = {
      ...updatedReview, id: updatedReview._id.toString(), _id: updatedReview._id.toString(),
      username: updatedReview.userId?.username || "Anonymous", userProfilePic: updatedReview.userId?.profilePic,
      likes: updatedReview.likes.map(id => id.toString()), // Ensure likes are string IDs
      dislikes: updatedReview.dislikes.map(id => id.toString()) // Ensure dislikes are string IDs
    };
    // Respond with the updated review
    res.json(responseReview);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if vote update fails
    console.error('Review vote update error:', error);
    res.status(500).json({ error: 'Failed to update vote', details: error.message });
  }
});

/**
 * @route GET /api/reviews/show/:showId
 * @description Fetches all reviews for a specific show, sorted by creation date.
 * Populates user details (username, profilePic) for each review.
 * @param {string} req.params.showId - The ID of the show.
 * @returns {object} JSON response:
 *  - `{ reviews: Array<ReviewWithUserDetails> }` on success.
 *  - `{ error: string, details?: string }` on failure (500 for server error).
 * @async
 */
app.get('/api/reviews/show/:showId', async (req, res) => {
  try {
    // Get show ID from route parameters
    const { showId } = req.params;
    // Find reviews for the given showId, populate user details, sort by newest first
    const reviews = await Review.find({ showId: showId })
      .populate('userId', 'username profilePic') // Populate user's username and profile picture
      .sort({ createdAt: -1 }) // Sort by creation date, descending
      .lean(); // Use .lean() for plain JavaScript objects

    // Format reviews for response
    const formattedReviews = reviews.map(r => ({
      ...r,
      id: r._id.toString(), // Ensure id is string
      _id: r._id.toString(), // Ensure _id is string
      username: r.userId?.username || "Anonymous", // Use populated username or "Anonymous"
      userProfilePic: r.userId?.profilePic, // Use populated profile picture
      likes: Array.isArray(r.likes) ? r.likes.map(id => id.toString()) : [], // Ensure likes are string IDs
      dislikes: Array.isArray(r.dislikes) ? r.dislikes.map(id => id.toString()) : [], // Ensure dislikes are string IDs
    }));

    // Respond with the formatted reviews
    res.json({ reviews: formattedReviews });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching show reviews fails
    console.error(`Error fetching reviews for show ${req.params.showId}:`, error);
    res.status(500).json({ error: 'Failed to fetch show reviews', details: error.message });
  }
});

/**
 * @route GET /api/user/reviews
 * @description Fetches all reviews written by the currently authenticated user.
 * Reviews are augmented with show details (name, poster) from TMDB.
 * Requires authentication.
 * @param {object} req - Express request object, `req.currentUser` and `req.currentUserId` populated by `authenticate` middleware.
 * @returns {Array<ReviewWithShowDetails>|object} JSON response:
 *  - An array of review objects, each including show details, on success.
 *  - `{ error: string, details?: string }` on failure (500 for server or TMDB API error).
 * @async
 */
app.get('/api/user/reviews', authenticate, async (req, res) => {
  // Log request details
  console.log(`[USER_REVIEWS_ROUTE] Request for user: ${req.currentUser?.username} (ID: ${req.currentUserId})`);
  try {
    // Get user ID from `req.currentUserId`
    const userId = req.currentUserId;
    // Critical check if userId is missing (should not happen if authenticate middleware works)
    if (!userId) {
      console.error("[USER_REVIEWS_ROUTE] Critical: currentUserId not found on req object!");
      return res.status(500).json({ error: 'User identification error.' });
    }

    // Find all reviews by the user, sorted by newest first
    const userReviews = await Review.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Log found reviews
    console.log(`[USER_REVIEWS_ROUTE] Found ${userReviews.length} raw reviews for user ${userId}`);
    if (userReviews.length > 0) {
      // Log first review to check structure, especially showId field
      console.log("[USER_REVIEWS_ROUTE] First raw review (check showId type):", JSON.stringify(userReviews[0], null, 2));
    }

    // Map over reviews and fetch TMDB show details for each
    const reviewsWithShowDetails = await Promise.all(
      userReviews.map(async (review) => {
        // Determine the correct show ID field to use (handles legacy field names)
        let showIdToUse = review.showId || review.tmdbId || review.show_id;
        console.log(`[USER_REVIEWS_ROUTE] Processing review ${review._id}, original showId field value: ${showIdToUse}`);

        let showData = { name: 'Unknown Show (Processing Error)', poster_path: null };
        if (showIdToUse) {
          // Fetch show details from TMDB using the helper function
          showData = await fetchShowDetailsFromTMDB(showIdToUse);
        } else {
          // Warn if no showId is found for a review
          console.warn(`[USER_REVIEWS_ROUTE] No showId found for review ${review._id}`);
          showData.name = `Review ${review._id} (No Show ID)`;
        }

        // Return formatted review with show details
        return {
          ...review,
          id: review._id.toString(), // Ensure ID is string
          _id: review._id.toString(), // Ensure _id is string
          showName: showData.name, // Show name from TMDB
          posterPath: showData.poster_path, // Show poster path from TMDB
          likes: Array.isArray(review.likes) ? review.likes.map(id => id.toString()) : [], // Ensure likes are string IDs
          dislikes: Array.isArray(review.dislikes) ? review.dislikes.map(id => id.toString()) : [], // Ensure dislikes are string IDs
        };
      })
    );

    // Log and respond with reviews including show details
    console.log(`[USER_REVIEWS_ROUTE] Returning ${reviewsWithShowDetails.length} reviews with details for ${req.currentUser?.username}.`);
    res.json(reviewsWithShowDetails);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching user reviews fails
    console.error('[USER_REVIEWS_ROUTE] Critical error in route handler:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch user reviews', details: error.message });
  }
});

/**
 * @route POST /api/users/mark-watched
 * @description Marks specified episodes of a show as watched for the authenticated user.
 * Updates or creates an entry in the user's `watchedHistory`.
 * `watchedHistory` is capped at 50 shows, sorted by `lastWatchedAt`.
 * Logs 'mark_watched' activity.
 * Requires authentication.
 * @param {object} req.body - Expected properties: `showId` (string), `showName` (string), `posterPath` (string), `seasonNumber` (number), `episodes` (Array of objects with `id`, `number`, `name`).
 * @param {object} req - Express request object, `req.currentUser` and `req.currentUserId` populated by `authenticate` middleware.
 * @returns {object} JSON response:
 *  - `{ message: 'Watched status updated successfully.' }` on success (200).
 *  - `{ message: string, details?: string }` on failure (400 for missing fields, 500 for server error).
 * @async
 */
app.post('/api/users/mark-watched', authenticate, async (req, res) => {
  // Log request body and user details
  console.log(`[MARK_WATCHED] Received request body:`, JSON.stringify(req.body, null, 2));
  console.log(`[MARK_WATCHED] Request for user: ${req.currentUser?.username} (ID: ${req.currentUserId})`);
  // Destructure required fields from request body
  const { showId, showName, posterPath, seasonNumber, episodes } = req.body;
  // Get user ID from `req.currentUserId`
  const userId = req.currentUserId;

  // Validate required fields
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
    // Get current user document
    let userRecord = req.currentUser;
    // Initialize watchedHistory if it doesn't exist
    let watchedHistory = userRecord.watchedHistory || [];
    // Find index of the show in watchedHistory
    const showIndex = watchedHistory.findIndex(item => item.showId === showId.toString());
    // Current timestamp for watchedAt/lastWatchedAt
    const newWatchedAt = new Date();

    // If show is already in watchedHistory, update it
    if (showIndex > -1) {
      watchedHistory[showIndex].lastWatchedAt = newWatchedAt; // Update lastWatchedAt for the show
      // Create a map of existing episodes for quick lookup
      const existingShowEpisodesById = new Map(watchedHistory[showIndex].episodes.map(ep => [ep.id.toString(), ep]));

      // Process new episodes to be marked as watched
      episodes.forEach(newEp => {
        const episodeToAddOrUpdate = {
          id: newEp.id,
          number: newEp.number,
          name: newEp.name,
          seasonNumber: seasonNumber,
          watchedAt: newWatchedAt
        };

        // If episode already exists, update its watchedAt and seasonNumber (if different)
        if (existingShowEpisodesById.has(newEp.id.toString())) {
          const epToUpdate = existingShowEpisodesById.get(newEp.id.toString());
          epToUpdate.watchedAt = newWatchedAt;
          if (epToUpdate.seasonNumber !== seasonNumber) epToUpdate.seasonNumber = seasonNumber;
        } else {
          // If episode is new, add it to the show's episodes list
          watchedHistory[showIndex].episodes.push(episodeToAddOrUpdate);
        }
      });
    } else { // If show is not in watchedHistory, add a new entry
      watchedHistory.push({
        showId: showId.toString(),
        showName,
        posterPath,
        lastWatchedAt: newWatchedAt,
        episodes: episodes.map(ep => ({ // Map provided episodes to the required structure
          id: ep.id,
          number: ep.number,
          name: ep.name,
          seasonNumber: seasonNumber,
          watchedAt: newWatchedAt
        }))
      });
    }

    // Sort watchedHistory by lastWatchedAt descending (most recent first)
    watchedHistory.sort((a, b) => new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt));

    // Limit watchedHistory to the latest 50 shows
    if (watchedHistory.length > 50) {
      watchedHistory = watchedHistory.slice(0, 50);
    }

    // Update the user document in the database with the new watchedHistory
    await userCollection.updateOne(
      { _id: userId },
      { $set: { watchedHistory: watchedHistory, updatedAt: new Date() } } // Also update `updatedAt` timestamp
    );

    // Log the 'mark_watched' activity
    await logActivity(userId, 'mark_watched', showId.toString(), {
      episodeCount: episodes.length,
      season: seasonNumber
    });

    console.log(`[MARK_WATCHED] Successfully updated watched history for user ${userId}, show ${showId}`);
    res.status(200).json({ message: 'Watched status updated successfully.' });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if updating watched status fails
    console.error('[MARK_WATCHED] Error:', error);
    res.status(500).json({ message: 'Server error while updating watched status.', details: error.message });
  }
});

/**
 * @route GET /api/users/recently-watched
 * @description Fetches the 10 most recently watched shows for the authenticated user.
 * Requires authentication.
 * @param {object} req - Express request object, `req.currentUser` populated by `authenticate` middleware.
 * @returns {Array<object>|object} JSON response:
 *  - An array of recently watched show objects (each with `showId`, `showName`, `posterPath`, `lastWatchedAt`) on success. Empty array if no history.
 *  - `{ error: string, details?: string }` on failure (500 for server error).
 * @async
 */
app.get('/api/users/recently-watched', authenticate, async (req, res) => {
  // Log handler invocation
  console.log(`[RECENTLY_WATCHED] Handler invoked for user: ${req.currentUser?.username} (ID: ${req.currentUserId})`);
  try {
    // Get current user document
    const userRecord = req.currentUser;

    // If no watched history, return an empty array
    if (!userRecord.watchedHistory || userRecord.watchedHistory.length === 0) {
      console.log(`[RECENTLY_WATCHED] No watched history for user ${userRecord?.username}`);
      return res.json([]);
    }

    // Sort watched history by lastWatchedAt descending (most recent first)
    // Create a new array to avoid modifying `req.currentUser.watchedHistory` directly
    const sortedWatchedHistory = [...userRecord.watchedHistory].sort((a, b) => {
      const dateA = a.lastWatchedAt ? new Date(a.lastWatchedAt) : new Date(0); // Handle potentially missing lastWatchedAt
      const dateB = b.lastWatchedAt ? new Date(b.lastWatchedAt) : new Date(0);
      return dateB - dateA;
    });

    // Take the top 10 most recently watched shows and map to desired response format
    const recentlyWatched = sortedWatchedHistory.slice(0, 10).map(item => ({
      showId: item.showId,
      showName: item.showName,
      posterPath: item.posterPath,
      lastWatchedAt: item.lastWatchedAt,
    }));

    console.log(`[RECENTLY_WATCHED] Sending ${recentlyWatched.length} shows for ${userRecord?.username}.`);
    // Respond with the recently watched shows
    res.json(recentlyWatched);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching recently watched shows fails
    console.error('[RECENTLY_WATCHED] Error processing request:', error);
    res.status(500).json({ error: 'Failed to fetch recently watched shows', details: error.message });
  }
});

/**
 * @route GET /api/users/:username
 * @description Fetches public profile information for a given username, including their latest 5 activities.
 * @param {string} req.params.username - The username of the user whose profile is being requested.
 * @returns {object} JSON response:
 *  - `{ success: true, user: UserProfile, activities: Array<Activity> }` on success. `UserProfile` includes `username`, `email` (can be sensitive, consider removal for public profiles), `profilePic`, `createdAt`, `friends`, `friendRequestsSent`, `_id`.
 *  - `{ success: false, message: string }` on failure (404 if user not found, 500 for server error).
 * @async
 */
app.get('/api/users/:username', async (req, res) => {
  // Get username from route parameters
  const { username } = req.params;

  try {
    // Find the user by username, projecting only necessary public fields
    const user = await userCollection.findOne(
      { username },
      { 
        projection: { 
          username: 1, 
          email: 1, // Note: Exposing email might be a privacy concern for public profiles
          profilePic: 1, 
          createdAt: 1, 
          friends: 1, // Consider if friend list IDs should be public
          friendRequestsSent: 1, // Consider if sent requests IDs should be public
          _id: 1 
        } 
      }
    );

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch the latest 5 activities for this user
    const userActivities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(5) // Limit to 5 activities
      .lean(); // Use .lean() for plain JavaScript objects

    // Respond with user profile and activities
    res.json({
      success: true,
      user: { 
        ...user, 
        _id: user._id.toString() // Ensure _id is string
      },
      activities: userActivities, 
    });

  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching profile fails
    console.error("Error fetching other user's profile:", error);
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
});

/**
 * @route GET /api/users/:username/recently-watched
 * @description Fetches the 10 most recently watched shows for the specified user.
 * Public endpoint (no authentication required).
 * @param {string} req.params.username - Username to fetch history for.
 * @returns {Array<object>|object} JSON response:
 *  - Array of recently watched shows (each with `showId`, `showName`, `posterPath`, `lastWatchedAt`). Empty array if no history.
 *  - `{ error: string }` if user not found (404).
 *  - `{ error: string, details?: string }` on server error (500).
 * @async
 */
app.get('/api/users/:username/recently-watched', async (req, res) => {
  const username = req.params.username;
  console.log(`[PUBLIC_RECENTLY_WATCHED] Handler invoked for username: ${username}`);

  try {
    const userRecord = await userCollection.findOne({ username: username });

    if (!userRecord) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!userRecord.watchedHistory || userRecord.watchedHistory.length === 0) {
      console.log(`[PUBLIC_RECENTLY_WATCHED] No watched history for user ${userRecord.username}`);
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

    console.log(`[PUBLIC_RECENTLY_WATCHED] Sending ${recentlyWatched.length} shows for ${userRecord.username}.`);
    res.json(recentlyWatched);
  } catch (error) {
    console.error('[PUBLIC_RECENTLY_WATCHED] Error processing request:', error);
    res.status(500).json({ error: 'Failed to fetch recently watched shows', details: error.message });
  }
});

/**
 * @route POST /api/upload-profile-image
 * @description Uploads a profile image for the authenticated user to Cloudinary.
 * Updates the user's `profilePic` URL in the database.
 * Uses `authenticate` middleware and `multer` for file handling.
 * Logs 'profile_update' activity.
 * @param {object} req - Express request object. `req.file` is populated by `multer`. `req.currentUserId` by `authenticate`.
 * @param {object} req.file - The uploaded file object from Multer (via CloudinaryStorage). Expected to have `path` (Cloudinary URL).
 * @returns {object} JSON response:
 *  - `{ success: true, imageUrl: string, message: string }` on success.
 *  - `{ success: false, message: string, error?: string }` on failure (400 for no file, 404 if user not found/update failed, 500 for server error).
 * @async
 */
app.post('/api/upload-profile-image', authenticate, upload.single('profileImage'), async (req, res) => {
  // `upload.single('profileImage')` handles the file upload and adds `req.file`
  try {
    // If no file was uploaded, return 400 Bad Request
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Get user ID from `req.currentUserId`
    const userId = req.currentUserId;
    // Get the Cloudinary URL of the uploaded image from `req.file.path` (set by CloudinaryStorage)
    const imageUrl = req.file.path;

    // Update the user's profilePic field in the database
    const result = await userCollection.updateOne(
      { _id: userId },
      { $set: { profilePic: imageUrl, updatedAt: new Date() } } // Also update `updatedAt`
    );

    // Check update result
    if (result.modifiedCount === 1) { // Successfully updated
      await logActivity(userId, 'profile_update', null, { field: 'profilePic' });
      return res.json({ success: true, imageUrl, message: 'Profile picture updated successfully' });
    } else if (result.matchedCount === 1 && result.modifiedCount === 0) { // User found, but image URL was the same
      return res.json({ success: true, imageUrl, message: 'Profile picture is already up to date.' });
    } else { // User not found or update failed for other reasons
      return res.status(404).json({ success: false, message: 'User not found or failed to update profile.' });
    }
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if upload or DB update fails
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture', error: error.message });
  }
});

/**
 * @route GET /api/activities
 * @description Fetches the latest 50 activities for the authenticated user.
 * Requires authentication.
 * @param {object} req - Express request object, `req.currentUserId` and `req.currentUser` populated by `authenticate` middleware.
 * @returns {Array<Activity>|object} JSON response:
 *  - An array of activity objects on success.
 *  - `{ error: string, details?: string }` on failure (500 for server error).
 * @async
 */
app.get('/api/activities', authenticate, async (req, res) => {
  try {
    // Get user ID from `req.currentUserId`
    const userId = req.currentUserId; 

    // `req.currentUser` is also available from `authenticate` middleware
    // const user = req.currentUser; // This line is present but `user` variable is not used

    // Find activities for the user, sort by newest first, limit to 50
    const activities = await Activity.find({ userId: userId })
      .sort({ createdAt: -1 }).limit(50).lean();
    // Respond with the activities
    res.json(activities);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching activities fails
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

/**
 * @route GET /api/users/:username/activities
 * @description Fetches the latest 50 activities for a specified username (public).
 * @param {string} req.params.username - The username of the user whose activities are being requested.
 * @returns {Array<Activity>|object} JSON response:
 *  - An array of activity objects on success.
 *  - `{ error: string }` on failure (404 if user not found, 500 for server error).
 * @async
 */
app.get('/api/users/:username/activities', async (req, res) => {
  try {
    // Get username from route parameters
    const { username } = req.params;
    // Find the user by username, projecting only the _id field
    const user = await userCollection.findOne({ username }, { projection: { _id: 1 } });
    // If user not found, return 404
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find activities for this user's ID, sort by newest, limit to 50
    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 }).limit(50).lean();
    // Respond with the activities
    res.json(activities);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching activities fails
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

/**
 * @route GET /api/users/:username/reviews
 * @description Fetches all reviews written by a specified username (public).
 * Reviews are augmented with show details (name, poster) from TMDB.
 * @param {string} req.params.username - The username of the user whose reviews are being requested.
 * @returns {Array<ReviewWithShowDetails>|object} JSON response:
 *  - An array of review objects, each including show details, on success.
 *  - `{ error: string }` on failure (404 if user not found, 500 for server or TMDB API error).
 * @async
 */
app.get('/api/users/:username/reviews', async (req, res) => {
  try {
    // Get username from route parameters
    const { username } = req.params;

    // Find the user by username
    const user = await userCollection.findOne({ username });
    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user ID
    const userId = user._id;
    console.log(`Fetching reviews for user: ${username} (${userId})`);

    // Find all reviews by this user, sorted by newest first
    const userReviews = await Review.find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${userReviews.length} reviews for user ${username}`);

    // Map over reviews and fetch TMDB show details for each
    const reviewsWithShowDetails = await Promise.all(
      userReviews.map(async (review) => {
        // Determine the correct show ID field to use (handles legacy field names)
        let showIdToUse = null;
        if (review.showId) showIdToUse = review.showId;
        else if (review.tmdbId) showIdToUse = review.tmdbId;
        else if (review.show_id) showIdToUse = review.show_id;

        console.log(`Processing review ${review._id}, using show ID: ${showIdToUse}`);

        let showData = { name: 'Unknown Show', poster_path: null };
        if (showIdToUse) {
          // Fetch show details from TMDB
          showData = await fetchShowDetailsFromTMDB(showIdToUse);
        }

        // Return formatted review with show details
        return {
          ...review,
          id: review._id.toString(), // Ensure ID is string
          showId: showIdToUse, // The show ID used for TMDB fetch
          showName: showData.name, // Show name from TMDB
          posterPath: showData.poster_path, // Show poster path from TMDB
          likes: Array.isArray(review.likes) ? review.likes : [], // Likes array (original ObjectIds or strings)
          dislikes: Array.isArray(review.dislikes) ? review.dislikes : [], // Dislikes array
          username: user.username // Add username to each review object
        };
      })
    );

    // Respond with the reviews including show details
    res.json(reviewsWithShowDetails);
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching user reviews fails
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * @route GET /api/users/:username/watchlist
 * @description Fetches the watchlist (array of show IDs) for a specified username (public).
 * @param {string} req.params.username - The username of the user whose watchlist is being requested.
 * @returns {object} JSON response:
 *  - `{ watchlist: Array<string> }` on success. Watchlist contains show IDs.
 *  - `{ error: string }` on failure (404 if user not found, 500 for server error).
 * @async
 */
app.get('/api/users/:username/watchlist', async (req, res) => {
  try {
    // Get username from route parameters
    const { username } = req.params;

    // Find the user by username, projecting only the watchlist field
    const user = await userCollection.findOne(
      { username },
      { projection: { watchlist: 1 } }
    );

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with the user's watchlist (or an empty array if none)
    res.json({ watchlist: user.watchlist || [] });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching watchlist fails
    console.error('Error fetching user watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// This is a duplicate route definition for /api/users/:username/reviews.
// It will effectively be shadowed by the one defined earlier if using standard Express routing order.
// Commenting it as it appears in the code.
/**
 * @route GET /api/users/:username/reviews
 * @description (Duplicate Route Definition) Fetches all reviews written by a specified username (public).
 * Reviews are augmented with show details (name, poster) from TMDB.
 * @param {string} req.params.username - The username of the user whose reviews are being requested.
 * @returns {Array<ReviewWithShowDetails>|object} JSON response:
 *  - An array of review objects, each including show details, on success.
 *  - `{ error: string }` on failure (404 if user not found, 500 for server or TMDB API error).
 * @async
 */
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

// This is a duplicate route definition for /api/users/:username/watchlist.
// It will effectively be shadowed by the one defined earlier if using standard Express routing order.
// Commenting it as it appears in the code.
/**
 * @route GET /api/users/:username/watchlist
 * @description (Duplicate Route Definition) Fetches the watchlist (array of show IDs) for a specified username (public).
 * @param {string} req.params.username - The username of the user whose watchlist is being requested.
 * @returns {object} JSON response:
 *  - `{ watchlist: Array<string> }` on success.
 *  - `{ error: string }` on failure (404 if user not found, 500 for server error).
 * @async
 */
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

/**
 * @route POST /api/logout
 * @description Logs out the current user by destroying their session.
 * Logs 'logout' activity. Clears the session cookie.
 * @param {object} req - Express request object, expected to have `req.session`.
 * @returns {object} JSON response:
 *  - `{ success: true, message: string }` on successful logout or if no active session.
 *  - `{ success: false, message: string }` on failure (500 for session destruction error).
 * @async
 */
app.post('/api/logout', async (req, res) => {
  // Check if session exists and is authenticated
  if (req.session && req.session.authenticated) {
    // Store userId and email for logging before session is destroyed
    const userIdToLog = req.session.userId;
    const userEmailForLog = req.session.email;

    // Destroy the session
    req.session.destroy(async (err) => {
      if (err) {
        // Handle session destruction error
        console.error("Session destruction error:", err);
        return res.status(500).json({ success: false, message: 'Could not log out, please try again.' });
      }

      // Attempt to log logout activity
      if (userIdToLog) { // If userId was in session
        try {
          await logActivity(new mongoose.Types.ObjectId(userIdToLog), 'logout');
        } catch (logErr) {
          console.error("Error logging logout activity for userId:", userIdToLog, logErr);
        }
      } else if (userEmailForLog) { // If only email was in session (less ideal)
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
      } else { // If no user identifiers were in session
        console.warn("Logout occurred, but no user identifier in session for activity logging.");
      }
      
      // Clear the session cookie from the client's browser
      res.clearCookie('connect.sid', { path: '/' }); // Ensure path matches session cookie path
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  } else {
    // If no active session or already logged out, still clear cookie as a precaution
    res.clearCookie('connect.sid', { path: '/' });
    return res.json({ success: true, message: 'No active session to log out from or already logged out' });
  }
});

/**
 * @route POST /api/watchlist/add
 * @description Adds a show to the authenticated user's watchlist.
 * Uses `$addToSet` to prevent duplicates. Requires authentication.
 * Logs 'watchlist_add' activity.
 * @param {object} req.body - Expected property: `showId` (string).
 * @param {object} req - Express request object, `req.currentUserId` populated by `authenticate` middleware.
 * @returns {object} JSON response:
 *  - `{ success: true, message: string }` on success ('Added to watchlist' or 'Already in watchlist').
 *  - `{ success: false, message: string }` on failure (400 for missing show ID, 404 if user not found/update failed, 500 for server error).
 * @async
 */
app.post('/api/watchlist/add', authenticate, async (req, res) => {
  // Get show ID from request body
  const { showId } = req.body;
  // Get user ID from `req.currentUserId`
  const userId = req.currentUserId;
  // Validate show ID
  if (!showId) return res.status(400).json({ success: false, message: 'Missing show ID' });
  try {
    // Add showId to user's watchlist array using $addToSet (ensures uniqueness)
    const result = await userCollection.updateOne({ _id: userId }, { $addToSet: { watchlist: showId.toString() } });
    // Check update result
    if (result.modifiedCount === 0 && result.matchedCount === 1) { // Matched user, but showId was already in watchlist
      return res.status(200).json({ success: true, message: 'Already in watchlist' });
    } else if (result.modifiedCount === 1) { // Successfully added to watchlist
      await logActivity(userId, 'watchlist_add', showId.toString());
      return res.json({ success: true, message: 'Added to watchlist' });
    }
    // If user not matched or other update failure
    return res.status(404).json({ success: false, message: 'User not found or watchlist update failed' });
  } catch (err) {
    // Log and respond with a 500 Internal Server Error if adding to watchlist fails
    console.error("Error updating watchlist:", err);
    res.status(500).json({ success: false, message: 'Server error adding to watchlist' });
  }
});

/**
 * @route POST /api/watchlist/remove
 * @description Removes a show from the authenticated user's watchlist.
 * Requires authentication. Logs 'watchlist_remove' activity.
 * @param {object} req.body - Expected property: `showId` (string).
 * @param {object} req - Express request object, `req.currentUserId` populated by `authenticate` middleware.
 * @returns {object} JSON response:
 *  - `{ success: true, message: string }` on success ('Removed from watchlist' or 'Show was not in watchlist...').
 *  - `{ success: false, message: string }` on failure (400 for missing show ID, 404 if user not found, 500 for server error).
 * @async
 */
app.post('/api/watchlist/remove', authenticate, async (req, res) => {
  // Get show ID from request body
  const { showId } = req.body;
  // Get user ID from `req.currentUserId`
  const userId = req.currentUserId;

  // Validate show ID
  if (!showId) {
    return res.status(400).json({ success: false, message: 'Missing show ID' });
  }

  try {
    // Remove showId from user's watchlist array using $pull
    const result = await userCollection.updateOne(
      { _id: userId },
      { $pull: { watchlist: showId } } // `showId` here should be string if watchlist stores strings
    );

    // If user was not found (shouldn't happen if authenticate passed)
    if (result.matchedCount === 0) {
      console.warn(`[WATCHLIST_REMOVE] User not found with ID: ${userId}, though authenticate passed.`);
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If show was not in watchlist or already removed (no modification)
    if (result.modifiedCount === 0) {
      return res.status(200).json({ success: true, message: 'Show was not in watchlist or already removed.' });
    }

    // Successfully removed from watchlist
    await logActivity(userId, 'watchlist_remove', showId.toString());
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) {
    // Log and respond with a 500 Internal Server Error if removing from watchlist fails
    console.error("Error removing from watchlist:", err);
    res.status(500).json({ success: false, message: 'Server error while removing from watchlist' });
  }
});

/**
 * @route GET /api/watchlist
 * @description Fetches the authenticated user's watchlist with details for each show from TMDB.
 * Requires authentication.
 * @param {object} req - Express request object, `req.currentUser` populated by `authenticate` middleware.
 * @returns {Array<object>|object} JSON response:
 *  - An array of show objects (each with `id`, `name`, `poster_path`, TMDB details) on success. Empty array if watchlist is empty.
 *  - `{ error: string, details?: string }` on failure (500 for server or TMDB API error).
 * @async
 */
app.get('/api/watchlist', authenticate, async (req, res) => {
  try {
    // Get current user document
    const user = req.currentUser;
    // If watchlist is empty or doesn't exist, return empty array
    if (!user.watchlist || user.watchlist.length === 0) return res.json([]);

    // Map over watchlist show IDs and fetch details from TMDB for each
    const watchlistDetails = await Promise.all(
      user.watchlist.map(async (showId) => {
        try {
          // Construct TMDB API URL for the show
          const tmdbUrl = `${tmdbBaseUrl}/tv/${showId}`; // Assumes all watchlist items are TV shows
          // Fetch show details from TMDB
          const response = await axios.get(tmdbUrl, { params: { api_key: tmdbApiKey }, timeout: 5000 });
          // Return formatted show details
          return {
            id: response.data.id, name: response.data.name, poster_path: response.data.poster_path,
            vote_average: response.data.vote_average, vote_count: response.data.vote_count,
            first_air_date: response.data.first_air_date
          };
        } catch (error) {
          // Warn if TMDB fetch fails for a specific watchlist item
          console.warn(`TMDB fetch failed for watchlist item ${showId}:`, error.message);
          // Return a placeholder object for failed fetches to not break the entire list
          return { id: showId, name: `Show ID: ${showId} (Fetch Error)`, poster_path: null };
        }
      })
    );
    // Filter out any null/undefined results (though current placeholder returns an object) and respond
    res.json(watchlistDetails.filter(Boolean));
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if fetching watchlist fails
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist", details: error.message });
  }
});

/**
 * @route POST /api/chat
 * @description Proxies chat messages to the OpenAI API (gpt-3.5-turbo model).
 * Requires authentication.
 * @param {object} req.body - Expected property: `messages` (Array of message objects, e.g., `{ role: 'user', content: 'Hello' }`).
 * @param {object} req - Express request object (authentication handled by `authenticate` middleware, but not strictly used in this version of the function logic beyond that).
 * @returns {object} JSON response:
 *  - `{ success: true, reply: string }` containing the AI's response on success.
 *  - `{ success: false, error: string }` on failure (400 for invalid input, 500/502/504 for server/AI API errors).
 * @async
 */
app.post('/api/chat', authenticate, async (req, res) => {
  try {
    // Validate request body structure
    if (!req.body || !req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('Invalid request format');
      return res.status(400).json({
        success: false,
        error: 'Invalid request format. Expected { messages: [] }'
      });
    }
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, error: 'Server AI configuration error.' });
    }
    // Map incoming messages to the format expected by OpenAI API
    const messages = req.body.messages.map(msg => ({ role: msg.role || 'user', content: msg.content || '' }));
    // Make POST request to OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      { model: "gpt-3.5-turbo", messages: messages, max_tokens: 150, temperature: 0.7, }, // OpenAI request payload
      { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json', }, timeout: 10000 } // Headers and timeout
    );
    // Validate OpenAI API response structure
    if (!response.data?.choices?.[0]?.message?.content) {
      return res.status(500).json({ success: false, error: 'Unexpected AI API response format.' });
    }
    // Respond with the AI's reply
    return res.json({ success: true, reply: response.data.choices[0].message.content });
  } catch (error) {
    // Log and handle errors from OpenAI API or other issues
    console.error('Chat API error:', error.response ? error.response.data : error.message);
    if (error.response) return res.status(error.response.status || 502).json({ success: false, error: error.response.data.error?.message || 'AI service error.' }); // Bad Gateway if status unknown
    if (error.code === 'ECONNABORTED') return res.status(504).json({ success: false, error: 'AI Request timeout.' }); // Gateway Timeout
    return res.status(500).json({ success: false, error: 'Internal server error with AI chat.' });
  }
});

/**
 * @route GET /api/statistics/total-users
 * @description Returns the total number of registered user accounts in the system.
 * Useful for displaying cumulative user statistics (e.g., in admin dashboards or landing pages).
 *
 * @returns {Object} JSON response:
 *   - { success: true, totalUsers: number } — on successful query.
 *   - { success: false, message: string } — if an error occurs or the user collection is unavailable.
 *
 * @example
 * GET /api/statistics/total-users
 * Response: { "success": true, "totalUsers": 1042 }
 *
 * @async
 */
app.get('/api/statistics/total-users', async (req, res) => {
  try {
    // Ensure the user collection is available before querying.
    if (!userCollection) {
      console.error("User collection not initialized or unavailable.");
      return res.status(503).json({ success: false, message: 'User data service unavailable.' });
    }

    // Count all documents (users) in the user collection.
    const totalUsersCount = await userCollection.countDocuments({});

    // Return the result as a JSON response.
    res.json({ success: true, totalUsers: totalUsersCount });
  } catch (error) {
    console.error("Error retrieving total user count:", error);
    res.status(500).json({ success: false, message: 'Could not retrieve total user count.' });
  }
});

/**
 * @route GET /api/statistics/total-reviews
 * @description Fetches the total count of reviews.
 * @returns {object} JSON response:
 *  - `{ success: true, totalReviews: number }` on success.
 *  - `{ success: false, message: string }` on failure.
 * @async
 */
app.get('/api/statistics/total-reviews', async (req, res) => {
  try {
    const totalReviewsCount = await Review.countDocuments({});
    res.json({ success: true, totalReviews: totalReviewsCount });
  } catch (error) {
    console.error("Failed to fetch total reviews count:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch total reviews count' });
  }
});

/**
 * @route GET /api/average-rating
 * @description Calculates and returns the average rating and total number of reviews for a given show.
 * @param {string} req.query.showId - The ID of the show for which to calculate the average rating.
 * @returns {object} JSON response:
 *  - `{ averageRating: number | null, totalReviews: number }` on success. `averageRating` is null if no reviews.
 *  - `{ error: string, details?: string }` on failure (400 for missing show ID, 500 for server error).
 * @async
 */
app.get('/api/average-rating', async (req, res) => {
  try {
    // Get show ID from query parameters
    const { showId } = req.query;
    // Validate show ID
    if (!showId) return res.status(400).json({ error: 'Show ID is required' });

    // MongoDB aggregation pipeline to calculate average rating and total reviews
    const result = await Review.aggregate([
      { $match: { showId: showId.toString() } }, // Match reviews for the given showId
      { $group: { _id: '$showId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } } // Group by showId and calculate average rating and sum of reviews
    ]);
    // If no reviews found for the show
    if (result.length === 0) return res.json({ averageRating: null, totalReviews: 0 });

    // Destructure results from aggregation
    const { averageRating, totalReviews } = result[0];
    // Respond with average rating (formatted to 2 decimal places) and total reviews
    res.json({ averageRating: parseFloat(averageRating.toFixed(2)), totalReviews });
  } catch (error) {
    // Log and respond with a 500 Internal Server Error if calculation fails
    console.error('Error calculating average rating:', error);
    res.status(500).json({ error: 'Failed to calculate average rating', details: error.message });
  }
});

/**
 * @route GET /^(?!\/api).*
 * @description Catch-all route for any GET requests that do not start with '/api'.
 * Serves the 'index.html' file from the frontend build directory (e.g., '../../dist').
 * This is typically used to support client-side routing in Single Page Applications (SPAs).
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
app.get(/^(?!\/api).*/, (req, res) => {
  // Send the main HTML file of the SPA
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Connect to the MongoDB database using the native driver setup from databaseConnection.js
connectToDatabase().then(() => {
  // If database connection is successful, start the Express server
  app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  });
}).catch(err => {
  // If database connection fails, log the error and exit the process
  console.error("❌ Failed to connect to MongoDB:", err);
  process.exit(1); // Exit with a failure code
});