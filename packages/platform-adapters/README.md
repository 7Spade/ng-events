# Platform Adapters

🔧 **Technical implementations - The ONLY place that can touch SDKs**

## Principles

> **前端永遠不能碰 firebase-admin**
> **Core 永遠不知道 Angular 是什麼**

This package contains ALL technical integrations and SDK wrappers:

- ✅ Firebase Admin (backend)
- ✅ Firebase Angular (frontend)
- ✅ Auth adapters
- ✅ Notifications
- ✅ Analytics
- ✅ AI services

## Critical SDK Separation Rules

| Adapter Location | Can Use | Cannot Use | Runs In |
|-----------------|---------|------------|---------|
| `firebase/admin` | firebase-admin | ❌ @angular/fire | Node.js (Cloud Run/Functions) |
| `firebase/angular-fire` | @angular/fire | ❌ firebase-admin | Browser/Angular |
| `auth/firebase-admin` | firebase-admin | ❌ @angular/fire | Node.js |
| `auth/angular-fire` | @angular/fire | ❌ firebase-admin | Browser |

**If you violate this = architecture explodes! 💥**

## Structure

### 🛠️ Firebase Admin (`firebase/admin/`)

Backend implementations using firebase-admin:

```typescript
import { FirebaseAdminEventStore } from '@platform-adapters/firebase/admin';

// Runs in Cloud Run / Functions
// Has Service Account privileges (god mode 👑)
// Bypasses Security Rules
```

**Contains:**
- `event-store.adapter.ts` - EventStore implementation
- `projection.adapter.ts` - Projection builder

### 🌐 Firebase Angular-Fire (`firebase/angular-fire/`)

Frontend implementations using @angular/fire:

```typescript
import { FirebaseAuthAdapter, TaskQueryAdapter } from '@platform-adapters/firebase/angular-fire';

// Runs in browser/Angular
// Subject to Security Rules
// User perspective
```

**Contains:**
- `auth.adapter.ts` - Auth state bridge to @delon/auth
- `task.query.adapter.ts` - Task read model queries

### 🔐 Auth Adapters (`auth/`)

Separate auth adapters for admin vs client:

```typescript
// Backend (admin)
import { FirebaseAdminAuthAdapter } from '@platform-adapters/auth';
// User management, custom claims, roles

// Frontend (client)
import { AngularFireAuthStateAdapter } from '@platform-adapters/auth';
// Auth state, token access
```

### 📬 Notification Adapters (`notification/`)

```typescript
import { FCMAdapter, EmailAdapter } from '@platform-adapters/notification';

// Push notifications (FCM)
// Email notifications
```

### 📊 Analytics Adapters (`analytics/`)

```typescript
import { GoogleAnalyticsAdapter } from '@platform-adapters/analytics';

// Event tracking
// Page view tracking
```

### 🤖 AI Adapters (`ai/`)

```typescript
import { GenAIAdapter, VertexAIAdapter } from '@platform-adapters/ai';

// Generative AI
// Vertex AI predictions
```

## Usage

This package is imported by:

- ✅ `ui-angular` - For frontend adapters
- ✅ Cloud Functions - For backend adapters
- ❌ `core-engine` - NEVER (core is pure)
- ❌ `saas-domain` - NEVER (domain is pure)

## SDK Usage Table

| What You Need | Which Adapter | SDK Used |
|--------------|---------------|----------|
| Write events to Event Store | firebase/admin | firebase-admin |
| Build projections | firebase/admin | firebase-admin |
| Query tasks in UI | firebase/angular-fire | @angular/fire |
| User login state | firebase/angular-fire | @angular/fire |
| Manage user roles | auth/firebase-admin | firebase-admin |
| Get user token | auth/angular-fire | @angular/fire |
| Send push notification | notification/fcm | firebase-admin |
| Track analytics | analytics/ga | @angular/fire or gtag |

## One-Sentence Rule

> **@angular/fire is for what USERS see**
> **firebase-admin is for what the SYSTEM does**

## License

MIT
