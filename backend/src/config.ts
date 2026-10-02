import dotenv from 'dotenv';
dotenv.config();

/** Temporary in-memory secret for local dev when JWT_SECRET is unset. Never persisted. */
function randomDevSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 48; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const jwtSecretFromEnv = (process.env.JWT_SECRET || '').trim();
if (!jwtSecretFromEnv) {
  console.warn('⚠️  JWT_SECRET not set — using a temporary in-memory secret for this session.');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: (process.env.MONGODB_URI || '').trim(),
  jwtSecret: jwtSecretFromEnv || randomDevSecret(),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@sugarspice.pk',
  // No hardcoded default: ADMIN_PASSWORD comes only from the environment.
  // The seed script generates a random password if this is empty.
  adminPassword: (process.env.ADMIN_PASSWORD || '').trim(),
};
