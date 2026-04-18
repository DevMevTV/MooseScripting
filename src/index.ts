//import "./gen"


import express from "express";
import path from "path";
import { createServer } from "http";
import register_app from "./app"
import start from "./wss"

const app = express();
app.use(express.text({ type: '*/*' }));
app.use(express.static(path.join(__dirname, 'public')));
register_app(app)

const port = 3000
app.set('port', port)

const server = createServer(app);
start(server)

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});