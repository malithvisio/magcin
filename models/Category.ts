import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  // Multi-tenant reference - Root user-based data isolation
  rootUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the RootUser model
    required: [true, 'Root User ID is required for data isolation'],
    index: true, // Add an index for faster queries
  },

  // Category identification
  name: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for better performance
CategorySchema.index({ name: 1 });
CategorySchema.index({ rootUserId: 1 }); // Root user-based isolation
CategorySchema.index({ published: 1, rootUserId: 1 }); // For filtering published categories by root user
CategorySchema.index({ position: 1, rootUserId: 1 }); // For ordering by position within root user scope

// Compound unique index to prevent duplicate category names within the same root user context
// This allows different root users to have categories with the same name
// But prevents the same root user from having duplicate category names
CategorySchema.index(
  { rootUserId: 1, name: 1 },
  { unique: true, name: 'unique_category_per_root_user' }
);

// Pre-save middleware to ensure tenant isolation
CategorySchema.pre('save', function (next) {
  // Ensure rootUserId is set when creating the category
  // The rootUserId should be passed from the user context
  next();
});

// Static method to find categories by root user
CategorySchema.statics.findByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId });
};

// Static method to find published categories by root user
CategorySchema.statics.findPublishedByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId, published: true });
};

// Static method to count categories by root user
CategorySchema.statics.countByRootUser = function (rootUserId: string) {
  return this.countDocuments({ rootUserId });
};

const Category = models.Category || model('Category', CategorySchema);

export default Category;
