# Job Portal - Frontend

Web client for a task marketplace (SajiloWork-style). Customers post jobs; taskers browse, bid, chat, and get paid. Built with Next.js 16, React 19, and TypeScript.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Forms | React Hook Form, Zod |
| HTTP | Axios |
| Real-time | Socket.IO client |
| Maps | Leaflet, React Leaflet |
| UI | Radix UI, lucide-react, Motion |

## Features

- Authentication (sign in, sign up, social login, password reset)
- Task discovery (search, filters, map view)
- Post and manage tasks
- Bidding workflow
- Real-time chat (Socket.IO)
- Payments (wallet, Khalti, eSewa)
- Tasker dashboard and admin area
- Blog and policy pages

## Project structure

```
frontend/
  src/
    app/          # Routes (discover, post-task, message, payment, auth, ...)
    components/   # UI components
    hooks/        # Custom hooks
    lib/          # API client
    services/     # API modules
    store/        # Zustand stores
    types/        # TypeScript types
  public/
```

## Documentation

- Setup: this README
- Internal notes: [doc/INDEX.md](./doc/INDEX.md)
- Dev utilities: [scripts/dev/](./scripts/dev/)

## Getting started

**Prerequisites:** Node.js 18+ and the [backend API](https://github.com/everpeaknp/Job-Portal-Backend) running.

```bash
git clone https://github.com/everpeaknp/Job-Portal-Frontend.git
cd Job-Portal-Frontend
npm install
cp .env.example .env.local   # edit values
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Description |
|---------|-------------|
| npm run dev | Development server |
| npm run build | Production build |
| npm run start | Run production build |
| npm run lint | ESLint |

## Environment

Copy `.env.example` to `.env.local`. Typical variables:

- `NEXT_PUBLIC_API_URL` - backend REST API base URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL for chat

## License

Proprietary. All rights reserved.