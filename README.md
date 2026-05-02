# TravelMate Platform

A working MakeMyTrip-style full-stack mock travel platform with a React frontend, Express backend, and dummy in-memory database layer.

## Features

- Dashboard for bookings, tracked flights, live alerts, and current dynamic fare.
- Cancellation and refund flow with predefined reasons, automatic refund calculation, partial refunds, and refund status tracking.
- Reviews with 1-5 star ratings, text, photo URLs, replies, sorting, and moderation flagging.
- Mock live flight status API that rotates status updates and dashboard notifications.
- Interactive seat map and room selection grid with premium upsell pricing and saved preferences.
- Dynamic pricing engine with demand/season/inventory factors, price history chart, and price freeze.
- Personalized recommendations with transparent "Why this recommendation?" tooltips and feedback.

## Project Structure

- `client/src/` - React UI components, state, styling, and API calls.
- `server/server.js` - Express backend routes.
- `server/database.js` - Dummy database-style data and business logic.
- `vite.config.js` - React dev server config with `/api` proxy to Express.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

For production-style serving:

```bash
npm run build
npm start
```

Then open `http://localhost:3000`.

## GitHub Pages Deployment

This repo includes `.github/workflows/deploy.yml` for GitHub Pages.

1. Push the repo to GitHub on the `main` branch.
2. In GitHub, open `Settings -> Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push again or run the `Deploy GitHub Pages` workflow manually.

GitHub Pages hosts only the React static app. The React app automatically falls back to a browser-side dummy API when the Express backend is not available, so the demo still works live on Pages. For a real production backend, deploy `server/` separately to Render, Railway, Fly.io, or similar, then point the frontend API base URL to that backend.
