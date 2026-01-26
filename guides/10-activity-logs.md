# Activity Logs

## Overview

The Activity Log feature tracks important user actions within the application to provide visibility and auditability. Users can view their own activity history in the Dashboard under the "Activity" tab.

## Database Schema

Activities are stored in the `activity_log` table:

- `id`: Unique identifier for the log entry.
- `userId`: The ID of the user who performed the action.
- `action`: A string constant describing the action (e.g., `LOGIN`, `UPDATE_PROFILE`).
- `details`: Optional JSON string containing additional context (e.g., updated fields, IP address).
- `timestamp`: The time when the action occurred.

## Logged Actions

The following actions are currently logged:

- **Authentication**:
  - `LOGIN`: User logged in.
  - `REGISTER`: User created a new account.
  - `LOGOUT`: User logged out.
- **Profile Management**:
  - `UPDATE_PROFILE`: User updated their age or bio. Details include which fields were updated.
  - `CHANGE_PASSWORD`: User changed their password.
- **Session Management**:
  - `REVOKE_SESSION`: User revoked a specific session.
  - `REVOKE_OTHER_SESSIONS`: User revoked all other sessions.
  - `REVOKE_ALL_SESSIONS`: User signed out everywhere.
- **Account Management**:
  - `DELETE_ACCOUNT`: User deleted their account.

## Implementation Details

The logging logic is encapsulated in `src/lib/server/activity.ts`.

```typescript
import { logActivity } from '$lib/server/activity.js';

// Example usage
await logActivity(userId, 'LOGIN', { ip: clientIp });
```

This function writes to the database asynchronously. Failures in logging are caught and logged to the server logs but do not block the user action.
