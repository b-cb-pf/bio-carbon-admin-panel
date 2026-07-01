# API integration layer

The UI imports domain services from this folder instead of importing mock data directly.

## Development with mock data

Copy `.env.example` to `.env.local` and keep:

```env
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_MOCK_API_DELAY=250
```

`client.ts` will execute each service's `mock` callback. `mock-store.ts` is an in-memory store, so changes reset when the browser or development server restarts.

## Connect a real backend

Change the flag:

```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=/api
```

Then implement Next.js Route Handlers under `app/api`. The service modules already call these contracts:

| Method | Path | Purpose |
| --- | --- | --- |
| GET, POST | `/api/staff` | Search/list and create staff |
| PATCH | `/api/staff/:id/status` | Change staff status |
| DELETE | `/api/staff/:id` | Remove staff |
| GET, POST | `/api/companies` | Search/list and create companies |
| GET, PATCH, DELETE | `/api/companies/:id` | Read, update, and delete a company |
| GET, POST | `/api/templates` | List and upload template metadata |
| DELETE | `/api/templates/:id` | Remove a template |
| GET | `/api/master-data` | Filter master data |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request a reset email |
| POST | `/api/auth/set-password` | Set a new password |

If your backend uses different paths or response shapes, update only the corresponding domain service. Keep authorization tokens in secure HttpOnly cookies and proxy private backend requests through Route Handlers.

## Files

- `client.ts`: mock/remote switch, JSON requests, credentials, and `ApiError`.
- `mock-store.ts`: mutable mock database used during frontend development.
- `*-api.ts`: typed domain-specific operations used by components.
