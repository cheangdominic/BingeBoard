import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

global.base_dir = __dirname;
global.abs_path = function (path) {
  return base_dir + path;
};

global.include = function (file) {
  return require(abs_path('/' + file));
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/profilePhotos/generic_profile_picture.jpg'
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Review Schema (existing)
const reviewSchema = new mongoose.Schema({
  showId: {
    type: String,
    ref: 'TVShow',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  containsSpoiler: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Activity Schema (new)
const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
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
  targetId: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual population for user data
activitySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Indexes for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);