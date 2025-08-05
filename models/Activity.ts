import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Company-based data isolation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for data isolation'],
      index: true,
    },
    rootUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Root User ID is required for data isolation'],
      index: true,
    },
    companyId: {
      type: String,
      required: [true, 'Company ID is required for data isolation'],
      index: true,
    },
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required for data isolation'],
      index: true,
    },

    // Activity identification
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [100, 'Activity name cannot be more than 100 characters'],
    },
    // Main page card fields
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
    },
    reviewStars: {
      type: Number,
      min: [0, 'Review stars cannot be less than 0'],
      max: [5, 'Review stars cannot be more than 5'],
    },
    highlight: {
      type: Boolean,
      default: false,
    },
    // Inside page fields
    insideTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Inside title cannot be more than 200 characters'],
    },
    insideDescription: {
      type: String,
      trim: true,
    },
    insideImageUrl: {
      type: String,
      trim: true,
    },
    insideImageAlt: {
      type: String,
      trim: true,
    },
    insideImages: {
      type: [
        {
          url: {
            type: String,
            required: true,
            trim: true,
          },
          alt: {
            type: String,
            trim: true,
          },
          path: {
            type: String,
            trim: true,
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    insideShortDescription: {
      type: String,
      trim: true,
      maxlength: [168, 'Short description cannot be more than 168 characters'],
    },
    highlights: {
      type: [
        {
          point: {
            type: String,
            required: true,
            trim: true,
            maxlength: [
              200,
              'Highlight point cannot be more than 200 characters',
            ],
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    insideTabTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Tab title cannot be more than 100 characters'],
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
activitySchema.index({ name: 1 });
activitySchema.index({ companyId: 1 }); // Company-based isolation
activitySchema.index({ userId: 1, companyId: 1 }); // Compound index for user within company
activitySchema.index({ published: 1, companyId: 1 }); // For filtering published activities by company
activitySchema.index({ highlight: 1, companyId: 1 }); // For filtering highlighted activities by company
activitySchema.index({ position: 1, companyId: 1 }); // For ordering by position within company scope

// Pre-save middleware to ensure tenant isolation
activitySchema.pre('save', function (next) {
  // Ensure tenantId is set from userId if not provided
  if (!this.tenantId && this.userId) {
    // This will be set when creating the activity
    // The tenantId should be passed from the user context
  }
  next();
});

// Static method to find activities by company
activitySchema.statics.findByCompany = function (companyId: string) {
  return this.find({ companyId });
};

// Static method to find activities by user within company
activitySchema.statics.findByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId });
};

// Static method to find published activities by company
activitySchema.statics.findPublishedByCompany = function (companyId: string) {
  return this.find({ companyId, published: true });
};

// Static method to find published activities by user within company
activitySchema.statics.findPublishedByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId, published: true });
};

// Static method to find highlighted activities by company
activitySchema.statics.findHighlightedByCompany = function (companyId: string) {
  return this.find({ companyId, highlight: true });
};

// Static method to find highlighted activities by user within company
activitySchema.statics.findHighlightedByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId, highlight: true });
};

// Static method to count activities by company
activitySchema.statics.countByCompany = function (companyId: string) {
  return this.countDocuments({ companyId });
};

// Static method to count activities by user within company
activitySchema.statics.countByUser = function (
  userId: string,
  companyId: string
) {
  return this.countDocuments({ userId, companyId });
};

const Activity =
  mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;
