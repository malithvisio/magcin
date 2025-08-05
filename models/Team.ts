import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Root user-based data isolation
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the RootUser model
      required: [true, 'Root User ID is required for data isolation'],
      index: true, // Add an index for faster queries
    },

    // Team member identification
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxlength: [100, 'Position cannot be more than 100 characters'],
    },
    image: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    // Additional fields for contact information
    phone1: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    phone2: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    email: {
      type: String,
      trim: true,
      maxlength: [100, 'Email cannot be more than 100 characters'],
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot be more than 200 characters'],
    },
    // Social media links
    facebook: {
      type: String,
      trim: true,
      maxlength: [500, 'Facebook link cannot be more than 500 characters'],
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [500, 'LinkedIn link cannot be more than 500 characters'],
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: [500, 'Instagram link cannot be more than 500 characters'],
    },
    tiktok: {
      type: String,
      trim: true,
      maxlength: [500, 'TikTok link cannot be more than 500 characters'],
    },
    linktree: {
      type: String,
      trim: true,
      maxlength: [500, 'LinkTree link cannot be more than 500 characters'],
    },
    // Status and ordering
    published: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
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
teamSchema.index({ name: 1 });
teamSchema.index({ rootUserId: 1 }); // Root user-based isolation
teamSchema.index({ published: 1, rootUserId: 1 }); // For filtering published team members by root user
teamSchema.index({ sortOrder: 1, rootUserId: 1 }); // For ordering by sort order within root user scope

// Pre-save middleware to ensure tenant isolation
teamSchema.pre('save', function (next) {
  // Ensure rootUserId is set when creating the team member
  // The rootUserId should be passed from the user context
  next();
});

// Static method to find team members by root user
teamSchema.statics.findByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId });
};

// Static method to find published team members by root user
teamSchema.statics.findPublishedByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId, published: true });
};

// Static method to count team members by root user
teamSchema.statics.countByRootUser = function (rootUserId: string) {
  return this.countDocuments({ rootUserId });
};

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team;
