// Neon pooled URLs contain "-pooler" in the host; Prisma migrations need the
// direct host. Derive it when Render (or similar) only provides DATABASE_URL.
const { execSync } = require('child_process');

if (!process.env.DIRECT_DATABASE_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL.replace(
    '-pooler.',
    '.',
  );
}

if (!process.env.DIRECT_DATABASE_URL) {
  console.error(
    'Missing DIRECT_DATABASE_URL (and no DATABASE_URL to derive it from).',
  );
  process.exit(1);
}

execSync('prisma migrate deploy', { stdio: 'inherit', env: process.env });
