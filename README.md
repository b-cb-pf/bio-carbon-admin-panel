# Bio Carbon Admin Panel

A responsive CarbonProfile administration interface built with Next.js, React, and TypeScript. The routes mirror the supplied Figma admin-panel flows.

## Implemented routes

- `/login`, `/forgot-password`, `/reset-password`, `/setup-password`
- `/staff`, `/staff/new`
- `/companies`, `/companies/new`, `/companies/[id]`
- `/templates`
- `/master-data`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). Port 3000 is reserved for
the local platform backend.

The root route redirects to the Staff screen, matching the first admin navigation item.

## Mock API

The application includes a typed mock/remote API switch. Copy `.env.example` to `.env.local`; mock mode is enabled by default. See [lib/api/README.md](lib/api/README.md) for the endpoint contracts and instructions for connecting a real backend.
