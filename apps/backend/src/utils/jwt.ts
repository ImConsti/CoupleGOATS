import jwt, { type SignOptions } from "jsonwebtoken";
import { roles } from "../validation/schemas.js";
import { AuthenticationError, InternalServerError } from "../errors/errors.js";

export type JwtPayloadInput = {
  sub: string;
  role: typeof roles[number];
}

type JwtPayloadOutput = JwtPayloadInput & {
  exp: number;
  iat: number;
}

export function generateToken(
  userOrShelterId: string,
  role: (typeof roles)[number],
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
