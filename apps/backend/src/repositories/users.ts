import { db } from "../db/db.js";
import { mapDatabaseError } from "../errors/map-database-error.js";

export async function getUserByEmail(
  email: string,
): Promise<{ id: string; passwordHash: string; isAdmin: boolean } | undefined> {
  try {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
      columns: {
        id: true,
        passwordHash: true,
        isAdmin: true,
      },
    });
    if (!user) {
      return undefined;
    }
    return user;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
