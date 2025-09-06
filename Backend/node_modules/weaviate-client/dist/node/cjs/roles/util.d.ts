import { WeaviateAssignedUser, WeaviateDBUser, Permission as WeaviatePermission, Role as WeaviateRole, WeaviateUser } from '../openapi/types.js';
import { User, UserDB } from '../users/types.js';
import { AliasPermission, BackupsPermission, ClusterPermission, CollectionsPermission, DataPermission, NodesPermission, Permission, PermissionsInput, Role, RolesPermission, TenantsPermission, UserAssignment, UsersPermission } from './types.js';
export declare class PermissionGuards {
    private static includes;
    static isAlias: (permission: Permission) => permission is AliasPermission;
    static isBackups: (permission: Permission) => permission is BackupsPermission;
    static isCluster: (permission: Permission) => permission is ClusterPermission;
    static isCollections: (permission: Permission) => permission is CollectionsPermission;
    static isData: (permission: Permission) => permission is DataPermission;
    static isNodes: (permission: Permission) => permission is NodesPermission;
    static isRoles: (permission: Permission) => permission is RolesPermission;
    static isTenants: (permission: Permission) => permission is TenantsPermission;
    static isUsers: (permission: Permission) => permission is UsersPermission;
    static isPermission: (permissions: PermissionsInput) => permissions is Permission;
    static isPermissionArray: (permissions: PermissionsInput) => permissions is Permission[];
    static isPermissionMatrix: (permissions: PermissionsInput) => permissions is Permission[][];
    static isPermissionTuple: (permissions: PermissionsInput) => permissions is (Permission | Permission[])[];
}
export declare class Map {
    static flattenPermissions: (permissions: PermissionsInput) => Permission[];
    static permissionToWeaviate: (permission: Permission) => WeaviatePermission[];
    static roleFromWeaviate: (role: WeaviateRole) => Role;
    static roles: (roles: WeaviateRole[]) => Record<string, Role>;
    static users: (users: string[]) => Record<string, User>;
    static user: (user: WeaviateUser) => User;
    static dbUser: (user: WeaviateDBUser) => UserDB;
    static dbUsers: (users: WeaviateDBUser[]) => UserDB[];
    static assignedUsers: (users: WeaviateAssignedUser[]) => UserAssignment[];
    static unknownDate: (date?: unknown) => Date | undefined;
}
