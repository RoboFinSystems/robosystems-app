Start the frontend development server.

## Prerequisites

Ensure the backend API is running at the configured `NEXT_PUBLIC_ROBOSYSTEMS_API_URL`.

## Steps

1. Check if dependencies need to be installed
2. Start the Next.js development server on port 3000

## Commands

Install dependencies if node_modules is missing:

```bash
test -d node_modules || npm install
```

Start the development server in the background:

```bash
npm run dev &
```

## Access

- **App**: http://localhost:3000
- **API Proxy**: Configured via `NEXT_PUBLIC_ROBOSYSTEMS_API_URL`

## Related

Run `/dev` in the robosystems (backend) repository first to start the API.
