# Package Management System

This document describes the package management functionality implemented in the Tours & Trails
application.

## Features

### 1. Package Listing

- View all packages in a responsive data table
- Search functionality to filter packages
- Pagination support
- Display package details including name, type, duration, location, rating, and reviews

### 2. Add New Package

- Comprehensive form to create new tour packages
- Fields include:
  - Basic Information (ID, name, title, type, location, duration, etc.)
  - Descriptions (summary, mini description, full description)
  - Highlights, Inclusions & Exclusions (dynamic arrays)
  - Itinerary (multi-day planning with highlights and activities)
  - Images (main image, secondary image, additional images)
- Form validation and error handling
- Success feedback and automatic redirect

### 3. Edit Package

- **NEW**: Edit existing package details without images
- Pre-filled form with current package data
- Same comprehensive form structure as Add Package
- Real-time validation and error handling
- Update functionality with success feedback

### 4. Delete Package

- **NEW**: Delete packages with confirmation dialog
- Permanent deletion with database cleanup
- Success feedback and UI updates
- Error handling for failed deletions

## API Endpoints

### GET /api/packages

- Fetch all packages with pagination and filtering
- Query parameters: `page`, `limit`, `type`, `search`
- Returns packages array and pagination info

### POST /api/packages

- Create a new package
- Accepts package data in JSON format
- Returns created package with success message

### GET /api/packages/[id]

- Fetch a single package by ID
- Returns package object or 404 if not found

### PUT /api/packages/[id]

- **NEW**: Update an existing package
- Accepts updated package data in JSON format
- Returns updated package with success message

### DELETE /api/packages/[id]

- **NEW**: Delete a package by ID
- Returns success message and deleted package data

## Database Schema

The Package model includes:

- Basic package information (id, name, title, type, etc.)
- Location and duration details
- Rating and review information
- Descriptions (summary, mini, full)
- Arrays for highlights, inclusions, exclusions, and images
- Itinerary with day-by-day planning
- Timestamps for creation and updates

## Usage

### Accessing Package Management

1. Navigate to `/admin/packages` to view all packages
2. Use the "Add Package" button to create new packages
3. Click the edit (✏️) icon to modify existing packages
4. Click the delete (🗑️) icon to remove packages

### Edit Package Process

1. Click the edit icon on any package row
2. Form will be pre-filled with current package data
3. Modify any fields as needed (images are not editable in this version)
4. Click "Update Package" to save changes
5. Success message will appear and redirect to package list

### Delete Package Process

1. Click the delete icon on any package row
2. Confirm deletion in the dialog
3. Package will be permanently removed from database
4. Success message will appear and table will update

## File Structure

```
app/
├── admin/
│   ├── packages/
│   │   ├── page.tsx                    # Package listing page
│   │   ├── add/
│   │   │   └── page.tsx               # Add package form
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx           # Edit package form
│   └── page.tsx                       # Admin dashboard
├── api/
│   └── packages/
│       ├── route.ts                   # GET/POST all packages
│       └── [id]/
│           └── route.ts               # GET/PUT/DELETE single package
models/
└── Package.ts                         # Package database model
components/
├── admin/
│   └── DataTable.tsx                  # Reusable data table component
└── layout/
    └── AdminLayout.tsx                # Admin layout wrapper
```

## Testing

### Seed Database

Run the seed script to populate the database with test packages:

```bash
node scripts/seed-packages.js
```

This will create 2 test packages:

- Test Pilgrimage Tour
- Test Honeymoon Package

### Test Scenarios

1. **View Packages**: Navigate to `/admin/packages` and verify packages are displayed
2. **Edit Package**: Click edit icon, modify fields, and verify updates are saved
3. **Delete Package**: Click delete icon, confirm, and verify package is removed
4. **Add Package**: Use the add form to create a new package
5. **Search**: Use the search functionality to filter packages

## Notes

- The edit functionality focuses on package details without image management
- Images are preserved during edits (not editable in this version)
- All form validations are maintained during edits
- Delete operations are permanent and cannot be undone
- The system includes comprehensive error handling and user feedback
