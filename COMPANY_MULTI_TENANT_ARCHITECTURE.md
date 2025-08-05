# Company-Based Multi-Tenant Architecture

## Overview

This document describes the company-based multi-tenant architecture implemented in the tourism CMS
system. The system allows multiple companies to manage their own tour packages, destinations,
activities, and other content while maintaining complete data isolation between companies.

## Architecture Principles

### 1. Company-Based Isolation

- Each company has a unique `companyId`
- All content (packages, destinations, activities, etc.) is tagged with the company's `companyId`
- Users within the same company share data
- Data is completely isolated between different companies

### 2. User Management Within Companies

- Multiple users can belong to the same company
- All users in a company share the same `companyId`
- Users can have different roles (user, admin, super_admin)
- Company admins can manage all content within their company

### 3. Data Sharing Within Companies

- Same destination/package names are allowed within a company
- All users in a company can see and manage shared content
- Content is isolated between companies but shared within companies

## Database Schema

### User Model

```typescript
{
  // Basic user information
  name: String,
  email: String,
  password: String,
  role: String, // 'user', 'admin', 'super_admin'

  // Multi-tenant identification
  companyId: String, // Shared by all users in the company
  tenantId: String,  // Unique per user

  // Subscription management
  subscriptionPlan: String, // 'free', 'pro', 'pro_max'
  subscriptionStatus: String,

  // Usage tracking
  usageStats: {
    packages: Number,
    destinations: Number,
    activities: Number,
    blogs: Number,
    teamMembers: Number,
    testimonials: Number
  },

  // Company information
  companyName: String,
  companyDescription: String,
  // ... other fields
}
```

### Content Models (Package, Destination, Activity, etc.)

```typescript
{
  // Multi-tenant reference
  userId: ObjectId,    // Creator of the content
  companyId: String,   // Company this content belongs to
  tenantId: String,    // Tenant ID for backward compatibility

  // Content fields
  name: String,
  title: String,
  // ... other content fields
}
```

## Key Features

### 1. Company-Based Data Isolation

- All queries filter by `companyId`
- Users can only access content from their company
- Complete isolation between companies

### 2. Shared Data Within Companies

- Multiple users can create and manage content
- Same names allowed within company
- All users see shared content

### 3. Subscription Management

- Subscription limits apply at company level
- Usage tracking per company
- Different plans: Free, Pro, Pro Max

### 4. Role-Based Access Control

- **Super Admin**: Can access all companies
- **Admin**: Can manage all content within their company
- **User**: Can create and manage their own content within company

## API Implementation

### Authentication

```typescript
// Login response includes company context
{
  user: {
    id: string,
    name: string,
    email: string,
    role: string,
    companyId: string,  // Company identifier
    tenantId: string,
    subscriptionPlan: string
  }
}

// Headers for API requests
x-user-id: string
x-user-email: string
x-company-id: string
x-tenant-id: string
```

### API Routes

All API routes now filter by `companyId`:

```typescript
// Example: GET /api/packages
const query = {
  companyId: userContext.companyId,
  // ... other filters
};
```

### Utility Functions

```typescript
// Company-based filtering
createCompanyFilter(companyId: string)
createUserFilter(userId: string, companyId: string)

// Pagination with company context
createCompanyPaginationOptions(page, limit, companyId)
createUserPaginationOptions(page, limit, userId, companyId)
```

## Migration Process

### 1. Run Migration Script

```bash
node scripts/migrate-to-company-tenant.js
```

This script will:

- Add `companyId` to all existing users
- Update all content models with `companyId`
- Create necessary indexes
- Maintain data integrity

### 2. Update API Routes

All API routes have been updated to use company-based filtering:

- `/api/packages` - Company-based package management
- `/api/destinations` - Company-based destination management
- `/api/activities` - Company-based activity management
- `/api/blogs` - Company-based blog management
- `/api/team` - Company-based team management
- `/api/testimonials` - Company-based testimonial management
- `/api/categories` - Company-based category management
- `/api/bookings` - Company-based booking management

## Usage Examples

### 1. Creating Content Within Company

```typescript
// User creates a package
const packageData = {
  name: 'Sri Lanka Adventure',
  title: 'Amazing Sri Lanka Tour',
  // ... other fields
  companyId: userContext.companyId, // Automatically set
  userId: userContext.userId,
};

// All users in the same company can see this package
```

### 2. Querying Company Data

```typescript
// Get all packages for the company
const packages = await Package.findByCompany(companyId);

// Get packages created by specific user within company
const userPackages = await Package.findByUser(userId, companyId);
```

### 3. Managing Multiple Users

```typescript
// Add new user to existing company
const newUser = new User({
  name: 'John Doe',
  email: 'john@company.com',
  companyId: 'company_123', // Same as existing users
  role: 'user',
});

// All users with same companyId share data
```

## Benefits

### 1. Scalability

- Easy to add new companies
- No data mixing between companies
- Efficient querying with indexes

### 2. Flexibility

- Multiple users per company
- Shared data within companies
- Role-based permissions

### 3. Security

- Complete data isolation
- Company-based access control
- No cross-company data leakage

### 4. User Experience

- Users see all company content
- Same names allowed within company
- Intuitive sharing model

## Testing

### 1. Test Company Isolation

```bash
# Create multiple companies
# Verify data isolation between companies
# Test shared data within companies
```

### 2. Test User Management

```bash
# Add multiple users to same company
# Test role-based access
# Verify shared content visibility
```

### 3. Test API Endpoints

```bash
# Test all CRUD operations
# Verify company-based filtering
# Test subscription limits
```

## Monitoring and Maintenance

### 1. Database Indexes

- `companyId` indexes on all models
- Compound indexes for efficient queries
- Regular index maintenance

### 2. Usage Tracking

- Monitor company usage statistics
- Track subscription limits
- Alert on quota violations

### 3. Performance

- Query optimization for company filtering
- Efficient pagination
- Regular performance monitoring

## Future Enhancements

### 1. Advanced Features

- Company-specific themes
- Custom domains per company
- Advanced analytics per company

### 2. Integration

- Third-party integrations per company
- Custom payment gateways
- Company-specific APIs

### 3. Management

- Super admin dashboard
- Company management tools
- Bulk operations per company

## Conclusion

The company-based multi-tenant architecture provides a robust, scalable, and secure foundation for
managing multiple tourism companies on a single platform. It ensures complete data isolation while
allowing flexible user management and content sharing within companies.
