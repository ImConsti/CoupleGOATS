import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import { DatabaseError } from "../errors/errors.js";

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

export async function createUser(
  user: typeof users.$inferInsert,
): Promise<{ id: string }> {
  try {
    const [created] = await db
      .insert(users)
      .values(user)
      .returning({ id: users.id });
    if (!created) {
      throw new DatabaseError("failed to create user");
    }
    return created;
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}
