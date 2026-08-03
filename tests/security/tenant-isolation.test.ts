import { describe, it, expect } from "vitest";
import { hasPermission, enforcePermission } from "../../lib/permissions";

describe("Multi-Tenant Workspace RBAC Security", () => {
  it("should allow OWNER to perform all workspace management actions", () => {
    expect(hasPermission("OWNER", "workspace:manage")).toBe(true);
    expect(hasPermission("OWNER", "workspace:delete")).toBe(true);
    expect(hasPermission("OWNER", "credentials:manage")).toBe(true);
  });

  it("should deny VIEWER from creating agents or deleting workspaces", () => {
    expect(hasPermission("VIEWER", "agents:create")).toBe(false);
    expect(hasPermission("VIEWER", "workspace:delete")).toBe(false);
    expect(() => enforcePermission("VIEWER", "agents:create")).toThrow();
  });
});
