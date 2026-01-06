import { HttpHandlerFn, HttpRequest, HttpResponseBase } from '@angular/common/http';
import { Injector, Provider } from '@angular/core';
import { Observable, throwError } from 'rxjs';

/**
 * Skeleton refresh-token handler
 * - Token 管理/刷新交由 @delon/auth (ITokenService / JWTInterceptor)
 * - 此處僅保留結構與返回型別，不實作刷新邏輯
 */
export function tryRefreshToken(_injector: Injector, ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> {
  // Skeleton: no custom refresh; simply propagate error or retry as-is if needed later
  if (ev.status === 401) {
    return throwError(() => ev);
  }
  return next(req);
}

/**
 * Provider hook placeholder for future refresh binding.
 * Keep signature for app.config.ts and net index exports.
 */
export function provideBindAuthRefresh(): Provider[] {
  return [];
}
