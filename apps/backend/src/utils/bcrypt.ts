import bcrypt from "bcrypt";

import { AuthenticationError } from "../errors/errors.js";

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<void> {
  const result: boolean = await bcrypt.compare(password, passwordHash);
  if (!result) {
    throw new AuthenticationError("Invalid credentials");
  }
}
