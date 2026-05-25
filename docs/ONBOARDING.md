# Team Onboarding — Get Baraka Running on Your Laptop

Follow these steps **in order**. Estimated time: **30–45 minutes** the first time (mostly waiting for MySQL to install).

If something fails, jump to the **Troubleshooting** section at the bottom before asking for help — most issues are listed there.

---

## What you'll end up with

- The project running locally with:
  - Frontend at <http://localhost:5173>
  - Backend at <http://localhost:8080>
  - A MySQL database on your machine
- The ability to sign up, log in, and use the site.

---

## Step 1 — Install the prerequisites

You need **three** things installed on your laptop. Open PowerShell and check each one.

### 1a. Node.js (version 22 or newer)

```powershell
node --version
```

If it prints something like `v22.x.x` — you're good.
If you get "command not found" or a version below 22, install it from <https://nodejs.org/> (pick the **LTS** version).

### 1b. pnpm (the package manager this project uses)

```powershell
pnpm --version
```

If you get a version number — you're good.
If not, install it:

```powershell
npm install -g pnpm
```

> **Why pnpm and not npm?** The project is a *monorepo* (multiple sub-projects in one folder), and pnpm handles that much better than npm.

### 1c. MySQL 8

```powershell
mysql --version
```

If you get a version number — you're good.
If not, follow the install guide: [`docs/HOW_TO/setup-mysql.md`](./HOW_TO/setup-mysql.md). It walks you through the Windows installer step by step.

> **Mac users**: install with `brew install mysql` then `brew services start mysql`.
> **Linux users**: `sudo apt install mysql-server` then `sudo systemctl start mysql`.

After installing MySQL, **write down the root password** somewhere safe. You'll need it in the next step.

---

## Step 2 — Get the project files

If you don't already have the project folder on your laptop, copy the whole `baraka` folder onto your drive (e.g. `D:\baraka` or `C:\projects\baraka`). Path with spaces in it is fine, but **avoid Arabic characters in the path** — Node sometimes mishandles them.

From now on, every command assumes you are **inside the `baraka` folder**. Open PowerShell there:

- Easiest way: open File Explorer, navigate into the `baraka` folder, then in the address bar type `powershell` and press Enter.
- Or in any PowerShell window: `cd D:\path\to\baraka`

You can confirm you're in the right place:

```powershell
ls package.json
```

If it lists `package.json`, you're in the right folder.

---

## Step 3 — Create the database

This only needs to be done once per laptop.

Open PowerShell **inside the `baraka` folder** and run:

```powershell
mysql -u root -p
```

It will prompt for the MySQL root password. Then in the MySQL prompt that appears, paste these four lines (replace the password!):

