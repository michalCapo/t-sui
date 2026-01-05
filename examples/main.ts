// Example App - Main Server Entry Point
// Uses the shared app definition from app.ts

import { createExampleApp } from "./app";

const { app } = createExampleApp("en");

app.Debug(true);
app.AutoReload(true);
app.Listen(1423)
    .then((server) => console.log(`Example app running on http://localhost:${server.port}`))
    .catch(console.error);
