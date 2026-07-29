import { SetMetadata } from '@nestjs/common';
import { Role } from '@serviceit-scanner/database';

export const ROLES_KEY = 'roles';

/** Restricts a route to one or more roles — used with RolesGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
