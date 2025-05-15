import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);

global.base_dir = __dirname;
global.abs_path = function(path) {
    return base_dir + path;
};

global.include = function(file) {
    return require(abs_path('/' + file));
};

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

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);