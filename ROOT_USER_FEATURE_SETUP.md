# Root User Filtering Feature - Quick Setup Guide

## Overview

This guide explains how to set up and test the multi-tenant root user filtering feature that allows
switching between different tourism companies' data without authentication.

## Current Setup

### 1. Default Root User

- **ID**: `68786e4cd6e23d3a8ec0fe34`
- **Name**: Tours Trails Main
- **Status**: Active

### 2. Feature Location

- **Component**: `components/sections/News1.tsx` (Top Rated Destinations section)
- **API**: `app/api/destinations/public/route.ts`
- **Configuration**: `util/root-user-config.ts`
- **Hook**: `util/useRootUserFilter.ts`

## Testing the Feature

### 1. Current Behavior

- The component will show destinations filtered by the default root user ID
- If you have destinations in your database with `rootUserId: '68786e4cd6e23d3a8ec0fe34'`, they will
  be displayed
- The dropdown selector will only appear if multiple root users are configured

### 2. Adding Another Root User for Testing

To test the switching functionality:

1. **Add a new root user** in `util/root-user-config.ts`:

```typescript
export const ROOT_USERS: RootUserConfig[] = [
  {
    rootUserId: '68786e4cd6e23d3a8ec0fe34',
    name: 'Tours Trails Main',
    description: 'Main Tours Trails apartment with premium tourism experiences',
    isActive: true,
  },
  {
    rootUserId: '507f1f77bcf86cd799439011', // Replace with actual MongoDB ObjectId
    name: 'Adventure Tourism Co.',
    description: 'Adventure tourism company with exciting outdoor experiences',
    isActive: true,
  },
];
```

2. **Add test data** to your database:

```javascript
// In MongoDB, add destinations with the new rootUserId
db.destinations.insertOne({
  rootUserId: ObjectId('507f1f77bcf86cd799439011'),
  name: 'Adventure Mountain',
  location: 'Mountain Region',
  description: 'Exciting mountain adventure',
  published: true,
  // ... other required fields
});
```

3. **Test the feature**:
   - Visit the page with the News1 component
   - You should see a dropdown selector with both root users
   - Switch between them to see different destinations

## API Testing

### 1. Test with Default Root User

```bash
curl "http://localhost:3000/api/destinations/public?limit=5"
```

### 2. Test with Specific Root User

```bash
curl "http://localhost:3000/api/destinations/public?rootUserId=68786e4cd6e23d3a8ec0fe34&limit=5"
```

### 3. Test with Invalid Root User

```bash
curl "http://localhost:3000/api/destinations/public?rootUserId=invalid_id&limit=5"
```

## Database Requirements

### 1. Destination Schema

Make sure your destinations have the required `rootUserId` field:

```typescript
{
  rootUserId: ObjectId, // Required for filtering
  name: String,
  location: String,
  description: String,
  published: Boolean, // Must be true for public API
  // ... other fields
}
```

### 2. Sample Data

Here's a sample destination document:

```javascript
{
  _id: ObjectId("..."),
  rootUserId: ObjectId("68786e4cd6e23d3a8ec0fe34"),
  name: "Sigiriya Rock Fortress",
  location: "Sigiriya, Sri Lanka",
  description: "Ancient palace and fortress complex",
  mini_description: "UNESCO World Heritage site",
  images: ["image1.jpg", "image2.jpg"],
  published: true,
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Troubleshooting

### 1. No Data Showing

- Check if destinations exist with the correct `rootUserId`
- Verify `published: true` for public API
- Check browser console for errors

### 2. Dropdown Not Appearing

- Ensure multiple root users are configured in `ROOT_USERS` array
- Check that all root users have `isActive: true`

### 3. API Errors

- Check server logs for detailed error messages
- Verify MongoDB connection
- Ensure all required fields are present in destination documents

### 4. Selection Not Persisting

- Check if localStorage is enabled in browser
- Verify no JavaScript errors in console
- Check if `setCurrentRootUserId` function is being called

## Extending the Feature

### 1. Add to Other Components

Use the `useRootUserFilter` hook in other components:

```typescript
import { useRootUserFilter, useRootUserData } from '@/util/useRootUserFilter';

export default function MyComponent() {
  const { currentRootUserId, setRootUserId, activeRootUsers } = useRootUserFilter();

  // Use the hook for data fetching
  const { data, isLoading } = useRootUserData(async queryParam => {
    const response = await fetch(`/api/my-endpoint?${queryParam}`);
    return response.json();
  });

  // Component logic...
}
```

### 2. Add to Other APIs

Update other API endpoints to support root user filtering:

```typescript
// In your API route
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rootUserId = searchParams.get('rootUserId');

  let query: any = { published: true };
  if (rootUserId && isValidRootUserId(rootUserId)) {
    query.rootUserId = rootUserId;
  } else {
    const defaultFilter = createRootUserFilter();
    query.rootUserId = defaultFilter.rootUserId;
  }

  const data = await YourModel.find(query);
  return NextResponse.json({ data });
}
```

## Performance Considerations

### 1. Database Indexes

Ensure proper indexes exist:

```typescript
// In your model schema
schema.index({ rootUserId: 1 });
schema.index({ published: 1, rootUserId: 1 });
```

### 2. Caching

The feature uses localStorage for persistence, but consider:

- Server-side caching for frequently accessed data
- CDN caching for static assets
- Redis caching for API responses

## Security Notes

- Root user IDs are validated against the configuration
- Only active root users are allowed
- No authentication required for public pages
- Data is completely isolated between root users

## Next Steps

1. **Test the current implementation** with your existing data
2. **Add more root users** as needed
3. **Extend to other content types** (packages, activities, blogs, etc.)
4. **Add admin panel** for managing root users
5. **Implement analytics** per root user
