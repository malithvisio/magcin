# Multi-Tenant Root User Filtering Feature

## Overview

This feature allows the Tours Trails application to filter and display data based on different root
users (apartments) without requiring authentication. Users can switch between different tourism
companies and view their respective destinations, packages, and other content.

## Key Features

### 1. Root User-Based Data Filtering

- Filter all data by `rootUserId` to show only content belonging to specific tourism companies
- No authentication required for public pages
- Persistent selection using localStorage
- Easy switching between different root users

### 2. Dynamic Content Loading

- Destinations, packages, activities, and other content are filtered by root user
- Real-time data updates when switching between root users
- Fallback to default root user if none is selected

### 3. User-Friendly Interface

- Dropdown selector for choosing different tourism companies
- Only shows selector when multiple root users are available
- Clear indication of which company's data is being displayed

## Architecture

### 1. Configuration Management (`util/root-user-config.ts`)

```typescript
// Root user configuration interface
interface RootUserConfig {
  rootUserId: string;
  name: string;
  description: string;
  isActive: boolean;
}

// Available root users
export const ROOT_USERS: RootUserConfig[] = [
  {
    rootUserId: '68786e4cd6e23d3a8ec0fe34',
    name: 'Tours Trails Main',
    description: 'Main Tours Trails apartment with premium tourism experiences',
    isActive: true,
  },
  // Add more root users here
];
```

### 2. Core Functions

#### Get Current Root User ID

```typescript
function getCurrentRootUserId(): string;
```

- Retrieves the currently selected root user ID from localStorage
- Falls back to default if no selection is stored
- Validates against available root users

#### Set Root User ID

```typescript
function setCurrentRootUserId(rootUserId: string): void;
```

- Stores the selected root user ID in localStorage
- Persists selection across browser sessions

#### Create Database Filter

```typescript
function createRootUserFilter(rootUserId?: string): { rootUserId: string };
```

- Creates MongoDB filter object for root user queries
- Used in API endpoints for data filtering

#### Create Query Parameter

```typescript
function createRootUserQueryParam(rootUserId?: string): string;
```

- Creates URL query parameter for API requests
- Format: `rootUserId=68786e4cd6e23d3a8ec0fe34`

## Implementation

### 1. API Endpoints

#### Updated Public Destinations API (`app/api/destinations/public/route.ts`)

```typescript
// GET /api/destinations/public?rootUserId=68786e4cd6e23d3a8ec0fe34
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rootUserId = searchParams.get('rootUserId');

  // Validate rootUserId if provided
  if (rootUserId && !isValidRootUserId(rootUserId)) {
    return NextResponse.json({ error: 'Invalid root user ID' }, { status: 400 });
  }

  // Build query with root user filter
  let query: any = { published: true };

  if (rootUserId) {
    query.rootUserId = rootUserId;
  } else {
    const defaultFilter = createRootUserFilter();
    query.rootUserId = defaultFilter.rootUserId;
  }

  const destinations = await Destination.find(query);
  return NextResponse.json({ destinations, rootUserId: query.rootUserId });
}
```

### 2. Frontend Components

#### Updated News1 Component (`components/sections/News1.tsx`)

```typescript
export default function TopRated2() {
  const [currentRootUserId, setCurrentRootUserIdState] = useState<string>('');
  const [activeRootUsers, setActiveRootUsers] = useState<any[]>([]);

  useEffect(() => {
    // Initialize root user state
    const rootUserId = getCurrentRootUserId();
    setCurrentRootUserIdState(rootUserId);
    setActiveRootUsers(getActiveRootUsers());
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      const rootUserId = getCurrentRootUserId();
      const queryParam = createRootUserQueryParam(rootUserId);
      const response = await fetch(`/api/destinations/public?limit=10&${queryParam}`);
      // ... handle response
    };
    fetchDestinations();
  }, [currentRootUserId]);

  const handleRootUserChange = (rootUserId: string) => {
    setCurrentRootUserId(rootUserId);
    setCurrentRootUserIdState(rootUserId);
  };

  return (
    <section>
      {/* Root User Selector */}
      {activeRootUsers.length > 1 && (
        <select
          value={currentRootUserId}
          onChange={(e) => handleRootUserChange(e.target.value)}
        >
          {activeRootUsers.map((user) => (
            <option key={user.rootUserId} value={user.rootUserId}>
              {user.name}
            </option>
          ))}
        </select>
      )}
      {/* Destinations display */}
    </section>
  );
}
```

## Database Schema

### Destination Model (Example)

