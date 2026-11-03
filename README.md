# BinZ

BinZ is a recycling and scrap-collection web project. It combines a static HTML/CSS/JavaScript frontend with an Express/MongoDB backend. Users can create an account, sign in, book a scrap pickup by phone, browse scrap prices, view a Z-Coin leaderboard, submit an e-waste ticket, and use the video-upload reward flow.

## Project Status

This repository is a prototype. Several frontend screens are complete enough to demonstrate the user experience, while some integrations still need wiring or cleanup. The **Known Limitations** section describes behavior that is currently simulated or blocked by missing files.

## Quick Start: Frontend

Use this when cloning the current React frontend repo:

```powershell
git clone https://github.com/manika-03/BinZ_Frontend.git
cd BinZ_Frontend
npm install
npm run dev
```

Then open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

The e-waste tracker page is available at:

```text
http://localhost:5173/#ewaste-tracker
```

If `npm install` or `npm run dev` fails, first check the Node.js version:

```powershell
node -v
```

This frontend uses Vite 8, so use Node.js `20.19+` or `22.12+`.

## Technology

- **Frontend:** React, Vite, CSS, Chart.js, and Lucide React
- **Backend:** Node.js, Express 4, CORS, and body-parser
- **Database:** MongoDB through Mongoose
- **Authentication storage:** Signed, HTTP-only session cookie (24-hour expiry)
- **Password security:** bcrypt hashing on registration
- **External services:** Twilio SMS and Gmail SMTP
- **Uploads:** Multer saves uploaded videos to `backend/uploads/`
- **Web media:** The deployed frontend uses WebP logo/hero images and a compressed, metadata-only-loaded promotional video. Original source media remains outside `public/assets`; only optimized variants are shipped by Vite.
- **Cleanup verification:** Authenticated videos are stored as pending records; an admin review endpoint approves or rejects them.
- **Charts:** Chart.js loaded from a CDN
- **Styling support:** Tailwind CSS is loaded from a CDN on the upload page

## Repository Layout

```text
BinZ-Project/
|-- backend/
|   |-- package.json          Node dependencies and npm scripts
|   |-- package-lock.json     Backend dependency lockfile
|   |-- server.js             Express API and MongoDB models
|   `-- uploads/              Uploaded video files
|-- public/assets/            Runtime assets served by Vite
|-- assets/                   Source copies of images and video assets
|-- src/                      Current React/Vite frontend source
|   |-- App.jsx               Main app and hash routing
|   |-- main.jsx              React entry point
|   |-- styles.css            Main site styles
|   `-- components/           React page and section components
|-- CSS/                      Legacy copies of page stylesheets
|-- HTML/
|   |-- home-page.html        Main dashboard and landing page
|   |-- Scrap.html            Scrap and e-waste price catalog
|   |-- upload.html           Video reward page
|   |-- test.html             E-waste ticket form
|   |-- regestrion.html       Registration page (filename is misspelled intentionally in current links)
|   |-- sign.html             Login page
|   |-- js.js                 Shared dashboard/upload/browser logic
|   |-- registration.js       Registration form logic
|   |-- test.js               Login form logic despite its generic filename
|   |-- *.css                 Page-specific styles
|   `-- Images/               Logos, product images, badges, and artwork
|-- .gitignore                Ignores environments, secrets, IDE files, and model weights
|-- package.json              Frontend scripts and dependencies
|-- package-lock.json         Frontend dependency lockfile
`-- README.md                This project guide
```

The current frontend is the React/Vite app in `src/`. The `HTML/` and `CSS/` folders are legacy files and are not the main app opened by `npm run dev`.

## Prerequisites

Install the following before running the full project:

- Node.js 20.19 or newer and npm
- MongoDB running locally, or a MongoDB connection string
- Python, plus the dependencies required by the missing detector script, if video detection is enabled
- Twilio credentials for SMS booking
- A Gmail account or SMTP-compatible account for ticket confirmation emails

## Configuration

Create `backend/.env` and keep it out of version control:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/binzDB
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-app-password
```

`MONGO_URI` defaults to `mongodb://localhost:27017/binzDB`. `PORT` defaults to `5050`.

