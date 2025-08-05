import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
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
      required: [true, 'Root user ID is required for data isolation'],
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

    // Destination identification
    id: {
      type: String,
      required: [true, 'Destination ID is required'],
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    images: [
      {
        type: String,
        required: [true, 'At least one image is required'],
      },
    ],
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    imageAlt: {
      type: String,
      trim: true,
      default: '',
    },
    reviewStars: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    to_do: {
      type: String,
      required: [true, 'To do section title is required'],
      trim: true,
    },
    Highlight: [
      {
        type: String,
        required: [true, 'At least one highlight is required'],
      },
    ],
    call_tagline: {
      type: String,
      required: [true, 'Call tagline is required'],
      trim: true,
      maxlength: [200, 'Call tagline cannot be more than 200 characters'],
    },
    background: {
      type: String,
      required: [true, 'Background is required'],
      trim: true,
      maxlength: [200, 'Background cannot be more than 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    mini_description: {
      type: String,
      required: [true, 'Mini description is required'],
      trim: true,
      maxlength: [500, 'Mini description cannot be more than 500 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    moredes: {
      type: String,
      trim: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
    highlight: {
      type: Boolean,
      default: false,
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

// Create indexes for better performance - only create them once
if (!mongoose.models.Destination) {
  destinationSchema.index({ id: 1 });
  destinationSchema.index({ name: 1 });
  destinationSchema.index({ position: 1 });
  destinationSchema.index({ companyId: 1 }); // Company-based isolation
  destinationSchema.index({ userId: 1, companyId: 1 }); // Compound index for user within company
  destinationSchema.index({ rootUserId: 1, companyId: 1 }); // Compound index for root user within company
  destinationSchema.index({ published: 1, companyId: 1 }); // For filtering published destinations by company
  destinationSchema.index({ highlight: 1, companyId: 1 }); // For filtering highlighted destinations by company
}

// Pre-save middleware to ensure tenant isolation
destinationSchema.pre('save', function (next) {
  // Ensure tenantId is set from userId if not provided
  if (!this.tenantId && this.userId) {
    // This will be set when creating the destination
    // The tenantId should be passed from the user context
  }
  next();
});

// Static method to find destinations by company
destinationSchema.statics.findByCompany = function (companyId: string) {
  return this.find({ companyId });
};

// Static method to find destinations by user within company
destinationSchema.statics.findByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId });
};

// Static method to find destinations by root user within company
destinationSchema.statics.findByRootUser = function (
  rootUserId: string,
  companyId: string
) {
  return this.find({ rootUserId, companyId });
};

// Static method to find published destinations by company
destinationSchema.statics.findPublishedByCompany = function (
  companyId: string
) {
  return this.find({ companyId, published: true });
};

// Static method to find published destinations by user within company
destinationSchema.statics.findPublishedByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId, published: true });
};

// Static method to find published destinations by root user within company
destinationSchema.statics.findPublishedByRootUser = function (
  rootUserId: string,
  companyId: string
) {
  return this.find({ rootUserId, companyId, published: true });
};

// Static method to find highlighted destinations by company
destinationSchema.statics.findHighlightedByCompany = function (
  companyId: string
) {
  return this.find({ companyId, highlight: true });
};

// Static method to find highlighted destinations by user within company
destinationSchema.statics.findHighlightedByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId, highlight: true });
};

// Static method to find highlighted destinations by root user within company
destinationSchema.statics.findHighlightedByRootUser = function (
  rootUserId: string,
  companyId: string
) {
  return this.find({ rootUserId, companyId, highlight: true });
};

// Static method to count destinations by company
destinationSchema.statics.countByCompany = function (companyId: string) {
  return this.countDocuments({ companyId });
};

// Static method to count destinations by user within company
destinationSchema.statics.countByUser = function (
  userId: string,
  companyId: string
) {
  return this.countDocuments({ userId, companyId });
};

// Static method to count destinations by root user within company
destinationSchema.statics.countByRootUser = function (
  rootUserId: string,
  companyId: string
) {
  return this.countDocuments({ rootUserId, companyId });
};

const Destination =
  mongoose.models.Destination ||
  mongoose.model('Destination', destinationSchema);

export default Destination;
