//import "./gen"


import express from "express";
import path from "path";
import { createServer } from "http";
import register_app from "./app"
import start from "./wss"
import { PORT } from "./config"

import fs from "fs"

fs.mkdirSync(path.join(__dirname, "..", "projects"), { recursive: true })

const app = express();
app.use(express.text({ type: '*/*' }));
app.use(express.static(path.join(__dirname, 'public')));
register_app(app)

app.set('port', PORT)

const server = createServer(app);
start(server)

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});