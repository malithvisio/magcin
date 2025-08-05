# Destinations Published/Unpublished Feature

## Overview

The destinations admin page now includes a functional published/unpublished toggle that allows
administrators to control the visibility of destinations.

## Features

### Published Status Toggle

- **Checkbox Control**: Each destination has a checkbox that can be toggled to publish/unpublish
- **Visual Feedback**:
  - Published destinations show "Published" in green with a green dot indicator
  - Unpublished destinations show "Draft" in gray
  - Loading state shows "Updating..." during API calls
- **Database Persistence**: Published status is saved to the database and persists across sessions

### Visual Indicators

- **Published Destinations**:
  - Green text and dot indicator
  - Bold font weight
- **Draft Destinations**:
  - Gray text
  - "Draft - Not published" subtitle
  - Regular font weight

### API Integration

- **PUT Endpoint**: `/api/destinations/[id]` handles published status updates
- **Database Field**: `published` boolean field in Destination model (defaults to `false`)
- **Error Handling**: Proper error messages and rollback on failure

## Technical Implementation

### Frontend Changes

1. **State Management**: Added `updatingPublished` state to track loading
2. **Toggle Function**: `handlePublishedToggle` function handles API calls
3. **UI Updates**: Dynamic styling based on published status
4. **Loading States**: Disabled controls during API calls

### Backend Changes

1. **Model**: Destination schema includes `published` field (default: `false`)
2. **API**: PUT endpoint accepts `published` field updates
3. **Validation**: Proper error handling and user context validation

## Usage

1. Navigate to `/admin/destinations`
2. Find the destination you want to publish/unpublish
3. Click the checkbox next to "Published" status
4. The status will update immediately with visual feedback
5. Success/error messages will appear via toast notifications

## Database Schema

```javascript
// Destination model includes:
published: {
  type: Boolean,
  default: false,
}
```

## API Endpoints

- **GET** `/api/destinations` - Returns destinations with published status
- **PUT** `/api/destinations/[id]` - Updates destination including published status
- **POST** `/api/destinations` - Creates new destinations (defaults to unpublished)

## Security

- All operations require authentication
- Multi-tenant isolation ensures users can only modify their own destinations
- Root user context is used for proper data isolation
