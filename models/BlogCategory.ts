import mongoose from 'mongoose';

const blogCategorySchema = new mongoose.Schema(
  {
    // Multi-tenant reference
    rootUserId: {
      type: String,
      required: [true, 'Root User ID is required for data isolation'],
      index: true,
    },

    // Category information
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    position: {
      type: Number,
      default: 0,
      min: [0, 'Position cannot be negative'],
    },

    // Category metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      trim: true,
      default: '#2563eb',
    },
    icon: {
      type: String,
      trim: true,
    },

    // SEO fields
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
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and uniqueness
// Updated: Unique constraint now uses rootUserId instead of companyId
// This allows same category names for different root users
blogCategorySchema.index({ name: 1, rootUserId: 1 }, { unique: true });
blogCategorySchema.index({ position: 1, rootUserId: 1 });
blogCategorySchema.index({ isActive: 1, rootUserId: 1 });
blogCategorySchema.index({ isFeatured: 1, rootUserId: 1 });
blogCategorySchema.index({ slug: 1, rootUserId: 1 });
blogCategorySchema.index({ createdAt: 1, rootUserId: 1 });

// Pre-save middleware to generate slug and meta fields
blogCategorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (!this.metaTitle && this.name) {
    this.metaTitle = this.name;
  }
  if (!this.metaDescription && this.description) {
    this.metaDescription = this.description.substring(0, 160);
  }
  next();
});

// Force model recompilation to ensure new indexes are applied
const BlogCategory =
  mongoose.models.BlogCategory ||
  mongoose.model('BlogCategory', blogCategorySchema);

export default BlogCategory;
