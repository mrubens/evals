/**
 * Task Viewer with Permission Controls
 * 
 * This module provides functionality for support teams to view tasks
 * based on granular permission controls.
 */

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'support' | 'user';
  permissions: Permission[];
}

export interface Permission {
  resource: 'task' | 'all_tasks' | 'team_tasks' | 'assigned_tasks';
  action: 'view' | 'edit' | 'delete';
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'in';
  value: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  assigneeId: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export class TaskViewer {
  private tasks: Task[];

  constructor(tasks: Task[] = []) {
    this.tasks = tasks;
  }

  /**
   * Check if a user has permission to perform an action on a resource
   */
  hasPermission(
    user: User,
    resource: string,
    action: string,
    task?: Task
  ): boolean {
    // Admin users have all permissions
    if (user.role === 'admin') {
      return true;
    }

    // Check user's explicit permissions
    for (const permission of user.permissions) {
      if (this.matchesPermission(permission, resource, action, task, user)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match a permission against the resource, action, and conditions
   */
  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    task: Task | undefined,
    user: User
  ): boolean {
    // Check resource and action match
    if (permission.resource !== resource && permission.resource !== 'all_tasks') {
      return false;
    }

    if (permission.action !== action) {
      return false;
    }

    // If no conditions, permission applies
    if (!permission.conditions || permission.conditions.length === 0) {
      return true;
    }

    // If conditions exist but no task provided, cannot evaluate
    if (!task) {
      return false;
    }

    // Check all conditions must be satisfied
    return permission.conditions.every(condition => 
      this.evaluateCondition(condition, task, user)
    );
  }

  /**
   * Evaluate a single permission condition
   */
  private evaluateCondition(
    condition: PermissionCondition,
    task: Task,
    user: User
  ): boolean {
    const fieldValue = this.getFieldValue(task, condition.field, user);
    // Handle special $userId value in conditions
    const conditionValue = condition.value === '$userId' ? user.id : condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(conditionValue);
        }
        return String(fieldValue).includes(String(conditionValue));
      
      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(fieldValue);
        }
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Get field value from task, with support for special fields like $user
   */
  private getFieldValue(task: Task, field: string, user: User): any {
    if (field === '$userId') {
      return user.id;
    }

    if (field in task) {
      return task[field as keyof Task];
    }

    return undefined;
  }

  /**
   * Get all tasks that a user has permission to view
   */
  getViewableTasks(user: User): Task[] {
    return this.tasks.filter(task => 
      this.hasPermission(user, 'task', 'view', task)
    );
  }

  /**
   * Get a specific task if the user has permission to view it
   */
  getTask(user: User, taskId: string): Task | null {
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      return null;
    }

    if (this.hasPermission(user, 'task', 'view', task)) {
      return task;
    }

    return null;
  }

  /**
   * Add a task to the viewer
   */
  addTask(task: Task): void {
    this.tasks.push(task);
  }

  /**
   * Filter tasks by criteria
   */
  filterTasks(
    user: User,
    filters: Partial<Pick<Task, 'status' | 'priority' | 'teamId' | 'assigneeId'>>
  ): Task[] {
    const viewableTasks = this.getViewableTasks(user);

    return viewableTasks.filter(task => {
      for (const [key, value] of Object.entries(filters)) {
        if (task[key as keyof Task] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Search tasks by title or description
   */
  searchTasks(user: User, query: string): Task[] {
    const viewableTasks = this.getViewableTasks(user);
    const lowerQuery = query.toLowerCase();

    return viewableTasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get task statistics for a user
   */
  getTaskStats(user: User): {
    total: number;
    byStatus: Record<Task['status'], number>;
    byPriority: Record<Task['priority'], number>;
  } {
    const viewableTasks = this.getViewableTasks(user);

    const byStatus = {
      open: 0,
      in_progress: 0,
      completed: 0,
      closed: 0,
    };

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    viewableTasks.forEach(task => {
      byStatus[task.status]++;
      byPriority[task.priority]++;
    });

    return {
      total: viewableTasks.length,
      byStatus,
      byPriority,
    };
  }
}

/**
 * Helper function to create common permission sets
 */
export const PermissionPresets = {
  /**
   * View only tasks assigned to the user
   */
  viewAssignedTasks: (): Permission => ({
    resource: 'task',
    action: 'view',
    conditions: [
      {
        field: 'assigneeId',
        operator: 'equals',
        value: '$userId',
      },
    ],
  }),

  /**
   * View all tasks in a specific team
   */
  viewTeamTasks: (teamId: string): Permission => ({
    resource: 'task',
    action: 'view',
    conditions: [
      {
        field: 'teamId',
        operator: 'equals',
        value: teamId,
      },
    ],
  }),

  /**
   * View tasks with specific tags
   */
  viewTasksByTags: (tags: string[]): Permission => ({
    resource: 'task',
    action: 'view',
    conditions: [
      {
        field: 'tags',
        operator: 'contains',
        value: tags[0], // Check if task has at least one of the tags
      },
    ],
  }),

  /**
   * View all tasks (no restrictions)
   */
  viewAllTasks: (): Permission => ({
    resource: 'all_tasks',
    action: 'view',
  }),

  /**
   * Edit assigned tasks
   */
  editAssignedTasks: (): Permission => ({
    resource: 'task',
    action: 'edit',
    conditions: [
      {
        field: 'assigneeId',
        operator: 'equals',
        value: '$userId',
      },
    ],
  }),
};
