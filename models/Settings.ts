import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'custom'],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
});

const settingsSchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Apartment-based data isolation
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

    // Settings content
    currencyType: {
      type: String,
      trim: true,
    },
    logoImage: {
      type: String,
      trim: true,
    },
    logoImagePath: {
      type: String,
      trim: true,
    },
    faviconIcon: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    companyDescription: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Company description cannot be more than 500 characters',
      ],
    },
    homePageTabTitle: {
      type: String,
      trim: true,
      maxlength: [
        100,
        'Home page tab title cannot be more than 100 characters',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    hotlineAssistantName: {
      type: String,
      trim: true,
      maxlength: [
        50,
        'Hotline assistant name cannot be more than 50 characters',
      ],
    },
    websites: [websiteSchema],
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
settingsSchema.index({ rootUserId: 1 }); // Apartment-based isolation
settingsSchema.index({ companyId: 1 }); // Company-based isolation
settingsSchema.index({ tenantId: 1 }); // Tenant-based isolation
settingsSchema.index({ rootUserId: 1, companyId: 1 }); // Compound index for apartment within company

// Pre-save middleware to ensure tenant isolation
settingsSchema.pre('save', function (next) {
  // Ensure tenantId is set from rootUserId if not provided
  if (!this.tenantId && this.rootUserId) {
    // This will be set when creating the settings
    // The tenantId should be passed from the user context
  }
  next();
});

// Static method to find settings by root user (apartment)
settingsSchema.statics.findByRootUser = function (rootUserId: string) {
  return this.findOne({ rootUserId });
};

// Static method to find settings by company
settingsSchema.statics.findByCompany = function (companyId: string) {
  return this.find({ companyId });
};

// Static method to find settings by root user within company
settingsSchema.statics.findByRootUserAndCompany = function (
  rootUserId: string,
  companyId: string
) {
  return this.findOne({ rootUserId, companyId });
};

const Settings =
  mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export default Settings;
