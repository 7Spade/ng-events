# UI Angular

💅 **Angular user interface layer**

## Principles

> **前端只能碰 @angular/fire，永遠不能碰 firebase-admin**

This package contains the Angular application:

- ✅ Uses @angular/fire for Firebase client SDK
- ✅ Uses @platform-adapters for backend integration
- ❌ CANNOT use firebase-admin
- ❌ Should NOT import @core-engine or @saas-domain directly

## Structure

```
src/app/
├── adapters/         # Facades for accessing core functionality
│   └── core-engine.facade.ts
├── features/         # Domain-aligned feature modules
│   ├── task/
│   ├── payment/
│   └── issue/
├── core/            # Angular infrastructure
│   ├── i18n/
│   ├── startup/
│   └── net/
├── routes/          # Page routes
├── shared/          # Shared UI components
└── layout/          # Layout components
```

## Access Pattern

**✅ GOOD: Use facade**
```typescript
import { CoreEngineFacade } from '@app/adapters';

class MyComponent {
  facade = inject(CoreEngineFacade);
  
  async loadTasks() {
    return this.facade.getTasksByBlueprint('workspace-123');
  }
}
```

**❌ BAD: Direct import from core**
```typescript
// DON'T DO THIS!
import { EventStore } from '@core-engine';
```

## Dependencies

- `@platform-adapters` - For Firebase and domain access
- `@angular/fire` - Firebase client SDK
- Angular 20+

## Rules

- All backend access goes through `@platform-adapters`
- No direct Firebase imports outside of adapters
- No firebase-admin imports (compile-time error via ESLint)
- Features should be organized by domain (task, payment, issue)

## License

MIT
