# How to install MySQL and migrate your data

Follow this once. After it's done you can forget about it.

## 1. Install MySQL 8 on Windows

1. Download the **MySQL Installer for Windows**: <https://dev.mysql.com/downloads/installer/>
   - Pick the smaller "web installer" (`mysql-installer-web-community-*.msi`).
2. Run it. When it asks **Setup Type**, choose **"Server only"** (you don't need Workbench unless you want a GUI).
3. **Configuration page**:
   - Config Type: **Development Computer**
   - Connectivity: **TCP/IP**, port **3306** (the default)
   - Authentication: **"Use Strong Password Encryption"** (the default in MySQL 8.4+)
   - Set a **root password** — write it down somewhere safe.
   - Windows Service: **Start at System Startup** — yes.
4. Finish the wizard. MySQL is now running as a Windows service called `MySQL84` (or similar).

## 2. Create the database and a non-root user

Open PowerShell and run:

```bash
mysql -u root -p
```

(enter the root password). Then in the MySQL prompt paste:

```sql
CREATE DATABASE baraka CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'baraka_app'@'localhost' IDENTIFIED BY 'PUT_A_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON baraka.* TO 'baraka_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Replace `PUT_A_STRONG_PASSWORD_HERE` with a real strong password and **write it down**.

**Why `baraka_app` instead of `root`?** Defense in depth — if anyone ever steals your `.env`, they only get access to the `baraka` DB, not your whole MySQL server.

## 3. Point Baraka at it

Open `.env` and update `DATABASE_URL`:

```
DATABASE_URL=mysql://baraka_app:PUT_A_STRONG_PASSWORD_HERE@localhost:3306/baraka
```

## 4. Create the tables

```bash
pnpm db:push
```

Drizzle will print the SQL it's about to run; type **y** to confirm. Tables created.

## 5. (Optional) Migrate your old PostgreSQL data

If you already had data in your old Postgres database that you want to keep:

1. Make sure `OLD_DATABASE_URL` in `.env` points to your old Postgres database (it should already, from earlier setup).
2. Make sure your Postgres server is reachable.
3. Run:

   ```bash
   pnpm --filter @workspace/backend run db:migrate-from-postgres
   ```

4. The script copies every row from each table. It refuses to run if MySQL already has data, so you can't double-import.
5. When you're sure everything is good, **delete `OLD_DATABASE_URL`** from `.env`.

## 6. Smoke test

```bash
pnpm dev
```

Open <http://localhost:5173>, sign up, log in. If both work, you're done.

## 7. Promote yourself to admin (if needed)

```bash
mysql -u baraka_app -p baraka -e "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"
```
