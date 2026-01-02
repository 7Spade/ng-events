# Issue Feature Module

This directory will contain Angular components for Issue tracking.

## Structure

```
issue/
├── components/       # Issue UI components
├── pages/           # Issue pages/routes
├── services/        # Issue-specific Angular services
└── issue.routes.ts  # Issue routing configuration
```

## Guidelines

- Use `CoreEngineFacade` from `@app/adapters` to access domain logic
- Keep components focused on presentation
- Delegate business logic to the facade
- Follow Angular standalone component patterns
