import bcrypt from "bcrypt";

import { AuthenticationError } from "../errors/errors.js";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<void> {
  const result: boolean = await bcrypt.compare(password, passwordHash);
  if (!result) {
    throw new AuthenticationError("Invalid credentials");
  }
}
