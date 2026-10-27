import { type loginSchema, roles } from "../validation/schemas.js";
import { z } from "zod";
import { getUserByEmail } from "../repositories/userRepository.js";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";
import { verifyPassword } from "../utils/bcrypt.js";
import { getShelterByEmail } from "../repositories/shelterRepository.js";
import { generateToken } from "../utils/jwt.js";

type AuthResult = {
  id: string;
  role: (typeof roles)[number];
  token: string;
};

type Account = {
  id: string;
  passwordHash: string;
  role: (typeof roles)[number];
};

type LoginInput = z.infer<typeof loginSchema>

export async function login(
  request: LoginInput,
): Promise<AuthResult> {
  const account = await getAccount(request.email, request.role);
  await verifyPassword(request.password, account.passwordHash);
  return {
    id: account.id,
    role: account.role,
    token: generateToken(account.id, account.role),
  };
}

async function getAccount(email: string, role: LoginInput["role"]): Promise<Account> {
  switch (role) {
    case "user": {
      const user = await getUserByEmail(email);
      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }
      return {
        id: user.id,
        passwordHash: user.passwordHash,
        role: user.isAdmin ? "admin" : "user",
      };
    }
    case "shelter": {
      const shelter = await getShelterByEmail(email);
      if (!shelter) {
        throw new AuthenticationError("Invalid credentials");
      }
      return {
        id: shelter.id,
        passwordHash: shelter.passwordHash,
        role: "shelter",
      };
    }
    default: {
      throw new InternalServerError("An internal server error occurred");
    }
  }
}
