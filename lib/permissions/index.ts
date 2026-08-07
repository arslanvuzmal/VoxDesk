export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'OPERATOR' | 'ANALYST' | 'VIEWER';

export type PermissionAction =
  | 'workspace:manage'
  | 'workspace:delete'
  | 'members:manage'
  | 'agents:create'
  | 'agents:edit'
  | 'agents:delete'
  | 'credentials:manage'
  | 'phone:manage'
  | 'knowledge:manage'
  | 'qualification:manage'
  | 'escalation:manage'
  | 'calls:view'
  | 'calls:delete'
  | 'escalations:handle'
  | 'leads:update'
  | 'appointments:manage'
  | 'analytics:view'
  | 'audit:view';

const ROLE_PERMISSIONS: Record<WorkspaceRole, PermissionAction[]> = {
  OWNER: [
    'workspace:manage',
    'workspace:delete',
    'members:manage',
    'agents:create',
    'agents:edit',
    'agents:delete',
    'credentials:manage',
    'phone:manage',
    'knowledge:manage',
    'qualification:manage',
    'escalation:manage',
    'calls:view',
    'calls:delete',
    'escalations:handle',
    'leads:update',
    'appointments:manage',
    'analytics:view',
    'audit:view',
  ],
  ADMIN: [
    'workspace:manage',
    'members:manage',
    'agents:create',
    'agents:edit',
    'credentials:manage',
    'phone:manage',
    'knowledge:manage',
    'qualification:manage',
    'escalation:manage',
    'calls:view',
    'escalations:handle',
    'leads:update',
    'appointments:manage',
    'analytics:view',
    'audit:view',
  ],
  OPERATOR: [
    'calls:view',
    'escalations:handle',
    'leads:update',
    'appointments:manage',
    'analytics:view',
  ],
  ANALYST: ['calls:view', 'analytics:view'],
  VIEWER: ['calls:view', 'analytics:view'],
};

export function hasPermission(role: WorkspaceRole, action: PermissionAction): boolean {
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes(action);
}

export function enforcePermission(role: WorkspaceRole, action: PermissionAction): void {
  if (!hasPermission(role, action)) {
    throw new Error(`Permission denied for action '${action}' under role '${role}'`);
  }
}