```sql
CREATE DATABASE baraka CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'baraka_app'@'localhost' IDENTIFIED BY 'CHOOSE_A_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON baraka.* TO 'baraka_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Important**: replace `CHOOSE_A_STRONG_PASSWORD` with a real password and **write it down**. You'll paste it into the `.env` file in the next step.

---

## Step 4 — Configure environment variables

The project needs two secrets to start: where to find the database, and a random key for signing login cookies. Both live in a file called `.env` at the root of the project.

### 4a. Copy the template

```powershell
copy .env.example .env
```

### 4b. Generate a session secret

Run this command — it prints a random 64-character string:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

### 4c. Edit `.env`

Open `.env` in any text editor (VS Code, Notepad, whatever). Two things to change:

1. **`DATABASE_URL`** — replace `CHANGE_ME` with the password you chose in Step 3:
   ```
   DATABASE_URL=mysql://baraka_app:YourPasswordHere@localhost:3306/baraka
   ```
2. **`SESSION_SECRET`** — paste the random string from step 4b:
   ```
   SESSION_SECRET=paste-the-64-character-string-here
   ```

Save the file. **Do not share or commit `.env`** — it has your secrets.

---

## Step 5 — Install project dependencies

This downloads every library the project needs. Only needed the first time, and again whenever `package.json` changes.

```powershell
pnpm install
```

Takes 1–3 minutes. You'll see lots of output ending with a summary like `Done in 90s`.

---

## Step 6 — Create the database tables

This reads the schema files and creates the tables in your MySQL database.

```powershell
pnpm db:push
```

When it asks "Are you sure?", type **`y`** and press Enter. You should see `[✓] Changes applied`.

---

## Step 7 — Start the dev servers

```powershell
pnpm dev
```

This starts the backend (on port 8080) **and** the frontend (on port 5173) at the same time. You should see logs from both. When you see this line:

```
frontend dev:   ➜  Local:   http://localhost:5173/
```

…you're ready.

Open **<http://localhost:5173>** in your browser. The site should load.

To stop the servers, press **`Ctrl+C`** in the PowerShell window.

---

## Step 8 — Create your first user

1. Click **Sign up** on the website and create an account with your email and a password.
2. To make yourself an **admin** (so you can see the Admin panel), run this in PowerShell:

   ```powershell
   mysql -u baraka_app -p baraka -e "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"
   ```

   Replace `you@example.com` with the email you signed up with. It'll ask for the `baraka_app` password.

3. Refresh the site and log out / log back in. You should now see "Admin" in the menu.

---

## Daily workflow (after the first time)

Once everything is set up, your day-to-day routine is just:

```powershell
cd D:\path\to\baraka
pnpm dev
```

When you pull new changes from your teammates:

```powershell
pnpm install           # if package.json changed
pnpm db:push           # if database schema changed
pnpm dev
```

If unsure, running both `install` and `db:push` is always safe.

---

## Useful commands cheat sheet

| What you want to do | Command |
|---|---|
| Start the whole app for development | `pnpm dev` |
| Install new dependencies | `pnpm install` |
| Apply database schema changes | `pnpm db:push` |
| Check the TypeScript code for errors | `pnpm typecheck` |
| Build the production version | `pnpm build` |
| Reset the database (⚠ deletes all data) | `mysql -u root -p -e "DROP DATABASE baraka; CREATE DATABASE baraka;"` then `pnpm db:push` |

---

## Troubleshooting

### "pnpm: command not found"
You skipped step 1b. Run `npm install -g pnpm`.

### "[ERR_PNPM_NO_PKG_MANIFEST] No package.json found"
You're not inside the `baraka` folder. Run `cd D:\path\to\baraka` first.

### "Access denied for user 'baraka_app'@'localhost'"
The password in your `.env` file doesn't match what you set in Step 3. Open `.env` and fix `DATABASE_URL`.

### "Error: connect ECONNREFUSED 127.0.0.1:3306"
MySQL isn't running. On Windows, open **Services** (`services.msc`), find `MySQL84` (or similar), right-click → Start.

### "SESSION_SECRET must be at least 32 characters"
You forgot to replace the placeholder in `.env`. Re-do step 4b and paste the real generated string.

### "Port 5173 is already in use" (or 8080)
Another instance is already running. Either close it, or find the process: `Get-NetTCPConnection -LocalPort 5173`.

### `pnpm db:push` says "schema files not found"
Make sure you're running from the project root (`baraka` folder), not from inside a sub-folder.

### Sign-up / login error: "scrypt: memory limit exceeded"
You're on an older Node version. Upgrade to Node 22 or newer (step 1a).

### Frontend loads but every API call fails with CORS errors
Your `.env` is missing `CORS_ORIGIN` and your frontend isn't on `localhost:5173`. Add `CORS_ORIGIN=http://localhost:5173` to `.env` and restart the dev server.

### "I broke everything, can I start fresh?"
Yes. From the `baraka` folder:

```powershell
Remove-Item -Recurse -Force node_modules, frontend\node_modules, backend\node_modules, api-contract\node_modules
pnpm install
pnpm db:push
pnpm dev
```

---

## Where to look next

- [`docs/START_HERE.md`](./START_HERE.md) — high-level picture of how the code is organised
- [`docs/CODE_TOUR.md`](./CODE_TOUR.md) — deeper walkthrough with file examples
- [`docs/HOW_TO/`](./HOW_TO/) — short recipes (add a page, add an API endpoint, add a DB column)
- [`docs/SECURITY.md`](./SECURITY.md) — what's been done to keep the site safe

Welcome to the team! 🎉
