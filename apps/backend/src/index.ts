import "dotenv/config";
import express from "express";
import cors from "cors";
import {migrate} from "drizzle-orm/libsql/migrator";
import {drizzle} from "drizzle-orm/libsql";

async function runMigration() {
    const db = drizzle({
        connection: {
            url: process.env.DB_FILE_NAME!
        }
    });
    try {
        await migrate(db, {migrationsFolder: "./drizzle"});
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        db.$client.close()
    }
}

await runMigration();

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Hello World!");
});

app.get("/test", (_req, res) => {
    console.log("Test endpoint hit");
    res.json({ok: true});
});

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
