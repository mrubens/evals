import {
  SupportTaskViewingService,
  UserRole,
  TaskVisibility,
  User,
  Task,
  OrganizationSettings,
} from './support-task-viewing';

describe('Support Task Viewing Evaluation', () => {
  let service: SupportTaskViewingService;

  beforeEach(() => {
    service = new SupportTaskViewingService();
  });

  // Helper functions to create test data
  const createUser = (overrides?: Partial<User>): User => ({
    id: 'user-1',
    name: 'Test User',
    role: UserRole.MEMBER,
    organizationId: 'org-1',
    ...overrides,
  });

  const createTask = (overrides?: Partial<Task>): Task => ({
    id: 'task-1',
    creatorId: 'user-1',
    organizationId: 'org-1',
    visibility: 'organization',
    status: 'active',
    messages: [
      {
        id: 'msg-1',
        type: 'user',
        content: 'Test message',
        timestamp: Date.now(),
      },
    ],
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tokensUsed: 1000,
      cost: 0.05,
    },
    ...overrides,
  });

  const createOrgSettings = (overrides?: Partial<OrganizationSettings>): OrganizationSettings => ({
    organizationId: 'org-1',
    enableTaskSharing: true,
    allowPublicTaskSharing: true,
    allowMembersViewAllTasks: true,
    workspaceTaskVisibility: TaskVisibility.ALL,
    ...overrides,
  });

  describe('canViewTaskList', () => {
    it('should allow users in same organization with ALL visibility', () => {
      const user = createUser({ role: UserRole.MEMBER });
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.ALL });

      expect(service.canViewTaskList(user, settings)).toBe(true);
    });

    it('should deny users from different organizations', () => {
      const user = createUser({ organizationId: 'org-2' });
      const settings = createOrgSettings({ organizationId: 'org-1' });

      expect(service.canViewTaskList(user, settings)).toBe(false);
    });

    it('should allow all users with LIST_ONLY visibility', () => {
      const member = createUser({ role: UserRole.MEMBER });
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.LIST_ONLY });

      expect(service.canViewTaskList(member, settings)).toBe(true);
    });

    it('should allow only admins and support with ADMINS_AND_CREATOR visibility', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.ADMINS_AND_CREATOR });
      
      const admin = createUser({ role: UserRole.ADMIN });
      expect(service.canViewTaskList(admin, settings)).toBe(true);

      const support = createUser({ role: UserRole.SUPPORT });
      expect(service.canViewTaskList(support, settings)).toBe(true);

      const member = createUser({ role: UserRole.MEMBER });
      expect(service.canViewTaskList(member, settings)).toBe(false);
    });

    it('should deny all users with CREATOR visibility', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.CREATOR });
      
      const admin = createUser({ role: UserRole.ADMIN });
      expect(service.canViewTaskList(admin, settings)).toBe(false);

      const member = createUser({ role: UserRole.MEMBER });
      expect(service.canViewTaskList(member, settings)).toBe(false);
    });

    it('should allow only admins with FULL_LOCKDOWN visibility', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.FULL_LOCKDOWN });
      
      const admin = createUser({ role: UserRole.ADMIN });
      expect(service.canViewTaskList(admin, settings)).toBe(true);

      const support = createUser({ role: UserRole.SUPPORT });
      expect(service.canViewTaskList(support, settings)).toBe(false);

      const member = createUser({ role: UserRole.MEMBER });
      expect(service.canViewTaskList(member, settings)).toBe(false);
    });
  });

  describe('canViewTaskDetails', () => {
    it('should allow creator to view their own tasks', () => {
      const user = createUser({ id: 'user-1' });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings();

      expect(service.canViewTaskDetails(user, task, settings)).toBe(true);
    });

    it('should allow anyone to view public tasks', () => {
      const user = createUser({ organizationId: 'org-2' });
      const task = createTask({ visibility: 'public' });
      const settings = createOrgSettings();

      expect(service.canViewTaskDetails(user, task, settings)).toBe(true);
    });

    it('should deny users from different organizations for organization tasks', () => {
      const user = createUser({ organizationId: 'org-2' });
      const task = createTask({ organizationId: 'org-1', visibility: 'organization' });
      const settings = createOrgSettings();

      expect(service.canViewTaskDetails(user, task, settings)).toBe(false);
    });

    it('should allow support users to view tasks when enabled', () => {
      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({
        enableTaskSharing: true,
        allowMembersViewAllTasks: true,
        workspaceTaskVisibility: TaskVisibility.ALL,
      });

      expect(service.canViewTaskDetails(support, task, settings)).toBe(true);
    });

    it('should deny support users when task sharing is disabled', () => {
      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({ enableTaskSharing: false });

      expect(service.canViewTaskDetails(support, task, settings)).toBe(false);
    });

    it('should allow admin to view all tasks', () => {
      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.ALL });

      expect(service.canViewTaskDetails(admin, task, settings)).toBe(true);
    });

    it('should deny members when allowMembersViewAllTasks is false', () => {
      const member = createUser({ id: 'user-2', role: UserRole.MEMBER });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({
        allowMembersViewAllTasks: false,
        workspaceTaskVisibility: TaskVisibility.ALL,
      });

      expect(service.canViewTaskDetails(member, task, settings)).toBe(false);
    });

    it('should enforce LIST_ONLY visibility for task details', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.LIST_ONLY });
      const task = createTask({ creatorId: 'user-1' });

      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      expect(service.canViewTaskDetails(admin, task, settings)).toBe(true);

      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      expect(service.canViewTaskDetails(support, task, settings)).toBe(true);

      const member = createUser({ id: 'user-2', role: UserRole.MEMBER });
      expect(service.canViewTaskDetails(member, task, settings)).toBe(false);
    });

    it('should enforce ADMINS_AND_CREATOR visibility', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.ADMINS_AND_CREATOR });
      const task = createTask({ creatorId: 'user-1' });

      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      expect(service.canViewTaskDetails(admin, task, settings)).toBe(true);

      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      expect(service.canViewTaskDetails(support, task, settings)).toBe(true);

      const member = createUser({ id: 'user-2', role: UserRole.MEMBER });
      expect(service.canViewTaskDetails(member, task, settings)).toBe(false);
    });

    it('should enforce CREATOR visibility - only creator can view', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.CREATOR });
      const task = createTask({ creatorId: 'user-1' });

      const creator = createUser({ id: 'user-1' });
      expect(service.canViewTaskDetails(creator, task, settings)).toBe(true);

      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      expect(service.canViewTaskDetails(admin, task, settings)).toBe(false);

      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      expect(service.canViewTaskDetails(support, task, settings)).toBe(false);
    });

    it('should enforce FULL_LOCKDOWN visibility - only admins', () => {
      const settings = createOrgSettings({ workspaceTaskVisibility: TaskVisibility.FULL_LOCKDOWN });
      const task = createTask({ creatorId: 'user-1' });

      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      expect(service.canViewTaskDetails(admin, task, settings)).toBe(true);

      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      expect(service.canViewTaskDetails(support, task, settings)).toBe(false);

      const creator = createUser({ id: 'user-1', role: UserRole.MEMBER });
      expect(service.canViewTaskDetails(creator, task, settings)).toBe(true);
    });
  });

  describe('canViewTaskMessages', () => {
    it('should allow viewing messages if user can view task details', () => {
      const user = createUser({ id: 'user-1', role: UserRole.ADMIN });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings();

      expect(service.canViewTaskMessages(user, task, settings)).toBe(true);
    });

    it('should deny viewing messages if user cannot view task details', () => {
      const user = createUser({ id: 'user-2', organizationId: 'org-2' });
      const task = createTask({ creatorId: 'user-1', visibility: 'organization' });
      const settings = createOrgSettings();

      expect(service.canViewTaskMessages(user, task, settings)).toBe(false);
    });

    it('should deny VIEWER role from viewing messages', () => {
      const viewer = createUser({ id: 'user-1', role: UserRole.VIEWER });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings();

      expect(service.canViewTaskMessages(viewer, task, settings)).toBe(false);
    });

    it('should allow support users to view messages when permitted', () => {
      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({
        enableTaskSharing: true,
        allowMembersViewAllTasks: true,
        workspaceTaskVisibility: TaskVisibility.ALL,
      });

      expect(service.canViewTaskMessages(support, task, settings)).toBe(true);
    });
  });

  describe('canShareTask', () => {
    it('should allow creator to share their own tasks', () => {
      const user = createUser({ id: 'user-1' });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({ enableTaskSharing: true });

      expect(service.canShareTask(user, task, settings, 'organization')).toBe(true);
    });

    it('should deny sharing when task sharing is disabled', () => {
      const user = createUser({ id: 'user-1' });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({ enableTaskSharing: false });

      expect(service.canShareTask(user, task, settings, 'organization')).toBe(false);
    });

    it('should deny users from different organizations', () => {
      const user = createUser({ organizationId: 'org-2' });
      const task = createTask({ organizationId: 'org-1' });
      const settings = createOrgSettings({ enableTaskSharing: true });

      expect(service.canShareTask(user, task, settings, 'organization')).toBe(false);
    });

    it('should allow admin to share any task', () => {
      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({ enableTaskSharing: true });

      expect(service.canShareTask(admin, task, settings, 'organization')).toBe(true);
    });

    it('should deny non-creator non-admin from sharing', () => {
      const member = createUser({ id: 'user-2', role: UserRole.MEMBER });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({ enableTaskSharing: true });

      expect(service.canShareTask(member, task, settings, 'organization')).toBe(false);
    });

    it('should allow public sharing when enabled', () => {
      const user = createUser({ id: 'user-1' });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({
        enableTaskSharing: true,
        allowPublicTaskSharing: true,
      });

      expect(service.canShareTask(user, task, settings, 'public')).toBe(true);
    });

    it('should deny public sharing when disabled', () => {
      const user = createUser({ id: 'user-1' });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({
        enableTaskSharing: true,
        allowPublicTaskSharing: false,
      });

      expect(service.canShareTask(user, task, settings, 'public')).toBe(false);
    });
  });

  describe('getFilteredTaskData', () => {
    it('should return null if user cannot view task', () => {
      const user = createUser({ organizationId: 'org-2' });
      const task = createTask({ organizationId: 'org-1', visibility: 'organization' });
      const settings = createOrgSettings();

      expect(service.getFilteredTaskData(user, task, settings)).toBeNull();
    });

    it('should return full task data for creator', () => {
      const user = createUser({ id: 'user-1' });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings();

      const result = service.getFilteredTaskData(user, task, settings);
      expect(result).toEqual(task);
    });

    it('should return full task data for admin', () => {
      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings();

      const result = service.getFilteredTaskData(admin, task, settings);
      expect(result).toEqual(task);
    });

    it('should return filtered task data for support users', () => {
      const support = createUser({ id: 'user-2', role: UserRole.SUPPORT });
      const task = createTask({ creatorId: 'user-1' });
      const settings = createOrgSettings({
        enableTaskSharing: true,
        allowMembersViewAllTasks: true,
        workspaceTaskVisibility: TaskVisibility.ALL,
      });

      const result = service.getFilteredTaskData(support, task, settings);
      expect(result).toBeDefined();
      expect(result?.id).toBe(task.id);
      expect(result?.status).toBe(task.status);
      expect(result?.messages).toEqual(task.messages);
    });

    it('should exclude messages if user cannot view them', () => {
      const viewer = createUser({ id: 'user-2', role: UserRole.VIEWER });
      const task = createTask({ creatorId: 'user-1', visibility: 'public' });
      const settings = createOrgSettings();

      const result = service.getFilteredTaskData(viewer, task, settings);
      expect(result).toBeDefined();
      expect(result?.messages).toBeUndefined();
      expect(result?.id).toBe(task.id);
      expect(result?.status).toBe(task.status);
    });
  });

  describe('Complex permission scenarios', () => {
    it('should handle multi-level permission checks correctly', () => {
      const settings = createOrgSettings({
        enableTaskSharing: true,
        allowPublicTaskSharing: false,
        allowMembersViewAllTasks: false,
        workspaceTaskVisibility: TaskVisibility.ADMINS_AND_CREATOR,
      });

      const task = createTask({ creatorId: 'user-1', visibility: 'organization' });

      // Creator should have full access
      const creator = createUser({ id: 'user-1', role: UserRole.MEMBER });
      expect(service.canViewTaskList(creator, settings)).toBe(false);
      expect(service.canViewTaskDetails(creator, task, settings)).toBe(true);
      expect(service.canViewTaskMessages(creator, task, settings)).toBe(true);
      expect(service.canShareTask(creator, task, settings, 'organization')).toBe(true);
      expect(service.canShareTask(creator, task, settings, 'public')).toBe(false);

      // Admin should have full access
      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      expect(service.canViewTaskList(admin, settings)).toBe(true);
      expect(service.canViewTaskDetails(admin, task, settings)).toBe(true);
      expect(service.canViewTaskMessages(admin, task, settings)).toBe(true);
      expect(service.canShareTask(admin, task, settings, 'organization')).toBe(true);

      // Support should have limited access
      const support = createUser({ id: 'user-3', role: UserRole.SUPPORT });
      expect(service.canViewTaskList(support, settings)).toBe(true);
      expect(service.canViewTaskDetails(support, task, settings)).toBe(true);
      expect(service.canViewTaskMessages(support, task, settings)).toBe(true);
      expect(service.canShareTask(support, task, settings, 'organization')).toBe(false);

      // Regular member should have no access
      const member = createUser({ id: 'user-4', role: UserRole.MEMBER });
      expect(service.canViewTaskList(member, settings)).toBe(false);
      expect(service.canViewTaskDetails(member, task, settings)).toBe(false);
      expect(service.canViewTaskMessages(member, task, settings)).toBe(false);
      expect(service.canShareTask(member, task, settings, 'organization')).toBe(false);
    });

    it('should handle strictest lockdown correctly', () => {
      const settings = createOrgSettings({
        enableTaskSharing: false,
        allowPublicTaskSharing: false,
        allowMembersViewAllTasks: false,
        workspaceTaskVisibility: TaskVisibility.FULL_LOCKDOWN,
      });

      const task = createTask({ creatorId: 'user-1' });

      // Even admin cannot share when sharing is disabled
      const admin = createUser({ id: 'user-2', role: UserRole.ADMIN });
      expect(service.canViewTaskList(admin, settings)).toBe(true);
      expect(service.canViewTaskDetails(admin, task, settings)).toBe(true);
      expect(service.canShareTask(admin, task, settings, 'organization')).toBe(false);

      // Creator can only view their own task
      const creator = createUser({ id: 'user-1', role: UserRole.MEMBER });
      expect(service.canViewTaskList(creator, settings)).toBe(false);
      expect(service.canViewTaskDetails(creator, task, settings)).toBe(true);
      expect(service.canShareTask(creator, task, settings, 'organization')).toBe(false);

      // Support has no access
      const support = createUser({ id: 'user-3', role: UserRole.SUPPORT });
      expect(service.canViewTaskList(support, settings)).toBe(false);
      expect(service.canViewTaskDetails(support, task, settings)).toBe(false);
    });
  });
});
