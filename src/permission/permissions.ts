import { PermissionsService, User } from "../model/permission-model";
export const MockPermissions: PermissionsService = {
  CheckPermissions: async (user, permission) =>
    user.permissions.includes(permission),
};
