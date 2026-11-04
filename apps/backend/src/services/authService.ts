import { createUser, getUserByEmail } from "../repositories/userRepository.js";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";
import { hashPassword, verifyPassword } from "../utils/bcrypt.js";
import { createShelter, getShelterByEmail } from "../repositories/shelterRepository.js";
import { generateToken } from "../utils/jwt.js";
import type {
  Account,
  AuthResult,
  LoginInput,
  RegisterShelterInput,
  RegisterUserInput,
} from "../types.js";

export async function registerUser(
  { password, ...request }: RegisterUserInput,
): Promise<AuthResult> {
  const user = await createUser({
    ...request,
    passwordHash: await hashPassword(password),
  });
  return {
    id: user.id,
    role: "user",
    token: generateToken(user.id, "user"),
  };
}

export async function registerShelter(
  { password, ...request }: RegisterShelterInput,
): Promise<AuthResult> {
  const shelter = await createShelter({
    ...request,
    passwordHash: await hashPassword(password),
  });
  return {
    id: shelter.id,
    role: "shelter",
    token: generateToken(shelter.id, "shelter"),
  };
}

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
