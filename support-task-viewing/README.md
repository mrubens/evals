# ROO-18: Support Task Viewing with Permission-Based Access Control

This directory contains documentation and implementation details for the support task viewing feature.

## Overview

This feature enables users to grant support staff permission-based access to their Roo Code Cloud tasks. Support can view task details to help troubleshoot issues while maintaining user privacy and control.

## Implementation Summary

The implementation adds permission-based task viewing capabilities to the Roo Code Cloud platform with the following components:

### 1. Type Definitions (`@roo-code/types`)

Added to `packages/types/src/cloud.ts`:

```typescript
// Support access levels
export const supportAccessLevelSchema = z.enum(["none", "metadata", "full"])
export type SupportAccessLevel = z.infer<typeof supportAccessLevelSchema>

// Permission details
export const supportAccessPermissionSchema = z.object({
  enabled: z.boolean(),
  level: supportAccessLevelSchema,
  expiresAt: z.number().optional(), // Unix timestamp
})
export type SupportAccessPermission = z.infer<typeof supportAccessPermissionSchema>

// Complete permission record
export const taskAccessPermissionsSchema = z.object({
  taskId: z.string(),
  userId: z.string(),
  grantedBy: z.string(),
  grantedAt: z.number(),
  supportAccess: supportAccessPermissionSchema,
})
export type TaskAccessPermissions = z.infer<typeof taskAccessPermissionsSchema>
```

### 2. API Methods (`@roo-code/cloud`)

Added to `packages/cloud/src/CloudAPI.ts`:

#### `grantSupportAccess(taskId, level, expiresAt?): Promise<TaskAccessPermissions>`
Grants support access to a specific task with configurable access level and optional expiration.

#### `revokeSupportAccess(taskId): Promise<{ success: boolean }>`
Revokes support access from a task.

#### `getSupportAccessibleTasks(): Promise<TaskAccessPermissions[]>`
Returns all tasks the current support user has permission to access.

#### `checkSupportAccess(taskId): Promise<SupportAccessPermission | null>`
Checks if the current user has support access to a specific task.

#### `getSupportTaskDetails(taskId): Promise<any>`
Retrieves task details with permission validation (requires support access).

### 3. Permission Levels

- **`metadata`**: Support can view basic task information (description, images, status, timestamps)
- **`full`**: Support can view complete task details including messages and history

## Use Cases

### User Grants Access

```typescript
// User experiencing issues grants support metadata access for 24 hours
const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
await cloudAPI.grantSupportAccess('task-123', 'metadata', expiresAt);
```

### Support Views Tasks

```typescript
// Support staff lists all accessible tasks
const tasks = await cloudAPI.getSupportAccessibleTasks();

// Check access before viewing
const access = await cloudAPI.checkSupportAccess('task-123');
if (access?.enabled) {
  const details = await cloudAPI.getSupportTaskDetails('task-123');
}
```

### User Revokes Access

```typescript
// After issue is resolved, user revokes access
await cloudAPI.revokeSupportAccess('task-123');
```

## Security Features

1. **Time-based Expiration**: Permissions automatically expire after specified duration
2. **Minimal Access Principle**: Default to `metadata` level unless full access needed
3. **Audit Trail**: All permissions tracked with timestamps and grantor information
4. **User Control**: Users can revoke access at any time
5. **Authentication Required**: All endpoints require valid session tokens

## Backend Requirements

The backend API must implement these endpoints:

- `POST /api/extension/support/grant-access`
  - Body: `{ taskId, level, expiresAt? }`
  - Returns: `TaskAccessPermissions`

- `POST /api/extension/support/revoke-access`
  - Body: `{ taskId }`
  - Returns: `{ success: boolean }`

- `GET /api/extension/support/accessible-tasks`
  - Returns: `TaskAccessPermissions[]`

- `GET /api/extension/support/check-access/:taskId`
  - Returns: `SupportAccessPermission | null`

- `GET /api/extension/support/task/:taskId`
  - Returns: Task details based on access level

## Testing

Comprehensive test suite included in `packages/cloud/src/__tests__/CloudAPI.supportAccess.spec.ts` covering:

- ✅ Granting access with and without expiration
- ✅ Revoking access
- ✅ Fetching accessible tasks list
- ✅ Checking specific task permissions
- ✅ Retrieving task details with permissions
- ✅ Error handling (401, 404, etc.)

## Implementation Files

The following files contain the implementation:

1. **`Roo-Code/packages/types/src/cloud.ts`**
   - Type definitions for support access permissions

2. **`Roo-Code/packages/cloud/src/CloudAPI.ts`**
   - API methods for support access management

3. **`Roo-Code/packages/cloud/src/__tests__/CloudAPI.supportAccess.spec.ts`**
   - Comprehensive test suite

4. **`Roo-Code/packages/cloud/docs/support-access.md`**
   - Detailed documentation with examples

## Benefits

- **Improved Support Experience**: Support can view actual task data to diagnose issues
- **User Privacy**: Users control what support can access and for how long
- **Security**: Time-limited, revocable, and audited access
- **Flexibility**: Two access levels for different support needs
- **Scalability**: Organization-level support roles can be added later

## Future Enhancements

- Organization-level support role with global permissions
- Automated expiration cleanup
- Access notification system
- Detailed audit logs
- More granular permission controls
- Multi-tier support levels

## Related Issues

- [ROO-18](https://linear.app/roocode/issue/ROO-18/create-a-way-for-support-to-view-tasks-given-permission) - Original Linear issue
