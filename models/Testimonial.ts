import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Root user-based data isolation
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the RootUser model
      required: [true, 'Root User ID is required for data isolation'],
      index: true, // Add an index for faster queries
    },

    // Testimonial identification
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    review: {
      type: String,
      required: [true, 'Review is required'],
      trim: true,
      maxlength: [1000, 'Review cannot be more than 1000 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5,
    },
    image: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
testimonialSchema.index({ name: 1 });
testimonialSchema.index({ rootUserId: 1 }); // Root user-based isolation
testimonialSchema.index({ published: 1, rootUserId: 1 }); // For filtering published testimonials by root user
testimonialSchema.index({ position: 1, rootUserId: 1 }); // For ordering by position within root user scope

// Ensure a testimonial's name is unique *within* a single root user's account
testimonialSchema.index({ name: 1, rootUserId: 1 }, { unique: true });

// Static method to find testimonials by root user
testimonialSchema.statics.findByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId });
};

// Static method to find published testimonials by root user
testimonialSchema.statics.findPublishedByRootUser = function (
  rootUserId: string
) {
  return this.find({ rootUserId, published: true });
};

// Static method to count testimonials by root user
testimonialSchema.statics.countByRootUser = function (rootUserId: string) {
  return this.countDocuments({ rootUserId });
};

const Testimonial =
  mongoose.models.Testimonial ||
  mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
