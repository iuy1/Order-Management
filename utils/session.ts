// utils/session.ts
import { createClient } from '$redis';
import {
  createUser,
  User,
  UserRole,
  verifyUserPassword,
} from './db.ts';
import { deleteCookie, getCookies, setCookie } from '@std/http/cookie';
import * as uuid from '@std/uuid';

// Redis client configuration
export const redis = createClient({
  url: Deno.env.get('REDIS_URL') || 'redis://localhost:6379',
});

// Connect to Redis
await redis.connect();

// Session configuration
const SESSION_TTL = 60 * 60; // 1 hours in seconds
export const SESSION_COOKIE = 'auth_token';

// Create a session in Redis and set a cookie
export async function createSession(
  data: User,
  response: Response,
): Promise<string> {
  const token = crypto.randomUUID();

  await redis.setEx(
    `session:${token}`,
    SESSION_TTL,
    JSON.stringify(data),
  );

  setCookie(response.headers, {
    name: SESSION_COOKIE,
    value: token,
    maxAge: SESSION_TTL,
    httpOnly: true,
    secure: true,
    path: '/',
  });

  return token;
}

// Get session data from Redis using the token
export async function getSession(token: string): Promise<User | null> {
  if (!uuid.validate(token)) { return null; }
  const sessionData = await redis.get(`session:${token}`);
  if (!sessionData) { return null; }
  return JSON.parse(sessionData) as User;
}

// Delete a session from Redis and clear the cookie
export async function deleteSession(
  token: string,
  response: Response,
): Promise<void> {
  await redis.del(`session:${token}`);

  deleteCookie(response.headers, SESSION_COOKIE, { path: '/' });
}

export async function register(
  response: Response,
  username: string,
  password: string,
  role_: string,
) {
  const role = Object.values(UserRole).find((v) => v === role_) as
    | UserRole
    | null;
  if (!role) {
    return;
  }
  const user = await createUser(username, password, role);
  await createSession(user, response);
  return user;
}

// Login handler
export async function login(
  response: Response,
  username: string,
  password: string,
): Promise<User | null> {
  const user = await verifyUserPassword(username, password);
  if (!user) { return null; }

  await createSession(user, response);
  return user;
}
