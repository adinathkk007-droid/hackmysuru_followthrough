# Civic Follow-through Frontend Integration

This frontend is configured for the Civic Follow-through Express + Supabase backend.

## 1. Configure environment

Copy `.env.example` to `.env` and set:

- `VITE_API_BASE_URL=http://localhost:5000`
- `VITE_SUPABASE_URL=https://zjhqkdtkocddiofcapnh.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<Supabase publishable/anon key>`

Never put `SUPABASE_SERVICE_ROLE_KEY` in this frontend.

## 2. Start backend first

From the backend project:

```bash
npm start
```

Verify:

```text
http://localhost:5000/health
```

## 3. Start frontend

```bash
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## Demo accounts

Citizen:
`citizen.demo@civicmysuru.local`
`CivicDemo123!`

Authority:
`authority.demo@civicmysuru.local`
`CivicDemo123!`

The frontend uses real Supabase Auth tokens for protected backend calls. The service-role key is never used in the browser.
