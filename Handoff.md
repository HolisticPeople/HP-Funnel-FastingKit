# Fasting Kit Funnel

A React + Vite-based marketing funnel designed for the **7-Day Juice Fasting Supplement Kit**.  
The project is edited both locally (via GitHub + Cursor) and remotely (via **Lovable.dev** UI builder) using a **shared two-way synced GitHub repository**.

This README explains how the system works and how to develop safely without breaking Lovable sync.

---

## 🏗️ System Architecture

```mermaid
graph TD

A[Lovable UI Editor] <---> B[GitHub Repo (origin/main)]
B <---> C[Local Dev Environment (Cursor / VS Code)]
C --> D[Vite Dev Server (localhost:8080)]
B --> E[Deployment / Hosting Platform]


Lovable edits the same repo the developer works in.

All code changes sync through GitHub.

Local development uses Vite for fast UI iteration.

Changes must be committed + pushed to sync back to Lovable.

Folder structure

fastingkit/
│
├─ public/                # Static assets
├─ src/
│   ├─ components/        # UI components
│   ├─ pages/             # Funnel pages
│   ├─ data/              # Product + pricing data
│   └─ main.jsx           # Application entry point
│
├─ .env.staging           # Staging API + App Origin
├─ .env.production        # Production API + App Origin
│
├─ vite.config.ts         # Vite config + alias setup
├─ tsconfig.app.json      # Alias config for "@/"
│
└─ package.json
Alias configuration:

"paths": {
  "@/*": ["./src/*"]
}

🚀 Local Development
1. Clone Repo
git clone https://github.com/HolisticPeople/fastingkit.git
cd fastingkit

2. Install Dependencies
npm ci

3. Start Dev Server
npm run dev


Access at:

http://localhost:8080

🔄 Syncing Rules (Very Important)
Action	Result
Local commit → push → main	✅ Changes appear in Lovable
Edit inside Lovable → Save	✅ Changes are pushed to GitHub automatically
Local delete of Lovable-generated file	⚠️ May break UI until re-pulled
Force-push / history reset	❌ Will break Lovable sync — avoid
Best Practice:

Always pull before starting work:

git pull origin main

🌍 Environment Variables
File	Purpose
.env.staging	Staging environment
.env.production	Live production

Example:

VITE_WC_API_BASE=https://holisticpeople.com
VITE_APP_ORIGIN=https://fastingkit.holisticpeople.com


Never commit secrets.
These files are Git-tracked intentionally because they are safe public frontend vars.

🧑‍💻 For Future Developers
Task	Command
Update dependencies	npm update
Reinstall clean	rm -rf node_modules && npm ci
Check remotes	git remote -v
Sync from Lovable	git pull origin main

If you see Vite alias errors:

rm -rf node_modules
git restore package-lock.json
npm ci

✅ Status
Component	State
GitHub → Cursor Sync	✅ Working
GitHub → Lovable Sync	✅ Working
Local Dev Vite Runtime	✅ Running at :8080
Alias Resolution @/	✅ Configured

