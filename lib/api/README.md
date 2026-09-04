# API integration layer

The UI imports domain services from this folder instead of importing mock data directly.

## Development with mock data

Copy `.env.example` to `.env.local` and keep:

```env
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_MOCK_API_DELAY=250
```

`client.ts` will execute each service's `mock` callback. `mock-store.ts` is an in-memory store, so changes reset when the browser or development server restarts.

## Connect a real backend

Change the flag:

```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

The frontend runs on port 3001 so it does not conflict with the local backend on
port 3000. Auth and tenant requests explicitly use the backend even while the
mock flag remains enabled for the other modules. They call these contracts:

| Method | Path | Purpose |
| --- | --- | --- |
| GET, POST | `/api/platform/staff` | Search/list and invite staff |
| GET, DELETE | `/api/platform/staff/:id` | Read or remove staff |
| PATCH | `/api/platform/staff/:id/activate` | Activate staff after password setup |
| PATCH | `/api/platform/staff/:id/deactivate` | Deactivate staff |
| POST | `/api/platform/staff/:id/resend-invitation` | Resend a staff invitation |
| GET, POST | `/api/platform/tenants` | Search/list and create tenants |
| GET, PATCH, DELETE | `/api/platform/tenants/:id` | Read, update, and delete a tenant |
| GET, POST | `/api/templates` | List and upload template metadata |
| DELETE | `/api/templates/:id` | Remove a template |
| GET | `/api/master-data` | Filter master data |
| POST | `/api/platform/auth/login` | Login |
| POST | `/api/platform/auth/password-resets` | Request a password-reset email |
| GET | `/api/platform/auth/password-resets/validate` | Validate a password-reset token |
| POST | `/api/platform/auth/reset-password` | Replace a password using a reset token |
| GET | `/api/platform/auth/invitations/validate` | Validate an invitation token |
| POST | `/api/platform/auth/setup-password` | Set an invited staff password |
| POST | `/api/platform/auth/logout` | Revoke the active session |

Login sessions are held in browser session storage and sent as bearer tokens on
protected requests. A 401 response clears the local session and returns the user
to the login page.

## Files

- `client.ts`: mock/remote switch, JSON requests, credentials, and `ApiError`.
- `mock-store.ts`: mutable mock database used during frontend development.
- `*-api.ts`: typed domain-specific operations used by components.
