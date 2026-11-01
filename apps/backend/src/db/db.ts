import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";
import * as relations from "./relations.js";

export type DbOrTrx =
  typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export const db = drizzle({
    connection: {url: process.env.DB_FILE_NAME!},
    schema: {...schema, ...relations}
});

await db.$client.execute('PRAGMA foreign_keys = ON;')