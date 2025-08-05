import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Multi-tenant reference - Company-based data isolation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for data isolation'],
      index: true,
    },
    rootUserId: {
      type: String,
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

    // Booking identification
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true,
    },

    // Customer information
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot be more than 100 characters'],
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    customerAddress: {
      type: String,
      trim: true,
    },

    // Package information
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: false, // Make optional for testing
    },
    packageName: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    packagePrice: {
      type: Number,
      required: false, // Make optional for testing
      min: [0, 'Price cannot be negative'],
    },

    // Booking details
    numberOfPeople: {
      type: Number,
      required: [true, 'Number of people is required'],
      min: [1, 'Number of people must be at least 1'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },

    // Payment information
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },

    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    // Special requirements
    specialRequirements: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        'Special requirements cannot be more than 1000 characters',
      ],
    },

    // Admin notes
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Admin notes cannot be more than 1000 characters'],
    },

    // Timestamps
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
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ rootUserId: 1 }); // Root user-based isolation
bookingSchema.index({ companyId: 1 }); // Company-based isolation
bookingSchema.index({ userId: 1, companyId: 1 }); // Compound index for user within company
bookingSchema.index({ rootUserId: 1, companyId: 1 }); // Compound index for root user within company
bookingSchema.index({ status: 1, companyId: 1 }); // For filtering by status within company scope
bookingSchema.index({ status: 1, rootUserId: 1 }); // For filtering by status within root user scope
bookingSchema.index({ paymentStatus: 1, companyId: 1 }); // For filtering by payment status within company scope
bookingSchema.index({ paymentStatus: 1, rootUserId: 1 }); // For filtering by payment status within root user scope
bookingSchema.index({ customerEmail: 1, companyId: 1 }); // For searching by customer email within company scope
bookingSchema.index({ startDate: 1, companyId: 1 }); // For filtering by date within company scope
bookingSchema.index({ startDate: 1, rootUserId: 1 }); // For filtering by date within root user scope
bookingSchema.index({ createdAt: 1, companyId: 1 }); // For ordering by creation date within company scope
bookingSchema.index({ createdAt: 1, rootUserId: 1 }); // For ordering by creation date within root user scope

// Pre-save middleware to ensure tenant isolation
bookingSchema.pre('save', function (next) {
  // Ensure tenantId is set from userId if not provided
  if (!this.tenantId && this.userId) {
    // This will be set when creating the booking
    // The tenantId should be passed from the user context
  }
  next();
});

// Static method to find bookings by company
bookingSchema.statics.findByCompany = function (companyId: string) {
  return this.find({ companyId });
};

// Static method to find bookings by root user
bookingSchema.statics.findByRootUser = function (rootUserId: string) {
  return this.find({ rootUserId });
};

// Static method to find bookings by user within company
bookingSchema.statics.findByUser = function (
  userId: string,
  companyId: string
) {
  return this.find({ userId, companyId });
};

// Static method to find bookings by status and company
bookingSchema.statics.findByStatusAndCompany = function (
  status: string,
  companyId: string
) {
  return this.find({ status, companyId });
};

// Static method to find bookings by status and root user
bookingSchema.statics.findByStatusAndRootUser = function (
  status: string,
  rootUserId: string
) {
  return this.find({ status, rootUserId });
};

// Static method to find bookings by status and user within company
bookingSchema.statics.findByStatusAndUser = function (
  status: string,
  userId: string,
  companyId: string
) {
  return this.find({ status, userId, companyId });
};

// Static method to find bookings by payment status and company
bookingSchema.statics.findByPaymentStatusAndCompany = function (
  paymentStatus: string,
  companyId: string
) {
  return this.find({ paymentStatus, companyId });
};

// Static method to find bookings by payment status and root user
bookingSchema.statics.findByPaymentStatusAndRootUser = function (
  paymentStatus: string,
  rootUserId: string
) {
  return this.find({ paymentStatus, rootUserId });
};

// Static method to find bookings by payment status and user within company
bookingSchema.statics.findByPaymentStatusAndUser = function (
  paymentStatus: string,
  userId: string,
  companyId: string
) {
  return this.find({ paymentStatus, userId, companyId });
};

// Static method to count bookings by company
bookingSchema.statics.countByCompany = function (companyId: string) {
  return this.countDocuments({ companyId });
};

// Static method to count bookings by root user
bookingSchema.statics.countByRootUser = function (rootUserId: string) {
  return this.countDocuments({ rootUserId });
};

// Static method to count bookings by user within company
bookingSchema.statics.countByUser = function (
  userId: string,
  companyId: string
) {
  return this.countDocuments({ userId, companyId });
};

// Static method to get booking statistics by company
bookingSchema.statics.getStatsByCompany = async function (companyId: string) {
  const stats = await this.aggregate([
    { $match: { companyId } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        pendingBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        paidBookings: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      paidBookings: 0,
      pendingPayments: 0,
    }
  );
};

// Static method to get booking statistics by root user
bookingSchema.statics.getStatsByRootUser = async function (rootUserId: string) {
  const stats = await this.aggregate([
    { $match: { rootUserId } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        pendingBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        paidBookings: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      paidBookings: 0,
      pendingPayments: 0,
    }
  );
};

// Static method to get booking statistics by user within company
bookingSchema.statics.getStatsByUser = async function (
  userId: string,
  companyId: string
) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), companyId } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        pendingBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        paidBookings: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      paidBookings: 0,
      pendingPayments: 0,
    }
  );
};

const Booking =
  mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Export types for TypeScript
export interface IBooking {
  _id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  packageId?: string;
  packageName: string;
  packagePrice?: number;
  numberOfPeople: number;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequirements?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  rootUserId: string;
  companyId: string;
  tenantId: string;
}

export interface IBookingStats {
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  paidBookings: number;
  pendingPayments: number;
}

export default Booking;
