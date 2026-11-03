# Run BinZ locally

From the project root in PowerShell:

```powershell
npm.cmd run start:local
```

Open <http://127.0.0.1:5173/#home>. The backend is at <http://127.0.0.1:5050/health>. Health returns HTTP 200 only when MongoDB is connected; otherwise it returns HTTP 503.

The launcher starts missing processes in hidden windows and reuses listening ports. It does not kill other programs. It checks database readiness before reporting success. Run it again after restarting Windows. These processes are local development servers, not a public deployment or an auto-start Windows service.

## First-time setup on another computer

1. Install Node.js compatible with the project's package requirements and Python 3.
2. Run `npm.cmd ci` in the project root.
3. Run `npm.cmd ci --ignore-scripts` in `backend`. The current server uses `bcryptjs`, so the unused native bcrypt installation script is not needed.
4. From the project root, run `python .\scripts\install-local-mongo.py`. It downloads MongoDB 8.0.23 runtime files over HTTPS from the official MongoDB Windows ZIP. It uses byte ranges to skip debug symbols and retains included licenses; Python verifies ZIP member CRCs. No database service is installed.
5. Run the launcher above.

Alternatively, put an approved MongoDB 8.0 Windows runtime at `.local/mongodb/bin/mongod.exe`, with any required DLLs alongside it. If the official server does not support byte ranges, the installer fails explicitly; use the official ZIP download instead. Runtime version is pinned for reproducibility, not a claim that it is the newest release.

## Private local configuration

On first launch only, the script creates ignored `backend/.env` with a local MongoDB URI, port 5050, development cookie settings, local frontend origins and a randomly generated JWT signing secret. Existing configuration is preserved. Do not copy actual secrets into Markdown, commits, screenshots or messages.

Database files, executables and runtime logs are under ignored `.local/`. Database files persist across process and machine restarts. Do not delete `.local/data` to restart the app. Uploaded files are ignored under `backend/uploads/`. No credentials or existing production database are required for this local setup.

MongoDB binds to `127.0.0.1:27017`. The development API also defaults to `127.0.0.1`. This database has no authentication and must stay local. The frontend chooses the matching localhost/127.0.0.1 API hostname so its HTTP-only session cookie works with either local website URL.

## Scope and service limits

This starts existing API routes and database persistence. It does not connect every frontend demo/preview flow, provide genuine recycler verification, or activate external SMS/email services. Twilio/SMTP configuration still belongs in private backend settings. Do not add fake credentials. Existing cleanup video rewards remain simulated. The starter recycler directory is seeded by the existing backend; seed records are not evidence of current official authorization.

Production hosting requires separate review of API authorization, current dependencies, provider configuration, data handling, real service contracts, cookie/CORS settings and public HTTPS hosting. No deployment was performed by this local setup.

## Verification

With the local services running, use `npm.cmd run check:local`. It checks database readiness, frontend responses, credentialed CORS, anonymous-session rejection, registration with hashed password storage, authenticated sessions and wallet, correct/incorrect login, logout and recycler matching. A unique synthetic account is removed in a `finally` block. It does not send SMS/email or invoke the reward simulator.

Setup reference: [MongoDB 8.0 Windows documentation](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows-unattended/). The local setup uses the official ZIP runtime, not a system-wide MSI/service installation. Package/version metadata was checked using `winget show` against the winget catalogue.
