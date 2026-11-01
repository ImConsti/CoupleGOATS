import { db } from "../db/db.js";
import { mapDatabaseError } from "../errors/map-database-error.js";
import type { InferSelectModel } from "drizzle-orm";
import { tags } from "../db/schema.js"

export type Tag = Omit<InferSelectModel<typeof tags>, "createdAt" | "updatedAt">

export async function findAllTags(): Promise<Tag[]>{
  try {
    return await db.query.tags.findMany({
      columns: {
        id: true,
        name: true,
        category: true,
        affectsMatching: true,
        isCritical: true,
      },
    })
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}

export async function findTagsByIds(ids: string[]): Promise<Tag[]> {
  try {
    if (ids.length === 0) return [];
    return await db.query.tags.findMany({
      where: (tag, { inArray }) => inArray(tag.id, ids),
      columns: {
        id: true,
        name: true,
        category: true,
        affectsMatching: true,
        isCritical: true,
      },
    });
  } catch (error: unknown) {
    throw mapDatabaseError(error);
  }
}