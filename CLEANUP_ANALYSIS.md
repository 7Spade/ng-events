# Cleanup Analysis & Auth Implementation Plan

## Summary of Changes Made

### 1. Mobile Phone Login Removal ✅
- Removed mobile login tab from login component
- Removed mobile and captcha fields from register component
- Simplified form validation logic
- Removed social login integration (Auth0, GitHub, Weibo)

### 2. Demo Routes Cleanup ✅
Deleted the following demo directories (120+ files):
- `src/app/routes/delon/` - Delon component examples
- `src/app/routes/pro/` - Pro form/list/profile examples
- `src/app/routes/style/` - Style examples
- `src/app/routes/widgets/` - Widget examples
- `src/app/routes/data-v/` - Data visualization examples
- `src/app/routes/extras/` - Extra features examples

### 3. Mock Data Cleanup ✅
- Removed entire `_mock/` directory with demo data files

### 4. Dashboard Simplification ✅
- Removed analysis, monitor, workplace dashboards
- Kept only v1 dashboard as the main dashboard
- Updated routes to reflect changes

### 5. Menu Configuration Update ✅
- Updated `src/assets/tmp/app-data.json`
- Removed all references to deleted routes
- Simplified to single dashboard entry
- Changed app name from "NG-ALAIN" to "NG-EVENTS"

## Remaining Cleanup Opportunities

### 1. Passport Routes Simplification
**Current State:**
- Login component (simplified)
- Register component (simplified)
- Register-result component
- Lock component
- Callback components for social auth

**Recommended:**
- Remove social auth callback components (auth0, github, weibo)
- Remove lock component if not needed
- Keep only login and register

### 2. Layout Components Review
**Current State:**
- Basic layout (main app layout)
- Blank layout (for full-page views)
- Passport layout (for login/register)

**Recommended:**
- Keep all three as they serve different purposes
- Review sidebar/header widgets for unused components

### 3. Shared Components Analysis
Need to review `src/app/shared/` for:
- Unused widgets
- Demo-specific components
- ST (Simple Table) widgets that reference deleted features

### 4. i18n Localization Files
**Current State:**
- Many i18n keys for deleted routes still exist

**Recommended:**
- Clean up unused i18n keys in language files
- Remove menu translations for deleted routes

### 5. Assets Cleanup
**Potential cleanup:**
- Review `src/assets/` for unused demo images
- Check for unused fonts or icons

## Authentication Flow Implementation Plan

### Current Architecture
```
@angular/fire/auth (Firebase Auth)
    ↓
@delon/auth (Token Management)
    ↓
DA_SERVICE_TOKEN (Token Service Interface)
```

### Current Issues
1. Demo login uses mock HTTP endpoint `/login/account`
2. Firebase Auth is configured but not used in login flow
3. Social login removed but imports still exist
4. Token management is in place but not connected to real auth

### Recommended Auth Flow (Occam's Razor Approach)

#### Phase 1: Firebase Auth Integration
1. **Update Login Component:**
   ```typescript
   // Use Firebase Auth for actual authentication
   import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
   
   submit() {
     const { userName, password } = this.form.value;
     signInWithEmailAndPassword(this.auth, userName + '@domain.com', password)
       .then((credential) => {
         // Set token in @delon/auth
         this.tokenService.set({
           token: credential.user.uid,
           email: credential.user.email,
           // ... other user data
         });
       });
   }
   ```

2. **Update Register Component:**
   ```typescript
   import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
   
   submit() {
     createUserWithEmailAndPassword(this.auth, email, password)
       .then(() => router.navigate(['/dashboard']));
   }
   ```

#### Phase 2: Token Management Simplification
1. **Use Firebase ID Token:**
   - Replace custom token with Firebase ID token
   - Let Firebase handle token refresh automatically
   
2. **Update Interceptor:**
   ```typescript
   // In auth interceptor, use Firebase token
   async intercept(req, next) {
     const user = await this.auth.currentUser;
     if (user) {
       const token = await user.getIdToken();
       req = req.clone({
         setHeaders: { Authorization: `Bearer ${token}` }
       });
     }
     return next.handle(req);
   }
   ```

#### Phase 3: Startup Service Update
- Remove mock user data loading
- Load user info from Firebase Auth currentUser
- Sync with Firestore for additional user profile data

### Implementation Steps

1. **Remove unused auth features:**
   - Delete social login callback components
   - Remove SocialService dependencies
   - Clean up environment auth configuration

2. **Integrate Firebase Auth:**
   - Update login to use Firebase signIn
   - Update register to use Firebase createUser
   - Add password reset flow with Firebase

3. **Simplify token management:**
   - Use Firebase ID token directly
   - Remove custom token refresh logic
   - Let Firebase SDK handle auth state

4. **Update guards:**
   - Use Firebase auth state for route guards
   - Remove complex auth-refresh logic
   - Simplify to: authenticated vs anonymous

5. **Testing:**
   - Test login with Firebase Auth
   - Test token persistence
   - Test route guards
   - Test logout flow

## Package Analysis (Based on User's List)

### Keep - Essential Angular Packages ✅
- All `@angular/*` core packages
- `@angular/fire/*` for Firebase integration
- `@angular/cdk` for component utilities

### Keep - ng-alain Ecosystem ✅
- `@delon/theme` - Theme system
- `@delon/auth` - Auth management
- `@delon/acl` - Access control
- `@delon/abc` - Business components (review which ones are actually used)
- `@delon/util` - Utilities

### Review - Potentially Removable
- `@delon/form` - If not using dynamic forms
- `@delon/mock` - Demo mock service (can remove)
- `@delon/cache` - If not using cache service
- `@delon/chart` - If not using charts

### Keep - ng-zorro-antd ✅
- Core UI component library

## Next Steps Priority

1. **High Priority:**
   - Remove social auth callback components
   - Implement Firebase Auth in login/register
   - Test basic auth flow

2. **Medium Priority:**
   - Clean up i18n files
   - Review shared components for unused items
   - Simplify startup service

3. **Low Priority:**
   - Asset cleanup
   - Package optimization
   - Performance testing
