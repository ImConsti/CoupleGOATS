import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayloadInput, JwtPayloadOutput, Role } from "../types.js";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";

export function generateToken(
  userOrShelterId: string,
  role: Role,
): string {
  const payload: JwtPayloadInput = {
    sub: userOrShelterId,
    role: role,
  };

  const options: SignOptions = {
    expiresIn: "20d",
    algorithm: "HS256",
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, options);
}

export function verifyToken(token: string): JwtPayloadOutput {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as JwtPayloadOutput;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError("Token has expired");
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError("Invalid token");
    } else {
      throw new InternalServerError(
        "Unexpected error during token verification",
      );
    }
  }
}
