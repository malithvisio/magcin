import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
  },
  path: {
    type: String,
    required: [true, 'Storage path is required'],
    trim: true,
  },
  alt: {
    type: String,
    trim: true,
    maxlength: [200, 'Alt text cannot be more than 200 characters'],
  },
  topic: {
    type: String,
    required: [true, 'Image topic is required'],
    trim: true,
    maxlength: [100, 'Topic cannot be more than 100 characters'],
  },
  order: {
    type: Number,
    default: 0,
  },
  fileName: {
    type: String,
    trim: true,
  },
  fileSize: {
    type: Number,
  },
  fileType: {
    type: String,
    trim: true,
  },
  uploaded: {
    type: Boolean,
    default: true,
  },
});

const gallerySchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Root user-based data isolation
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Root User ID is required for data isolation'],
      index: true,
    },

    // Gallery identification
    name: {
      type: String,
      required: [true, 'Gallery name is required'],
      trim: true,
      maxlength: [100, 'Gallery name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    images: {
      type: [galleryImageSchema],
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
gallerySchema.index({ name: 1 });
gallerySchema.index({ position: 1 });
gallerySchema.index({ published: 1 });
gallerySchema.index({ rootUserId: 1 });
gallerySchema.index({ 'images.order': 1 });

// Create the model only if it doesn't exist
const Gallery =
  mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

export default Gallery;
