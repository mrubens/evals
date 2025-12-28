# Support Task Viewing Evaluation

This evaluation tests the implementation of a task viewing system with granular permission controls for support teams.

## Overview

The Task Viewer system allows organizations to:
- Control which tasks support staff can view based on permissions
- Define granular permission rules with conditions
- Filter and search tasks based on user permissions
- Track task statistics visible to each user

## Features

### Permission-Based Access Control

The system supports multiple permission types:

1. **View Assigned Tasks** - Users can only view tasks assigned to them
2. **View Team Tasks** - Users can view all tasks in their team
3. **View All Tasks** - Admin-level access to all tasks
4. **View Tasks by Tags** - Access tasks with specific tags
5. **Custom Conditions** - Define complex permission rules

### User Roles

- **Admin** - Full access to all tasks and operations
- **Support** - Limited access based on assigned permissions
- **User** - Restricted access, typically only assigned tasks

### Operations

- Get viewable tasks for a user
- Get specific task by ID (if user has permission)
- Filter tasks by status, priority, team, or assignee
- Search tasks by title or description
- Get task statistics (counts by status and priority)

## Usage

### Basic Example

```typescript
import { TaskViewer, PermissionPresets } from './task-viewer';

// Create a task viewer
const viewer = new TaskViewer(tasks);

// Define a support user with team-based permissions
const supportUser = {
  id: 'support-1',
  name: 'Support Agent',
  role: 'support',
  permissions: [
    PermissionPresets.viewTeamTasks('team-support'),
    PermissionPresets.viewAssignedTasks(),
  ],
};

// Get all tasks the user can view
const viewableTasks = viewer.getViewableTasks(supportUser);

// Search for specific tasks
const searchResults = viewer.searchTasks(supportUser, 'bug');

// Get task statistics
const stats = viewer.getTaskStats(supportUser);
console.log(`User can view ${stats.total} tasks`);
```

### Custom Permissions

```typescript
// Define a custom permission
const customPermission = {
  resource: 'task',
  action: 'view',
  conditions: [
    {
      field: 'priority',
      operator: 'in',
      value: ['high', 'critical'],
    },
    {
      field: 'status',
      operator: 'equals',
      value: 'open',
    },
  ],
};

// User can only view open high/critical priority tasks
const user = {
  id: 'user-1',
  name: 'Priority User',
  role: 'support',
  permissions: [customPermission],
};
```

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

### Test Coverage

The test suite includes comprehensive coverage of:

- ✅ Permission checking for different user roles
- ✅ Viewing tasks based on permissions
- ✅ Filtering tasks by various criteria
- ✅ Searching tasks with permission enforcement
- ✅ Task statistics generation
- ✅ Custom permission conditions
- ✅ Edge cases and error scenarios
- ✅ Multiple permission combinations

Target coverage: 80% minimum across all metrics (branches, functions, lines, statements)

## Implementation Details

### Permission Evaluation

Permissions are evaluated using a condition-based system:

1. Admin users bypass all permission checks
2. For other users, iterate through their permissions
3. Check if permission matches the resource and action
4. Evaluate all conditions (if any) - all must be satisfied
5. If any permission grants access, user has permission

### Condition Operators

- **equals** - Field value must exactly match
- **contains** - For arrays: value is in array; for strings: substring match
- **in** - Field value must be in the provided array

### Special Fields

- **$userId** - Dynamically resolves to the current user's ID (useful for "assigned to me" conditions)

## Real-World Use Cases

### Customer Support

```typescript
// Support agents can view:
// 1. All tickets in their assigned team
// 2. Any ticket assigned to them personally
const supportAgent = {
  id: 'agent-1',
  role: 'support',
  permissions: [
    PermissionPresets.viewTeamTasks('team-customer-support'),
    PermissionPresets.viewAssignedTasks(),
  ],
};
```

### Security Team

```typescript
// Security team members can view all security-related tasks
const securityAnalyst = {
  id: 'sec-1',
  role: 'support',
  permissions: [
    PermissionPresets.viewTasksByTags(['security', 'vulnerability']),
  ],
};
```

### Manager

```typescript
// Managers can view all tasks in multiple teams
const manager = {
  id: 'mgr-1',
  role: 'support',
  permissions: [
    PermissionPresets.viewTeamTasks('team-support'),
    PermissionPresets.viewTeamTasks('team-engineering'),
    PermissionPresets.viewTeamTasks('team-qa'),
  ],
};
```

## Architecture

The system follows these design principles:

- **Least Privilege** - Users only see what they need
- **Explicit Permissions** - No implicit access grants
- **Composable Rules** - Combine multiple permissions
- **Auditable** - Clear permission evaluation path
- **Testable** - Comprehensive test coverage

## Future Enhancements

Potential additions to the system:

- [ ] Time-based permissions (valid only during certain hours/dates)
- [ ] Hierarchical permissions (manager sees team members' accessible tasks)
- [ ] Permission delegation (temporary access grants)
- [ ] Audit logging (track who viewed what)
- [ ] Permission caching (optimize repeated checks)
- [ ] Bulk permission operations
- [ ] Permission templates (role-based presets)

## License

MIT - See repository LICENSE file for details.
