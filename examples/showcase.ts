import { createExampleApp } from "./app";

const { app } = createExampleApp("en");
app.Listen(1433).then(() => console.log("showcase on http://localhost:1433"));
