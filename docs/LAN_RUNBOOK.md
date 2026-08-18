# LAN Prototype Runbook

## Prerequisites on the host

- PHP 8.3+
- Composer
- Node.js 22+
- PostgreSQL 16+

## First-time setup

```powershell
Copy-Item .env.example .env
composer install
php artisan key:generate
npm install
```

Create a PostgreSQL database named `talibon_portal`, then set `DB_USERNAME` and `DB_PASSWORD` in `.env`.

```powershell
php artisan migrate:fresh --seed
npm run build
```

## Run on the LAN

Terminal 1:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

For development with Vite hot reload, Terminal 2:

```powershell
npm run dev
```

Find the host IPv4 address with:

```powershell
ipconfig
```

Other devices on the same trusted LAN open:

```text
http://HOST_IPV4:8000
```

If Windows Firewall prompts for PHP/Node access, permit only the appropriate Private network profile for the controlled demo network.

## Demo credentials

Password for all prototype accounts:

`TalibonDemo2026!`

Accounts:

- admin@talibon.demo
- mayor@talibon.demo
- engineering@talibon.demo
- budget@talibon.demo
- hr@talibon.demo
- legislative@talibon.demo
- employee@talibon.demo

These credentials and identities are synthetic prototype data. They must not be reused for production.

## Reset before a demonstration

```powershell
php artisan migrate:fresh --seed
```

Run the full demo path after every reset before presenting.