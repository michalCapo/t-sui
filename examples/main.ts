import { createExampleApp } from "./app";

const { app } = createExampleApp("en");

app.Listen(1423)
    .then(() => console.log("t-sui running on http://localhost:1423"))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
