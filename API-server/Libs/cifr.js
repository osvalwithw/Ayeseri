// auth.js
import bcrypt from 'bcrypt';

const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const pepper = process.env.PEPPER || '';

export async function hashPassword(plain) {
  return bcrypt.hash(plain + pepper, rounds);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain + pepper, hash);
}
