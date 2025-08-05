import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    // Root user reference for data isolation
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Root User ID is required for data isolation'],
      index: true,
    },

    // Blog identification
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Blog description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Short description cannot be more than 500 characters'],
    },
    content: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imageAlt: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: 'Admin',
    },
    published: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot be more than 60 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot be more than 160 characters'],
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
blogSchema.index({ title: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ rootUserId: 1 }); // Root user-based isolation
blogSchema.index({ published: 1, rootUserId: 1 }); // For filtering published blogs by root user
blogSchema.index({ position: 1, rootUserId: 1 }); // For ordering by position within root user scope
blogSchema.index({ category: 1, rootUserId: 1 }); // For filtering by category within root user scope

// Static method to find blogs by root user
blogSchema.statics.findByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId });
};

// Static method to find published blogs by root user
blogSchema.statics.findPublishedByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId, published: true });
};

// Static method to find blogs by category and root user
blogSchema.statics.findByCategoryAndRootUser = function (
  category: string,
  rootUserId: string
) {
  return this.find({ category, rootUserId });
};

// Static method to count blogs by root user
blogSchema.statics.countByRootUser = function (rootUserId: string) {
  return this.countDocuments({ rootUserId });
};

// Static method to find blog by slug and root user
blogSchema.statics.findBySlugAndRootUser = function (
  slug: string,
  rootUserId: string
) {
  return this.findOne({ slug, rootUserId });
};

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
