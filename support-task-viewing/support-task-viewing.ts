/**
 * Support Task Viewing Evaluation
 * 
 * This evaluation tests the permission system for support team members
 * to view tasks based on organization settings and user roles.
 */

export enum UserRole {
  ADMIN = 'admin',
  SUPPORT = 'support',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum TaskVisibility {
  ALL = 'all',
  LIST_ONLY = 'list-only',
  ADMINS_AND_CREATOR = 'admins-and-creator',
  CREATOR = 'creator',
  FULL_LOCKDOWN = 'full-lockdown',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  organizationId: string;
  permissions?: string[];
}

export interface Task {
  id: string;
  creatorId: string;
  organizationId: string;
  visibility: 'organization' | 'public';
  status: 'active' | 'completed' | 'failed';
  messages: TaskMessage[];
  metadata: TaskMetadata;
}

export interface TaskMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface TaskMetadata {
  createdAt: number;
  updatedAt: number;
  tokensUsed: number;
  cost: number;
}

export interface OrganizationSettings {
  organizationId: string;
  enableTaskSharing: boolean;
  allowPublicTaskSharing: boolean;
  allowMembersViewAllTasks: boolean;
  workspaceTaskVisibility: TaskVisibility;
}

export class SupportTaskViewingService {
  /**
   * Check if a user can view the task list
   */
  canViewTaskList(
    user: User,
    orgSettings: OrganizationSettings
  ): boolean {
    // User must be in the same organization
    if (user.organizationId !== orgSettings.organizationId) {
      return false;
    }

    // Check visibility settings
    switch (orgSettings.workspaceTaskVisibility) {
      case TaskVisibility.ALL:
        return true;
      
      case TaskVisibility.LIST_ONLY:
        return true;
      
      case TaskVisibility.ADMINS_AND_CREATOR:
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;
      
      case TaskVisibility.CREATOR:
        return false; // Only creators can see their own tasks
      
      case TaskVisibility.FULL_LOCKDOWN:
        return user.role === UserRole.ADMIN;
      
      default:
        return false;
    }
  }

  /**
   * Check if a user can view task details
   */
  canViewTaskDetails(
    user: User,
    task: Task,
    orgSettings: OrganizationSettings
  ): boolean {
    // User must be in the same organization for organization tasks
    if (task.visibility === 'organization' && user.organizationId !== task.organizationId) {
      return false;
    }

    // Public tasks can be viewed by anyone with the link
    if (task.visibility === 'public') {
      return true;
    }

    // Check if user is the creator - creators always see their own tasks
    if (user.id === task.creatorId) {
      return true;
    }

    // Admins in FULL_LOCKDOWN mode can always view tasks
    if (user.role === UserRole.ADMIN && orgSettings.workspaceTaskVisibility === TaskVisibility.FULL_LOCKDOWN) {
      return true;
    }

    // Task sharing must be enabled for non-creators
    if (!orgSettings.enableTaskSharing) {
      return false;
    }

    // Check visibility settings
    switch (orgSettings.workspaceTaskVisibility) {
      case TaskVisibility.ALL:
        return orgSettings.allowMembersViewAllTasks ||
               user.role === UserRole.ADMIN ||
               user.role === UserRole.SUPPORT;
      
      case TaskVisibility.LIST_ONLY:
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;
      
      case TaskVisibility.ADMINS_AND_CREATOR:
        return user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT;
      
      case TaskVisibility.CREATOR:
        return false;
      
      case TaskVisibility.FULL_LOCKDOWN:
        return user.role === UserRole.ADMIN;
      
      default:
        return false;
    }
  }

  /**
   * Check if a user can view task messages
   */
  canViewTaskMessages(
    user: User,
    task: Task,
    orgSettings: OrganizationSettings
  ): boolean {
    // First check if user can view task details
    if (!this.canViewTaskDetails(user, task, orgSettings)) {
      return false;
    }

    // Additional permission check for sensitive data
    if (user.role === UserRole.VIEWER) {
      return false;
    }

    return true;
  }

  /**
   * Check if a user can share a task
   */
  canShareTask(
    user: User,
    task: Task,
    orgSettings: OrganizationSettings,
    visibility: 'organization' | 'public'
  ): boolean {
    // User must be in the same organization
    if (user.organizationId !== task.organizationId) {
      return false;
    }

    // Task sharing must be enabled
    if (!orgSettings.enableTaskSharing) {
      return false;
    }

    // Only creator or admins can share
    if (user.id !== task.creatorId && user.role !== UserRole.ADMIN) {
      return false;
    }

    // Check if public sharing is allowed
    if (visibility === 'public' && !orgSettings.allowPublicTaskSharing) {
      return false;
    }

    return true;
  }

  /**
   * Get filtered task data based on user permissions
   */
  getFilteredTaskData(
    user: User,
    task: Task,
    orgSettings: OrganizationSettings
  ): Partial<Task> | null {
    if (!this.canViewTaskDetails(user, task, orgSettings)) {
      return null;
    }

    const filteredTask: Partial<Task> = {
      id: task.id,
      status: task.status,
      metadata: task.metadata,
    };

    // Only include messages if user has permission
    if (this.canViewTaskMessages(user, task, orgSettings)) {
      filteredTask.messages = task.messages;
    }

    // Include full data for creators and admins
    if (user.id === task.creatorId || user.role === UserRole.ADMIN) {
      return task;
    }

    return filteredTask;
  }
}