The current `backend/server.js` also contains hard-coded Twilio credentials. These credentials should be revoked/rotated immediately and replaced with environment variables such as:

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_NUMBER=+10000000000
```

Do not commit real credentials, SMTP passwords, or model files.

## Installation

For the current React/Vite frontend, run this from PowerShell at the repository root:

```powershell
npm install
npm run dev
```

For the optional backend, run:

```powershell
Set-Location backend
npm install
```

The root `package-lock.json` describes the React/Vite frontend dependencies. The backend has its own `backend/package-lock.json`.

## Running the Backend

Start MongoDB first, then run:

```powershell
Set-Location backend
node server.js
```

The API listens on `http://localhost:5000` unless `PORT` is changed. A successful startup prints a MongoDB connection message and a server-running message.

The current frontend has a Vite build system at the repository root. Start it with:

```powershell
npm run dev
```

For local development the frontend requests `http://localhost:5050` by default. For a separate deployment, set the frontend deployment variable `VITE_API_URL` to the backend's public HTTPS URL, for example `https://binz-api.example.com`, then redeploy the frontend (Vite embeds this value during the build). On the backend set `NODE_ENV=production`, `CLIENT_ORIGIN` to the frontend's exact URL, `JWT_SECRET`, and `COOKIE_SAME_SITE=none`; verify the backend first at `/health`.

Do not use `npx serve HTML` for the current frontend. Use `npm run dev` from the repository root.

## Frontend Pages

### `HTML/sign.html`

Login screen. It loads `test.js`, sends the email and password to `POST /login`, stores the returned email, first name, and coins in `localStorage`, and redirects to `home-page.html` on success.

### `HTML/regestrion.html`

Registration screen. It collects first name, last name, email, password, and location, then calls `POST /register`. The server validates and hashes the password and starts the account with five coins.

The filename is `regestrion.html` rather than `registration.html`; existing links depend on the current spelling.

### `HTML/home-page.html`

Main dashboard. It includes:

- Navigation to Home, Scrap, and Earn Coins
- User name and local Z-Coin display
- Pickup booking using a 10-digit phone number
- `POST /sendSMS` booking notification
- Scrap product cards and displayed rates
- Environmental contribution form with in-memory Chart.js line and pie charts
- Top-three Uttar Pradesh leaderboard from `GET /leaderboard`
- About section and contact information
- Z-Chat panel with About, scheduling, contact, and e-waste actions

Environmental tracker entries exist only in the current page memory and disappear on refresh.

### `HTML/Scrap.html`

Static catalog of normal recyclables and large appliances. It displays product images, approximate rates, and notes about bulk quotes or item condition. It does not currently submit a sale or pickup request to the backend.

### `HTML/upload.html`

Video reward screen. It shows the shared navigation and upload controls for name, email, and a video. It loads `js.js`, but the active upload handler currently simulates processing in the browser: it waits, generates a random reward from 1 to 10, and updates a temporary wallet. It does not call `POST /uploadVideo`.

### `HTML/test.html`

E-waste ticket form. It collects name, email, e-waste type, and description and is intended to call `POST /submit-ticket`. The page references `styles.css` and `ewaste-background.jpg`, neither of which currently exists in `HTML/`.

## Browser Storage

The frontend uses these `localStorage` keys:

| Key | Meaning |
|---|---|
| `firstName` | Display name after login or registration |
| `lastName` | Stored by the registration code, but not returned correctly by the current server response |
| `email` | Current user's email |
| `coins` | Last coin value received by the frontend |

This storage is not authentication. A user can edit it, and the backend does not verify ownership when updating coins or storing phone numbers. A production version needs real authentication and authorization.

## Backend API

