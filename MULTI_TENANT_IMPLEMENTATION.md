# Multi-Tenant Implementation Guide

## Overview

This implementation provides a complete multi-tenant system where each root user can only see and
manage content related to their own company. The system ensures data isolation between different
companies/tenants.

## Key Components

### 1. User Authentication & Context

#### AuthContext (`contexts/AuthContext.tsx`)

- Manages user authentication state
- Includes company and tenant information
- Provides `isRootUser`, `companyId`, and `tenantId` for filtering

#### Auth Service (`util/auth.ts`)

- Handles API authentication headers
- Includes company ID in requests
- Provides helper methods for admin/root user checks

### 2. API Authentication (`util/api-utils.ts`)

- Provides `apiRequest()` function for authenticated API calls
- Automatically includes user authentication headers
- Ensures all admin requests are properly authenticated

### 3. Multi-Tenant Filtering

#### Tenant Context (`util/tenantContext.ts`)

- `getUserContext()`: Extracts user context from request headers
- `createTenantFilter()`: Creates database filters for tenant isolation
- Provides helper functions for company and user-specific queries

#### Database Models

All models include multi-tenant fields:

```typescript
{
  userId: ObjectId,      // User who created the content
  companyId: String,     // Company identifier
  tenantId: String,      // Tenant identifier
  // ... other fields
}
```

### 4. Admin Panel Protection

#### AdminGuard (`components/auth/AdminGuard.tsx`)

- Protects all admin routes
- Checks for proper authentication and admin privileges
- Redirects unauthorized users to login

## How It Works

### 1. Login Process

1. User logs in with email/password
2. Server validates credentials and returns user data including:
   - `companyId`: Company identifier
   - `tenantId`: Tenant identifier
   - `role`: User role (root_user, admin, etc.)
   - `isRootUser`: Boolean flag for root users

### 2. Data Isolation

1. All API requests include authentication headers
2. Backend extracts user context from headers
3. Database queries are filtered by `companyId` and `tenantId`
4. Users only see data from their own company

### 3. Admin Dashboard

1. Dashboard shows only data related to the logged-in root user
2. Analytics include counts for all content types (destinations, packages, activities, etc.)
3. Recent activities show only items from the user's company
4. Quick actions link to add pages for the user's company

## Database Structure

### User Model

```typescript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: String,           // 'root_user', 'admin', 'member'
  isRootUser: Boolean,    // true for root users
  companyId: String,      // Company identifier
  tenantId: String,       // Tenant identifier
  // ... other fields
}
```

### Content Models (Destinations, Packages, etc.)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,       // Reference to User
  companyId: String,      // Company identifier
  tenantId: String,       // Tenant identifier
  // ... content-specific fields
}
```

## API Endpoints

### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout
- `GET /api/auth/check-user`: Check current user

### Content Management

All endpoints automatically filter by tenant:

- `GET /api/destinations`: Get destinations for current user's company
- `POST /api/destinations`: Create destination for current user's company
- `PUT /api/destinations/[id]`: Update destination (tenant-filtered)
- `DELETE /api/destinations/[id]`: Delete destination (tenant-filtered)

### Analytics

- `GET /api/analytics`: Get analytics for current user's company

## Frontend Implementation

### Admin Dashboard

- Uses `AdminGuard` for protection
- Shows company-specific welcome message
- Displays only user's company data
- Quick actions for adding content

### Content Management Pages

- All pages use `apiRequest()` for authenticated calls
- Data is automatically filtered by tenant
- Users can only see/edit their own company's content

## Security Features

### 1. Authentication Headers

All API requests include:

```
x-user-id: User ID
x-user-email: User email
x-company-id: Company ID
x-tenant-id: Tenant ID
```

### 2. Database Filtering

All queries include tenant filters:

```javascript
const tenantFilter = {
  userId: userContext.userId,
  companyId: userContext.companyId,
  tenantId: userContext.tenantId,
};
```

### 3. Route Protection

- `AdminGuard` protects all admin routes
- Checks for proper authentication and admin privileges
- Redirects unauthorized users

## Usage Examples

### Creating Content

```typescript
// Frontend
const response = await apiRequest('/api/destinations', {
  method: 'POST',
  body: {
    name: 'New Destination',
    // ... other fields
  },
});

// Backend automatically adds:
// - userId: from authentication
// - companyId: from user context
// - tenantId: from user context
```

### Fetching Content

```typescript
// Frontend
const response = await apiRequest('/api/destinations');
const destinations = await response.json();

// Backend automatically filters by tenant
// Only returns destinations for the user's company
```

### Analytics

```typescript
// Frontend
const response = await apiRequest('/api/analytics');
const analytics = await response.json();

// Backend returns counts for user's company only
// {
//   stats: {
//     destinations: { total: 5, published: 3, ... },
//     packages: { total: 10, published: 7, ... },
//     // ... other content types
//   }
// }
```

## Benefits

1. **Data Isolation**: Each company's data is completely isolated
2. **Security**: Users can only access their own company's data
3. **Scalability**: Easy to add new companies/tenants
4. **Maintainability**: Clear separation of concerns
5. **User Experience**: Clean, company-specific admin interface

## Testing

To test the multi-tenant system:

1. Create multiple root users with different `companyId` values
2. Log in as different users
3. Verify that each user only sees their own company's data
4. Verify that analytics show only company-specific counts
5. Verify that CRUD operations only affect the user's company data

## Troubleshooting

### Common Issues

1. **User sees all data**: Check that API endpoints are using `getUserContext()` and
   `createTenantFilter()`
2. **Authentication errors**: Verify that login is setting proper user data with `companyId` and
   `tenantId`
3. **API requests failing**: Ensure all admin pages use `apiRequest()` instead of `fetch()`
4. **Admin access denied**: Check that user has proper role (`root_user` or `admin`)

### Debug Information

The system logs important information:

- Login attempts and user details
- Company ID and tenant ID for each request
- Admin access granted/denied
- API request authentication status

Check browser console and server logs for debugging information.
