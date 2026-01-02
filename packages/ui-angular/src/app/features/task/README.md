# Task Feature Module

This directory will contain Angular components for Task management.

## Structure

```
task/
├── components/       # Task UI components
├── pages/           # Task pages/routes
├── services/        # Task-specific Angular services
└── task.routes.ts   # Task routing configuration
```

## Guidelines

- Use `CoreEngineFacade` from `@app/adapters` to access domain logic
- Keep components focused on presentation
- Delegate business logic to the facade
- Follow Angular standalone component patterns
