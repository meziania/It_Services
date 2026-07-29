import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or whole controller) as exempt from the global JwtAuthGuard
 * (Docs2/12 Sprint 2 "Auth"). Used for /health and /auth/login|register.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