```typescript
const destinationSchema = new mongoose.Schema({
  // Multi-tenant reference - Root user-based data isolation
  rootUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Root User ID is required for data isolation'],
    index: true,
  },

  // Other fields...
  name: String,
  location: String,
  description: String,
  published: Boolean,
});
```

### Indexes for Performance

```typescript
// Create indexes for better performance
destinationSchema.index({ rootUserId: 1 });
destinationSchema.index({ published: 1, rootUserId: 1 });
destinationSchema.index({ position: 1, rootUserId: 1 });
```

## Usage Instructions

### 1. Adding New Root Users

To add a new root user (tourism company):

1. **Update Configuration** (`util/root-user-config.ts`):

```typescript
export const ROOT_USERS: RootUserConfig[] = [
  {
    rootUserId: '68786e4cd6e23d3a8ec0fe34',
    name: 'Tours Trails Main',
    description: 'Main Tours Trails apartment',
    isActive: true,
  },
  {
    rootUserId: 'new_root_user_id_here',
    name: 'New Tourism Company',
    description: 'Another tourism company',
    isActive: true,
  },
];
```

2. **Ensure Data Exists**: Make sure the new root user has data in the database with the correct
   `rootUserId`.

### 2. Switching Between Root Users

1. **Frontend**: Use the dropdown selector in the component
2. **API**: Add `rootUserId` parameter to API calls
3. **Persistence**: Selection is automatically saved to localStorage

### 3. API Usage Examples

#### Fetch Destinations for Specific Root User

```javascript
// Frontend
const response = await fetch('/api/destinations/public?rootUserId=68786e4cd6e23d3a8ec0fe34');

// Or using utility function
const queryParam = createRootUserQueryParam('68786e4cd6e23d3a8ec0fe34');
const response = await fetch(`/api/destinations/public?${queryParam}`);
```

#### Fetch with Default Root User

```javascript
// Uses default root user if none specified
const response = await fetch('/api/destinations/public');
```

## Security Considerations

### 1. Input Validation

- All root user IDs are validated against the configuration
- Invalid root user IDs return 400 error
- Only active root users are allowed

### 2. Data Isolation

- Database queries are filtered by `rootUserId`
- No cross-root-user data access possible
- Each root user's data is completely isolated

### 3. Public Access

- No authentication required for public pages
- Root user selection is client-side only
- Server validates all root user IDs

## Performance Optimizations

### 1. Database Indexes

- Index on `rootUserId` for fast filtering
- Compound indexes for common query patterns
- Index on `published` + `rootUserId` for public content

### 2. Caching

- Root user selection cached in localStorage
- API responses can be cached per root user
- Component state management for smooth UX

### 3. Query Optimization

- Efficient MongoDB queries with proper filtering
- Pagination support for large datasets
- Minimal data transfer with selective field projection

## Troubleshooting

### Common Issues

1. **No Data Showing**
   - Check if root user ID exists in database
   - Verify data has correct `rootUserId` field
   - Ensure data is published (`published: true`)

2. **Invalid Root User Error**
   - Verify root user ID is in `ROOT_USERS` configuration
   - Check if root user is marked as `isActive: true`
   - Ensure root user ID format is correct

3. **Selection Not Persisting**
   - Check localStorage is enabled in browser
   - Verify `setCurrentRootUserId` function is called
   - Check for JavaScript errors in console

### Debug Information

The API includes debug logging:

```javascript
console.log('Root User ID:', rootUserId || 'default');
console.log('Query:', JSON.stringify(query, null, 2));
console.log('Total destinations found:', total);
```

## Future Enhancements

### 1. Additional Content Types

- Extend filtering to packages, activities, blogs, etc.
- Create reusable hooks for root user filtering
- Implement consistent API patterns across all endpoints

### 2. Advanced Features

- Root user-specific branding and themes
- Custom domains per root user
- Analytics per root user
- Admin panel for root user management

### 3. Performance Improvements

- Server-side caching for root user data
- CDN integration for static assets
- Database query optimization
- Real-time updates with WebSocket

## API Reference

### GET /api/destinations/public

**Parameters:**

- `rootUserId` (optional): Root user ID to filter by
- `limit` (optional): Number of results (default: 10)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search term

**Response:**

```json
{
  "destinations": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "rootUserId": "68786e4cd6e23d3a8ec0fe34"
}
```

**Error Response:**

```json
{
  "error": "Invalid root user ID"
}
```

## Conclusion

This multi-tenant root user filtering feature provides a flexible and secure way to display
different tourism companies' data on the same platform. The implementation is scalable, performant,
and user-friendly, making it easy to add new root users and manage their content independently.
