import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { getRedisClient } from "../config/redis.js";

const USER_KEY = (id) => `user:${id}`;
const EMAIL_INDEX_KEY = (email) => `user:email:${email.toLowerCase()}`;
const RESET_TOKEN_KEY = (token) => `reset:${token}`;

export async function createUser({ name, email, password, role = "engineer" }) {
  const redis = await getRedisClient();
  const existingId = await redis.get(EMAIL_INDEX_KEY(email));
  if (existingId) {
    const err = new Error("An account with this email already exists.");
    err.status = 409;
    throw err;
  }

  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    createdAt: new Date().toISOString(),
  };

  await redis.hset(USER_KEY(id), user);
  await redis.set(EMAIL_INDEX_KEY(email), id);
  return sanitize(user);
}

export async function findUserByEmail(email) {
  const redis = await getRedisClient();
  const id = await redis.get(EMAIL_INDEX_KEY(email));
  if (!id) return null;
  const user = await redis.hgetall(USER_KEY(id));
  if (!user || !user.id) return null;
  return user;
}

export async function findUserById(id) {
  const redis = await getRedisClient();
  const user = await redis.hgetall(USER_KEY(id));
  if (!user || !user.id) return null;
  return user;
}

export async function updateUserPassword(id, newPassword) {
  const redis = await getRedisClient();
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await redis.hset(USER_KEY(id), { password: hashedPassword });
}

export async function createPasswordResetToken(email) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const redis = await getRedisClient();
  const token = uuidv4();
  const minutes = Number(process.env.RESET_TOKEN_EXPIRES_IN_MIN || 30);

  if (redis.setex) {
    await redis.setex(RESET_TOKEN_KEY(token), minutes * 60, user.id);
  } else {
    await redis.set(RESET_TOKEN_KEY(token), user.id);
  }

  return { token, user };
}

export async function consumePasswordResetToken(token) {
  const redis = await getRedisClient();
  const userId = await redis.get(RESET_TOKEN_KEY(token));
  if (!userId) return null;
  await redis.del(RESET_TOKEN_KEY(token));
  return userId;
}

export function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}
