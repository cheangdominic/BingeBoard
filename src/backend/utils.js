/**
 * @file Mongoose Schemas and Models
 * @description This file defines Mongoose schemas for User, Review, and Activity entities,
 * and exports their corresponding Mongoose models. It also sets up some global utility
 * functions for path resolution and module inclusion in an ES Module environment.
 */

// Import `fileURLToPath` to convert a file URL to a path string.
import { fileURLToPath } from 'url';
// Import `dirname` to get the directory name of a path.
import { dirname } from 'path';
// Import `createRequire` to create a `require` function for use in ES modules,
// allowing synchronous loading of CommonJS modules or JSON files.
import { createRequire } from 'module';
// Import Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js.
import mongoose from 'mongoose';

/**
 * The filename of the current module, resolved from `import.meta.url`.
 * @const {string}
 */
const __filename = fileURLToPath(import.meta.url);
/**
 * The directory name of the current module.
 * @const {string}
 */
const __dirname = dirname(__filename);

/**
 * A Node.js `require` function created for the context of the current module's URL.
 * Useful for importing CommonJS modules or JSON files within an ES module.
 * @const {NodeRequire}
 */
const require = createRequire(import.meta.url);

/**
 * Global variable storing the base directory of the application (directory of this file).
 * Note: Modifying the global scope is generally discouraged in favor of module exports/imports.
 * @global
 * @type {string}
 */
global.base_dir = __dirname;
/**
 * Global function to resolve an absolute path by prepending `base_dir`.
 * Note: Modifying the global scope is generally discouraged.
 * @global
 * @function abs_path
 * @param {string} path - The relative path from the base directory.
 * @returns {string} The absolute path.
 */
global.abs_path = function (path) {
  return base_dir + path;
};

/**
 * Global function to require a module using an absolute path constructed from `base_dir`.
 * Note: Modifying the global scope is generally discouraged.
 * @global
 * @function include
 * @param {string} file - The relative path to the file (from `base_dir`, prepended with '/') to be required.
 * @returns {*} The exported module.
 */
global.include = function (file) {
  return require(abs_path('/' + file));
};

/**
 * Mongoose schema for User documents.
 * @const {mongoose.Schema} userSchema
 */
const userSchema = new mongoose.Schema({
  /**
   * The username of the user. Must be unique.
   * @type {string}
   */
  username: {
    type: String,
    required: true, // Username is a required field
    unique: true,   // Username must be unique across all users
    trim: true,     // Automatically remove leading/trailing whitespace
    minlength: 3,   // Minimum length of 3 characters
    maxlength: 30   // Maximum length of 30 characters
  },
  /**
   * The email address of the user. Must be unique and in a valid email format.
   * @type {string}
   */
  email: {
    type: String,
    required: true, // Email is a required field
    unique: true,   // Email must be unique
    trim: true,     // Automatically remove leading/trailing whitespace
    lowercase: true, // Automatically convert to lowercase
    match: /^\S+@\S+\.\S+$/ // Regex to validate email format
  },
  /**
   * The hashed password of the user.
   * @type {string}
   */
  password: {
    type: String,
    required: true // Password is a required field
  },
  /**
   * URL of the user's profile picture.
   * Defaults to a generic profile picture URL.
   * The placeholder 'your_cloud_name' should be replaced with an actual Cloudinary cloud name or a generic placeholder service.
   * @type {string}
   */
  profilePic: {
    type: String,
    default: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/profilePhotos/generic_profile_picture.jpg'
  },
  /**
   * A short biography or description for the user.
   * @type {string}
   */
  bio: {
    type: String,
    maxlength: 200, // Maximum length of 200 characters
    default: ''     // Defaults to an empty string
  },
  /**
   * An array of ObjectIds referencing other User documents, representing the user's friends.
   * @type {Array<mongoose.Schema.Types.ObjectId>}
   */
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to the 'User' model
  }],
  /**
   * The date and time when the user account was created.
   * Defaults to the current date and time.
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now // Defaults to the current timestamp
  }
});

/**
 * Mongoose schema for Review documents.
 * @const {mongoose.Schema} reviewSchema
 */
