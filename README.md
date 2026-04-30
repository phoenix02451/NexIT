# IT Company Website (MERN)

This project is a **MongoDB + Express + React + Node** version of the original static/PHP site. The UI, sections, carousels, counters, FAQ accordion, navigation, contact form, career application (with resume upload), and newsletter subscription behave the same from a user perspective. Submissions are stored in MongoDB; optional **SMTP** email matches the old PHPMailer behavior when credentials are set.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a `MONGO_URI` connection string

## Setup

1. Copy environment files and adjust values:

   ```bash
   copy server\.env.example server\.env
   ```

2. Install dependencies:

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

3. Start **MongoDB** (if local, ensure it accepts connections at `mongodb://127.0.0.1:27017` or set `MONGO_URI` in `server/.env`).

4. Run the app in development (API + Vite):

   ```bash
   npm run dev
   ```

- React UI: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5000](http://localhost:5000) (proxied to `/api` from Vite)

## Email (optional)

To mirror the PHP mailer, set in `server/.env`:

- `SMTP_HOST`, `SMTP_PORT` (defaults: Gmail / 587)
- `SMTP_USER`, `SMTP_PASS` (e.g. Gmail app password)
- `SMTP_TO` — recipient inbox
- `SMTP_FROM_NAME` — display name (default: `Website Form`)

If SMTP is not configured, forms still save to MongoDB and return the same success message; email is skipped.

## Production build

```bash
npm run build --prefix client
npm run start --prefix server
```

Serve the `client/dist` folder with a static host or reverse proxy, and point `CLIENT_URL` / CORS to your public site URL.

## Blank page / Chrome shows `blocked:origin`

That usually came from **blocked third-party CSS** (Bootstrap / Font Awesome CDNs with integrity checks, or network policies). This project now **bundles Bootstrap and Font Awesome from npm** and serves **Ionicons from `client/public/lib/`**, so the main UI should load without those cross-origin stylesheet requests.

If anything is still blocked, check the Network tab for the exact URL (e.g. `fonts.googleapis.com` from `style.css`); blocking fonts only affects typography, not the whole page. Use a normal window (not “Block third-party cookies” test mode tied to strict blocking) and hard-refresh (**Ctrl+Shift+R**).

## Legacy static site

The original `index.html`, `careers.html`, PHP, and `css/` tree are unchanged alongside `client/` and `server/`. You may remove them once you rely entirely on the MERN stack.

## Original README note

The old GitHub Pages deployment and XAMPP/WAMP PHP mail instructions applied to the legacy project only.
