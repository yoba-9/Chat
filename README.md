## Chat App

A Next.js 15 chat application with PostgreSQL, Redis, and Docker-based development.

### Stack

- Next.js 15, React 18, TypeScript
- Postgres 15 (via Docker)
- Redis 7 (via Docker)
- NextAuth
- Tailwind CSS
- Prisma (client dependency present; schema optional in this repo)

### Prerequisites

- Docker Desktop 4.22+
- Node.js 22.x and npm 10+ (only if running app locally without Docker)

### Quick Start (Docker)

This spins up Postgres, Redis, PgAdmin, Redis Commander, and the app.

```bash
cd chat
npm run docker:up
```

Then open `http://localhost:3000`.

First-time vs subsequent runs:

- If images don't exist yet, `docker compose up` will automatically build them the first time.
- If you change `docker/Dockerfile.dev`, `package.json`, or add Prisma schema, run a rebuild:
  ```bash
  npm run docker:rebuild
  ```

Services started:

- App: `http://localhost:3000`
- PgAdmin: `http://localhost:5050` (email: `admin@chat.com`, password: `adminpassword`)
- Redis Commander: `http://localhost:8081`

Useful Docker commands:

```bash
# Rebuild everything from scratch
npm run docker:rebuild

# Tail app logs
npm run docker:logs

# Stop and remove containers
npm run docker:down

# Full cleanup (containers + volumes + dangling images)
npm run docker:clean
```

### Environment Variables

The Docker setup provides sane defaults via `docker-compose.yml`:

- `DATABASE_URL="postgresql://chatuser:chatpassword@postgres:5432/chatapp?schema=public"`
- `REDIS_URL="redis://localhost:6379"`
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXTAUTH_SECRET="devs-secret-key-change-in-production"`
- `NODE_ENV="development"`

For local (non-Docker) development, create `.env.local` in `chat/`:

```
DATABASE_URL=postgresql://chatuser:chatpassword@localhost:5432/chatapp
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-me
```

### Database and Prisma

This project includes `@prisma/client` and `prisma` deps. If you add a Prisma schema at `prisma/schema.prisma`, you can manage migrations:

```bash
# Inside Docker container
npm run db:generate     # npx prisma generate
npm run db:migrate      # npx prisma migrate dev
npm run db:seed         # npx prisma db seed
npm run db:studio       # npx prisma studio
npm run db:reset        # npx prisma migrate reset
```

Notes:

- The dev Dockerfile is resilient: it skips `prisma generate` if no schema file is present.
- If you introduce a schema, rebuild the app image: `npm run docker:rebuild`.

### Running Locally Without Docker (App only)

If you prefer running the app on your host and use Docker only for Postgres/Redis:

```bash
cd chat
# Start only infra in Docker
docker compose up -d postgres redis

# Install deps and run the app locally
npm ci
npm run dev
```

Ensure `.env.local` is configured (see above).

### Project Scripts

Available in `package.json`:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "db:migrate": "docker compose exec app npx prisma migrate dev",
    "docker:logs": "docker-compose logs -f app",
    "docker:clean": "docker-compose down -v && docker system prune -f",
    "docker:rebuild": "docker-compose down && docker-compose build --no-cache && docker-compose up -d",

    "db:generate": "docker compose exec app npx prisma generate",
    "db:seed": "docker compose exec app npx prisma db seed",
    "db:studio": "docker compose exec app npx prisma studio",
    "db:reset": "docker compose exec app npx prisma migrate reset"

},
```

### Troubleshooting

- EACCES writing to `.next` in Docker dev
  - The compose file runs the app as root in dev and mounts `/app/.next` to avoid permission errors. If you still see EACCES:
    - Ensure `.next` exists and is writable: `docker-compose exec app sh -lc 'mkdir -p /app/.next && chmod -R 777 /app/.next'`
    - Or remove the bind mount for `/app/.next` in `docker-compose.yml` and rebuild.

- Invalid mount path: `app/node_modules`
  - Ensure the volumes use absolute in-container paths: `- /app/node_modules` and `- /app/.next`.

- Port already in use (3000/5432/6379/5050/8081)
  - Stop conflicting services or change the host ports in `docker-compose.yml`.

- Prisma errors during build
  - If you don't have a `prisma/schema.prisma`, the build will skip generation. If you add a schema later, run `npm run docker:rebuild`.

### Stopping and Cleaning Up

```bash
# Stop all containers
npm run docker:down

# Remove containers and volumes
npm run docker:clean
```

### Directory Overview

- `docker/Dockerfile.dev`: Dev Dockerfile (skips Prisma generate when schema missing)
- `docker-compose.yml`: Multi-service Docker setup
- `src/`: App source code
- `public/`: Static assets
- `components.json`, `tailwind.config.ts`, `postcss.config.mjs`: UI config

### Notes

- On Windows, prefer using the project within a short path (e.g., `D:\Projects\chat`) to avoid long path issues.
- Docker Desktop may warn that `version` in compose is obsolete; our compose omits it intentionally.
