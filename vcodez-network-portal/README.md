# Highre Software Network Portal

A full-stack, multipage network switch & cluster management portal — built to spec:

- **Practice 1** — Switch device table (Model, Physical Device, ID, Config, Status), search by Model/ID, Update status button.
- **Practice 2** — Chart.js band chart (Min/Max/Median) with a time-based X axis via `react-chartjs-2`. Double-click the chart to view the raw timestamped data in a table.
- **Practice 3** — Transactional email: account creation, password reset, and cluster-issue alerts.
- **Practice 4** — Combined into one professional multipage app: authenticated + unauthenticated routes, header, footer, forms that persist on refresh, working browser back/forward, custom hooks (`useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`), and Redis-backed persistence.

The UI is an exact style replica of the reference **Highre Software** design system: emerald/cyan/blue gradient background, floating animated shapes, glassmorphism cards, and the `< >` brand mark.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router + Chart.js (`react-chartjs-2`) + Axios + `react-toastify` + `lucide-react`
- **Backend**: Node.js + Express + JWT auth (`jsonwebtoken` + `bcryptjs`) + Redis (`ioredis`) + Nodemailer

## Project layout

```
highre-software-network-portal/
  backend/     Express API (auth, devices, metrics, alerts)
  frontend/    React app (all pages/components)
```

## 1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env`:

- `REDIS_URL` — paste your real Redis connection string (Redis Cloud, Upstash, self-hosted, etc). If left as `redis://localhost:6379` and nothing is running there, the server **automatically falls back to an in-memory store** so the app still works for local development — you'll see a console warning when this happens.
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` — your SMTP or SendGrid/Mailgun SMTP-relay credentials. If left blank, the server automatically falls back to a **console mailer** that logs the email content instead of sending it — so signup, password reset, and alert flows all keep working end-to-end before you add real credentials.
- `JWT_SECRET` — change to a long random string.

Seed demo devices + metric history (run once, requires Redis reachable):

```bash
npm run seed
```

Run the API:

```bash
npm run dev      # auto-restarts on changes
# or
npm start
```

API runs on `http://localhost:5000` by default.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env    # points VITE_API_URL at the backend
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## How the pieces fit together

- **Auth**: Custom JWT — `POST /api/auth/signup`, `/login`, `/forgot-password`, `/reset-password`, `GET /api/auth/me`. Token + user are persisted to `localStorage` and rehydrated on refresh; expired/invalid tokens automatically redirect to `/login`.
- **Devices** (Practice 1): `GET /api/devices?search=&status=`, `POST /api/devices`, `PATCH /api/devices/:id/status`. Frontend table lives at `frontend/src/components/devices/SwitchDeviceTable.jsx`.
- **Metrics / band chart** (Practice 2): `GET /api/metrics/:cluster`, `POST /api/metrics/:cluster`. Chart lives at `frontend/src/components/charts/BandChart.jsx`; double-click opens `TimestampModal.jsx`.
- **Email** (Practice 3): `backend/src/config/mailer.js` + `backend/src/utils/emailTemplates.js`. Triggered automatically on signup/forgot-password, and manually from the **Alerts** page (`POST /api/alerts/cluster-issue`). Every alert that's sent is also persisted through its own storage layer, `backend/src/models/alertModel.js`, into a dedicated Redis keyspace (`alert:*` / `alerts:log`) separate from user/device/metric data, and can be listed back via `GET /api/alerts`.
- **Persistence across refresh / back-forward** (Practice 4): real routes under `/app/*` (so browser back/forward works natively), plus `usePersistedState` hook (`frontend/src/hooks/usePersistedState.js`) which mirrors form drafts, selected cluster, etc. to `localStorage`.

## Notes on the fallbacks

Both the Redis client and the mailer are written so the app **runs completely end-to-end without any external credentials** — this was intentional so you can demo/test the whole flow immediately, then swap in your real `REDIS_URL` and `SMTP_*` values in `backend/.env` with zero code changes.
