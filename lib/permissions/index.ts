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
  | 'conversations:start'
  | 'calls:delete'
  | 'escalations:handle'
  | 'leads:update'
  | 'appointments:manage'
  | 'campaigns:view'
  | 'campaigns:manage'
  | 'campaigns:approve'
  | 'campaigns:execute'
  | 'outbound:execute'
  | 'analytics:view'
  | 'audit:view'
  | 'improvement:view'
  | 'improvement:approve';

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
    'conversations:start',
    'calls:delete',
    'escalations:handle',
    'leads:update',
    'appointments:manage',
    'campaigns:view',
    'campaigns:manage',
    'campaigns:approve',
    'campaigns:execute',
    'outbound:execute',
    'analytics:view',
    'audit:view',
    'improvement:view',
    'improvement:approve',
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
    'conversations:start',
    'escalations:handle',
    'leads:update',
    'appointments:manage',
    'campaigns:view',
    'campaigns:manage',
    'campaigns:approve',
    'campaigns:execute',
    'outbound:execute',
    'analytics:view',
    'audit:view',
    'improvement:view',
    'improvement:approve',
  ],
  OPERATOR: [
    'calls:view',
    'conversations:start',
    'escalations:handle',
    'leads:update',
    'appointments:manage',
    'campaigns:view',
    'campaigns:manage',
    'campaigns:execute',
    'outbound:execute',
    'analytics:view',
    'improvement:view',
  ],
  ANALYST: ['calls:view', 'campaigns:view', 'analytics:view', 'improvement:view'],
  VIEWER: ['calls:view', 'campaigns:view', 'analytics:view', 'improvement:view'],
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