const reviewSchema = new mongoose.Schema({
  /**
   * The ID of the show being reviewed. This typically refers to an ID from an external API (e.g., TMDB ID).
   * The `ref: 'TVShow'` suggests a conceptual link or a Mongoose model named 'TVShow' (not defined in this file).
   * @type {string}
   */
  showId: {
    type: String,
    ref: 'TVShow', // Conceptual reference to a TVShow model/entity
    required: true // showId is a required field
  },
  /**
   * The ObjectId of the user who wrote the review.
   * @type {mongoose.Schema.Types.ObjectId}
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the 'User' model
    required: true // userId is a required field
  },
  /**
   * The username of the user who wrote the review.
   * This is denormalized for easier display, but `userId` provides the authoritative link.
   * @type {string}
   */
  username: {
    type: String,
    required: true // username is a required field
  },
  /**
   * The rating given in the review (e.g., 1 to 5 stars).
   * @type {number}
   */
  rating: {
    type: Number,
    required: true, // rating is a required field
    min: 1,         // Minimum rating value
    max: 5          // Maximum rating value
  },
  /**
   * The textual content of the review.
   * @type {string}
   */
  content: {
    type: String,
    required: true,    // content is a required field
    maxlength: 2000    // Maximum length of 2000 characters
  },
  /**
   * An array of ObjectIds referencing users who liked this review.
   * @type {Array<mongoose.Schema.Types.ObjectId>}
   */
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User', // Reference to the 'User' model
    default: []  // Defaults to an empty array
  },
  /**
   * An array of ObjectIds referencing users who disliked this review.
   * @type {Array<mongoose.Schema.Types.ObjectId>}
   */
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User', // Reference to the 'User' model
    default: []  // Defaults to an empty array
  },
  /**
   * A boolean flag indicating if the review contains spoilers.
   * @type {boolean}
   */
  containsSpoiler: {
    type: Boolean,
    default: false // Defaults to false
  },
  /**
   * The date and time when the review was created.
   * Defaults to the current date and time.
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now // Defaults to the current timestamp
  }
});

/**
 * Mongoose schema for Activity documents, used for logging user actions.
 * @const {mongoose.Schema} activitySchema
 */
const activitySchema = new mongoose.Schema({
  /**
   * The ObjectId of the user who performed the activity.
   * @type {mongoose.Schema.Types.ObjectId}
   */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the 'User' model
    required: true // userId is a required field
  },
  /**
   * The type of action performed by the user.
   * Must be one of the predefined enum values.
   * @type {string}
   */
  action: {
    type: String,
    required: true, // action is a required field
    enum: [ // Enumerated list of possible actions
      'login',
      'review_create',
      'watchlist_add',
      'watchlist_remove',
      'review_like',
      'review_dislike',
      'profile_update',
      'mark_watched',       
      'watched_episode'    
    ]
  },
  /**
   * An identifier for the target of the action, if applicable (e.g., show ID, review ID).
   * Stored as a string for flexibility.
   * @type {string}
   */
  targetId: {
    type: String // Can store various types of IDs as strings
  },
  /**
   * A flexible field to store additional details related to the activity.
   * Uses `mongoose.Schema.Types.Mixed` for schema-less data.
   * @type {mongoose.Schema.Types.Mixed}
   */
  details: {
    type: mongoose.Schema.Types.Mixed // Allows any data structure
  },
  /**
   * The date and time when the activity occurred.
   * Defaults to the current date and time. Indexed for faster querying.
   * @type {Date}
   */
  createdAt: {
    type: Date,
    default: Date.now, // Defaults to the current timestamp
    index: true        // Create an index on this field for performance
  }
}, {
  /**
   * Schema options:
   * `toJSON: { virtuals: true }` - Ensure virtuals are included when document is converted to JSON.
   * `toObject: { virtuals: true }` - Ensure virtuals are included when document is converted to a plain object.
   */
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Defines a virtual property 'user' on the activitySchema.
 * This allows populating the user document associated with an activity
 * without storing the full user object directly in the activity document.
 */
activitySchema.virtual('user', {
  ref: 'User',            // The model to use for population
  localField: 'userId',   // The field in the Activity schema
  foreignField: '_id',    // The field in the User schema
  justOne: true           // Indicates that only one User document should be populated
});

/**
 * Creates a compound index on `userId` (ascending) and `createdAt` (descending)
 * for efficient querying of activities by user, sorted by time.
 */
activitySchema.index({ userId: 1, createdAt: -1 });
/**
 * Creates a compound index on `action` (ascending) and `createdAt` (descending)
 * for efficient querying of activities by action type, sorted by time.
 */
activitySchema.index({ action: 1, createdAt: -1 });

/**
 * Mongoose model for 'Review'.
 * Uses `mongoose.models.Review` if it already exists (prevents recompilation errors in some environments, e.g., Next.js hot reloading),
 * otherwise creates a new model.
 * @const {mongoose.Model} Review
 */
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
/**
 * Mongoose model for 'Activity'.
 * Uses `mongoose.models.Activity` if it already exists, otherwise creates a new model.
 * @const {mongoose.Model} Activity
 */
export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
/**
 * Mongoose model for 'User'.
 * Uses `mongoose.models.User` if it already exists, otherwise creates a new model.
 * @const {mongoose.Model} User
 */
export const User = mongoose.models.User || mongoose.model('User', userSchema);