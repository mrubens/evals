import {
  TaskViewer,
  User,
  Task,
  Permission,
  PermissionPresets,
} from './task-viewer';

describe('TaskViewer', () => {
  let viewer: TaskViewer;
  let tasks: Task[];
  let adminUser: User;
  let supportUser: User;
  let regularUser: User;

  beforeEach(() => {
    // Create sample tasks
    tasks = [
      {
        id: '1',
        title: 'Fix login bug',
        description: 'Users cannot login with special characters',
        status: 'open',
        assigneeId: 'user-123',
        teamId: 'team-support',
        createdBy: 'user-456',
        createdAt: new Date('2024-01-01'),
        priority: 'high',
        tags: ['bug', 'security'],
      },
      {
        id: '2',
        title: 'Update documentation',
        description: 'Add API documentation for new endpoints',
        status: 'in_progress',
        assigneeId: 'user-456',
        teamId: 'team-docs',
        createdBy: 'user-123',
        createdAt: new Date('2024-01-02'),
        priority: 'medium',
        tags: ['documentation'],
      },
      {
        id: '3',
        title: 'Implement new feature',
        description: 'Add dark mode support',
        status: 'completed',
        assigneeId: 'user-123',
        teamId: 'team-support',
        createdBy: 'user-789',
        createdAt: new Date('2024-01-03'),
        priority: 'low',
        tags: ['feature', 'ui'],
      },
      {
        id: '4',
        title: 'Security audit',
        description: 'Conduct security review of authentication',
        status: 'open',
        assigneeId: 'user-789',
        teamId: 'team-security',
        createdBy: 'user-123',
        createdAt: new Date('2024-01-04'),
        priority: 'critical',
        tags: ['security', 'audit'],
      },
    ];

    viewer = new TaskViewer(tasks);

    // Create test users
    adminUser = {
      id: 'admin-1',
      name: 'Admin User',
      role: 'admin',
      permissions: [],
    };

    supportUser = {
      id: 'user-123',
      name: 'Support User',
      role: 'support',
      permissions: [
        PermissionPresets.viewTeamTasks('team-support'),
        PermissionPresets.viewAssignedTasks(),
      ],
    };

    regularUser = {
      id: 'user-456',
      name: 'Regular User',
      role: 'user',
      permissions: [PermissionPresets.viewAssignedTasks()],
    };
  });

  describe('Permission Checking', () => {
    test('admin user has all permissions', () => {
      expect(viewer.hasPermission(adminUser, 'task', 'view', tasks[0])).toBe(true);
      expect(viewer.hasPermission(adminUser, 'task', 'edit', tasks[0])).toBe(true);
      expect(viewer.hasPermission(adminUser, 'task', 'delete', tasks[0])).toBe(true);
    });

    test('user with viewAssignedTasks can view their own tasks', () => {
      // regularUser (user-456) is assigned to task 2
      expect(viewer.hasPermission(regularUser, 'task', 'view', tasks[1])).toBe(true);
    });

    test('user with viewAssignedTasks cannot view tasks assigned to others', () => {
      // regularUser (user-456) is NOT assigned to task 1
      expect(viewer.hasPermission(regularUser, 'task', 'view', tasks[0])).toBe(false);
    });

    test('user with viewTeamTasks can view tasks in their team', () => {
      // supportUser can view team-support tasks
      expect(viewer.hasPermission(supportUser, 'task', 'view', tasks[0])).toBe(true);
      expect(viewer.hasPermission(supportUser, 'task', 'view', tasks[2])).toBe(true);
    });

    test('user with viewTeamTasks cannot view tasks in other teams', () => {
      // supportUser cannot view team-docs tasks
      expect(viewer.hasPermission(supportUser, 'task', 'view', tasks[1])).toBe(false);
    });

    test('user with multiple permissions can view tasks matching any permission', () => {
      // supportUser can view task 1 (team-support) and task 0 (assigned to them)
      expect(viewer.hasPermission(supportUser, 'task', 'view', tasks[0])).toBe(true);
      expect(viewer.hasPermission(supportUser, 'task', 'view', tasks[2])).toBe(true);
    });

    test('user with no matching permissions cannot view task', () => {
      const restrictedUser: User = {
        id: 'user-999',
        name: 'Restricted User',
        role: 'user',
        permissions: [],
      };

      expect(viewer.hasPermission(restrictedUser, 'task', 'view', tasks[0])).toBe(false);
    });
  });

  describe('Getting Viewable Tasks', () => {
    test('admin can view all tasks', () => {
      const viewableTasks = viewer.getViewableTasks(adminUser);
      expect(viewableTasks).toHaveLength(4);
    });

    test('support user can view tasks in their team and assigned to them', () => {
      const viewableTasks = viewer.getViewableTasks(supportUser);
      expect(viewableTasks).toHaveLength(2);
      expect(viewableTasks.map(t => t.id)).toContain('1');
      expect(viewableTasks.map(t => t.id)).toContain('3');
    });

    test('regular user can only view their assigned tasks', () => {
      const viewableTasks = viewer.getViewableTasks(regularUser);
      expect(viewableTasks).toHaveLength(1);
      expect(viewableTasks[0].id).toBe('2');
    });

    test('user with no permissions cannot view any tasks', () => {
      const noPermUser: User = {
        id: 'user-999',
        name: 'No Permission User',
        role: 'user',
        permissions: [],
      };

      const viewableTasks = viewer.getViewableTasks(noPermUser);
      expect(viewableTasks).toHaveLength(0);
    });
  });

  describe('Getting Specific Task', () => {
    test('admin can get any task by id', () => {
      const task = viewer.getTask(adminUser, '1');
      expect(task).not.toBeNull();
      expect(task?.id).toBe('1');
    });

    test('user can get task they have permission to view', () => {
      const task = viewer.getTask(regularUser, '2');
      expect(task).not.toBeNull();
      expect(task?.id).toBe('2');
    });

    test('user cannot get task they do not have permission to view', () => {
      const task = viewer.getTask(regularUser, '1');
      expect(task).toBeNull();
    });

    test('returns null for non-existent task', () => {
      const task = viewer.getTask(adminUser, 'non-existent');
      expect(task).toBeNull();
    });
  });

  describe('Filtering Tasks', () => {
    test('filter tasks by status', () => {
      const filteredTasks = viewer.filterTasks(adminUser, { status: 'open' });
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks.every(t => t.status === 'open')).toBe(true);
    });

    test('filter tasks by priority', () => {
      const filteredTasks = viewer.filterTasks(adminUser, { priority: 'high' });
      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('1');
    });

    test('filter tasks by team', () => {
      const filteredTasks = viewer.filterTasks(adminUser, { teamId: 'team-support' });
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks.every(t => t.teamId === 'team-support')).toBe(true);
    });

    test('filter tasks by assignee', () => {
      const filteredTasks = viewer.filterTasks(adminUser, { assigneeId: 'user-123' });
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks.every(t => t.assigneeId === 'user-123')).toBe(true);
    });

    test('filter with multiple criteria', () => {
      const filteredTasks = viewer.filterTasks(adminUser, {
        status: 'open',
        teamId: 'team-support',
      });
      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('1');
    });

    test('filter respects user permissions', () => {
      // regularUser can only see task 2, so filtering should only work on that task
      const filteredTasks = viewer.filterTasks(regularUser, { status: 'in_progress' });
      expect(filteredTasks).toHaveLength(1);
      expect(filteredTasks[0].id).toBe('2');

      const noResults = viewer.filterTasks(regularUser, { status: 'open' });
      expect(noResults).toHaveLength(0);
    });
  });

  describe('Searching Tasks', () => {
    test('search tasks by title', () => {
      const results = viewer.searchTasks(adminUser, 'login');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    test('search tasks by description', () => {
      const results = viewer.searchTasks(adminUser, 'dark mode');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    test('search is case-insensitive', () => {
      const results = viewer.searchTasks(adminUser, 'DOCUMENTATION');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    test('search returns multiple results', () => {
      const results = viewer.searchTasks(adminUser, 'security');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    test('search respects user permissions', () => {
      // regularUser can only see task 2
      const results = viewer.searchTasks(regularUser, 'login');
      expect(results).toHaveLength(0);

      const visibleResults = viewer.searchTasks(regularUser, 'documentation');
      expect(visibleResults).toHaveLength(1);
    });

    test('search with no matches returns empty array', () => {
      const results = viewer.searchTasks(adminUser, 'nonexistent search term');
      expect(results).toHaveLength(0);
    });
  });

  describe('Task Statistics', () => {
    test('get task statistics for admin', () => {
      const stats = viewer.getTaskStats(adminUser);
      expect(stats.total).toBe(4);
      expect(stats.byStatus.open).toBe(2);
      expect(stats.byStatus.in_progress).toBe(1);
      expect(stats.byStatus.completed).toBe(1);
      expect(stats.byStatus.closed).toBe(0);
      expect(stats.byPriority.critical).toBe(1);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);
    });

    test('get task statistics respects user permissions', () => {
      const stats = viewer.getTaskStats(regularUser);
      expect(stats.total).toBe(1);
      expect(stats.byStatus.in_progress).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
    });

    test('get task statistics for support user', () => {
      const stats = viewer.getTaskStats(supportUser);
      expect(stats.total).toBe(2);
      expect(stats.byStatus.open).toBe(1);
      expect(stats.byStatus.completed).toBe(1);
    });
  });

  describe('Permission Presets', () => {
    test('viewAllTasks permission allows viewing all tasks', () => {
      const userWithAllAccess: User = {
        id: 'user-all',
        name: 'All Access User',
        role: 'support',
        permissions: [PermissionPresets.viewAllTasks()],
      };

      const viewableTasks = viewer.getViewableTasks(userWithAllAccess);
      expect(viewableTasks).toHaveLength(4);
    });

    test('viewTasksByTags permission filters by tags', () => {
      const securityUser: User = {
        id: 'sec-user',
        name: 'Security User',
        role: 'support',
        permissions: [PermissionPresets.viewTasksByTags(['security'])],
      };

      const viewableTasks = viewer.getViewableTasks(securityUser);
      expect(viewableTasks.length).toBeGreaterThan(0);
      expect(viewableTasks.every(t => t.tags.includes('security'))).toBe(true);
    });

    test('editAssignedTasks permission allows editing own tasks', () => {
      const userWithEdit: User = {
        id: 'user-123',
        name: 'Edit User',
        role: 'user',
        permissions: [PermissionPresets.editAssignedTasks()],
      };

      // Can edit their own task
      expect(viewer.hasPermission(userWithEdit, 'task', 'edit', tasks[0])).toBe(true);
      
      // Cannot edit someone else's task
      expect(viewer.hasPermission(userWithEdit, 'task', 'edit', tasks[1])).toBe(false);
    });
  });

  describe('Condition Operators', () => {
    test('equals operator works correctly', () => {
      const user: User = {
        id: 'test-user',
        name: 'Test User',
        role: 'user',
        permissions: [
          {
            resource: 'task',
            action: 'view',
            conditions: [
              {
                field: 'priority',
                operator: 'equals',
                value: 'high',
              },
            ],
          },
        ],
      };

      expect(viewer.hasPermission(user, 'task', 'view', tasks[0])).toBe(true); // high priority
      expect(viewer.hasPermission(user, 'task', 'view', tasks[1])).toBe(false); // medium priority
    });

    test('contains operator works with arrays', () => {
      const user: User = {
        id: 'test-user',
        name: 'Test User',
        role: 'user',
        permissions: [
          {
            resource: 'task',
            action: 'view',
            conditions: [
              {
                field: 'tags',
                operator: 'contains',
                value: 'security',
              },
            ],
          },
        ],
      };

      expect(viewer.hasPermission(user, 'task', 'view', tasks[0])).toBe(true); // has 'security' tag
      expect(viewer.hasPermission(user, 'task', 'view', tasks[1])).toBe(false); // no 'security' tag
    });

    test('in operator works correctly', () => {
      const user: User = {
        id: 'test-user',
        name: 'Test User',
        role: 'user',
        permissions: [
          {
            resource: 'task',
            action: 'view',
            conditions: [
              {
                field: 'status',
                operator: 'in',
                value: ['open', 'in_progress'],
              },
            ],
          },
        ],
      };

      expect(viewer.hasPermission(user, 'task', 'view', tasks[0])).toBe(true); // status: open
      expect(viewer.hasPermission(user, 'task', 'view', tasks[1])).toBe(true); // status: in_progress
      expect(viewer.hasPermission(user, 'task', 'view', tasks[2])).toBe(false); // status: completed
    });
  });

  describe('Adding Tasks', () => {
    test('can add new tasks to viewer', () => {
      const initialCount = viewer.getViewableTasks(adminUser).length;

      const newTask: Task = {
        id: '5',
        title: 'New task',
        description: 'A new task',
        status: 'open',
        assigneeId: 'user-123',
        teamId: 'team-support',
        createdBy: 'admin-1',
        createdAt: new Date(),
        priority: 'medium',
        tags: ['new'],
      };

      viewer.addTask(newTask);

      const newCount = viewer.getViewableTasks(adminUser).length;
      expect(newCount).toBe(initialCount + 1);
    });

    test('newly added tasks respect permissions', () => {
      const newTask: Task = {
        id: '5',
        title: 'New private task',
        description: 'A new private task',
        status: 'open',
        assigneeId: 'user-789',
        teamId: 'team-other',
        createdBy: 'admin-1',
        createdAt: new Date(),
        priority: 'medium',
        tags: ['private'],
      };

      viewer.addTask(newTask);

      // regularUser should not see this task
      const viewableTasks = viewer.getViewableTasks(regularUser);
      expect(viewableTasks.find(t => t.id === '5')).toBeUndefined();

      // adminUser should see it
      const adminTasks = viewer.getViewableTasks(adminUser);
      expect(adminTasks.find(t => t.id === '5')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty task list', () => {
      const emptyViewer = new TaskViewer([]);
      const viewableTasks = emptyViewer.getViewableTasks(adminUser);
      expect(viewableTasks).toHaveLength(0);
    });

    test('handles user with empty permissions array', () => {
      const noPermUser: User = {
        id: 'no-perm',
        name: 'No Permissions',
        role: 'user',
        permissions: [],
      };

      const viewableTasks = viewer.getViewableTasks(noPermUser);
      expect(viewableTasks).toHaveLength(0);
    });

    test('handles permission with no conditions', () => {
      const user: User = {
        id: 'test-user',
        name: 'Test User',
        role: 'user',
        permissions: [
          {
            resource: 'task',
            action: 'view',
            // no conditions specified
          },
        ],
      };

      // Should be able to view all tasks since there are no restricting conditions
      const viewableTasks = viewer.getViewableTasks(user);
      expect(viewableTasks).toHaveLength(4);
    });

    test('handles permission check without task object', () => {
      expect(viewer.hasPermission(supportUser, 'task', 'view')).toBe(false);
    });

    test('handles special $userId field in conditions', () => {
      const user: User = {
        id: 'user-123',
        name: 'Test User',
        role: 'user',
        permissions: [
          {
            resource: 'task',
            action: 'view',
            conditions: [
              {
                field: 'assigneeId',
                operator: 'equals',
                value: '$userId',
              },
            ],
          },
        ],
      };

      // Task assigned to user-123
      expect(viewer.hasPermission(user, 'task', 'view', tasks[0])).toBe(true);
      
      // Task assigned to someone else
      expect(viewer.hasPermission(user, 'task', 'view', tasks[1])).toBe(false);
    });
  });
});
