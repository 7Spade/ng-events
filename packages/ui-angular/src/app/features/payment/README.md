# Payment Feature Module

This directory will contain Angular components for Payment management.

## Structure

```
payment/
├── components/       # Payment UI components
├── pages/           # Payment pages/routes
├── services/        # Payment-specific Angular services
└── payment.routes.ts # Payment routing configuration
```

## Guidelines

- Use `CoreEngineFacade` from `@app/adapters` to access domain logic
- Keep components focused on presentation
- Delegate business logic to the facade
- Follow Angular standalone component patterns