All API requests use JSON except video uploads, which use multipart form data.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/register` | Validate input, create a user, hash the password, and award five starting coins |
| `POST` | `/login` | Verify email and password and return first name and coin balance |
| `POST` | `/sendSMS` | Send a pickup confirmation SMS to an Indian 10-digit phone number |
| `POST` | `/storePhoneNumber` | Save a phone number against a user email |
| `GET` | `/leaderboard` | Return the three users with the highest coin balances |
| `GET` | `/getCoins/:email` | Return a user's current coin balance |
| `POST` | `/rewardCoins` | Add a caller-supplied number of coins to a user's balance |
| `POST` | `/uploadVideo` | Store an authenticated cleanup video as a pending verification |
| `GET` | `/scrap-prices?location=Greater%20Noida&date=2026-11-03` | Return the applicable effective-dated scrap rates |
| `GET` | `/scrap-prices/:materialId/history` | Return preserved price history for one material |
| `POST` | `/scrap-prices` | Admin-only effective-dated price record creation |
| `GET` | `/cleanup-verifications` | List the signed-in user's verification history and confirmed reward balance |
| `GET` | `/cleanup-verifications/:verificationId` | Read one owned verification |
| `PATCH` | `/cleanup-verifications/:verificationId/review` | Admin-only approval or rejection; approval credits `CLEANUP_VIDEO_REWARD` once |
| `POST` | `/submit-ticket` | Save an e-waste ticket and email a confirmation |
| `GET` | `/register` | Simple route availability response |
| `GET` | `/login` | Simple route availability response |

### Request examples

Register:

```json
{
  "firstName": "Asha",
  "lastName": "Sharma",
  "email": "asha@example.com",
  "password": "StrongPass1!",
  "state": "Uttar Pradesh"
}
```

Submit a ticket:

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "eWasteType": "mobile",
  "description": "Old phone for responsible recycling"
}
```

Upload video fields:

- Multipart field `video`: the uploaded video file
- Multipart field `email`: the account email used to receive a reward

## Database Models

### User

Defined in `backend/server.js` with these fields:

- `firstName`: string
- `lastName`: string
- `email`: unique string, stored in lowercase during registration
- `password`: bcrypt hash
- `state`: string
- `phoneNumber`: string, optional
- `coins`: number, default `0`; registration explicitly awards `5` coins

### Ticket

Defined in `backend/server.js` with these fields:

- `name`: string
- `email`: string
- `eWasteType`: string
- `description`: string
- `ticketID`: generated `EW-######` identifier
- `date`: creation timestamp

## Main Data Flows

1. A visitor opens the login or registration page.
2. Registration creates a MongoDB user with five coins; login verifies the stored bcrypt hash.
3. The frontend writes the returned identity and coin balance to `localStorage`.
4. The homepage reads that local data for display and separately requests leaderboard data from MongoDB.
5. Booking sends an SMS through Twilio. The current booking UI does not call `/storePhoneNumber`.
6. Ticket submission stores a ticket, generates an ID, and sends a confirmation email through Gmail SMTP.
7. The cleanup video flow stores a file as a pending verification. An authenticated admin reviews it; only approval credits the server-configured reward once.

## Known Limitations and Fixes to Prioritize

1. **Secrets in source:** Twilio account credentials are hard-coded in `backend/server.js`. Rotate them and load them from `.env`.
2. **Automated detector:** No automated video detector is present. Pending records require trusted admin review through the review endpoint.
3. **Legacy upload page:** `HTML/upload.html` remains a legacy static page; the active React cleanup flow calls `/uploadVideo` and does not generate client-side rewards.
4. **Missing ticket assets:** `HTML/test.html` references `styles.css` and `ewaste-background.jpg`, which are absent.
5. **Registration response mismatch:** the server returns user data under `User`, while `registration.js` reads top-level fields and logs `result.user`; the UI may store undefined registration values.
6. **Weak authorization:** `/rewardCoins`, `/storePhoneNumber`, and `/getCoins/:email` trust a caller-provided email. Add authenticated sessions or tokens and server-side authorization.
7. **Input and upload hardening:** validate ticket fields, restrict video size/type, escape filenames, handle missing `req.file`, and avoid shell command construction with `exec`.
8. **Login and SMS validation:** normalize and validate email consistently; use a robust phone-number validator and move Twilio settings to environment variables.
9. **No tests or production start script:** `backend/package.json` has a placeholder test script and no `start` script.
10. **Static page references:** `carbon.css`, social login buttons, forgot-password links, the pricing route, and the Service button are not fully implemented.

## Development Notes

- Keep frontend API URLs configurable when deploying anywhere other than local port 5000.
- Keep `backend/uploads/` out of source control if uploaded media is not meant to be part of the project history.
- Use the existing page styles in `HTML/` unless the project is deliberately reorganized.
- Preserve the current `regestrion.html` spelling until all navigation links are updated together.
- After backend changes, manually test registration, login, leaderboard retrieval, SMS configuration, ticket email, and upload processing against a local MongoDB instance.


## Deployment

The frontend is deployed through Vercel.
