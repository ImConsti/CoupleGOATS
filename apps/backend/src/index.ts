import "dotenv/config";
import express from "express";
import cors from "cors";
import {migrate} from "drizzle-orm/libsql/migrator";
import {drizzle} from "drizzle-orm/libsql";
import {readFileSync} from "node:fs";
import swaggerUi from "swagger-ui-express";
import {parse} from "yaml";
import {routeNotFoundHandler} from "./middleware/routeNotFoundHandler.js";
import {errorHandler} from "./middleware/errorHandler.js";
import { router as authRouter } from "./router/authController.js";

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

const openApiSpec = parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/", (_req, res) => {
    res.send("Hello World!");
});

app.get("/test", (_req, res) => {
    console.log("Test endpoint hit");
    res.json({ok: true});
});
app.use("/api/v1/auth", authRouter);

app.use(routeNotFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
