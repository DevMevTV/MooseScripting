import { writeFile, existsSync, readFileSync } from "fs";
import path from "path";
import { WebSocket, Server } from "ws"
import { Server as HttpServer } from "http"

export const passwords: Record<number, string> = {};
export const clients: Record<number, WebSocket> = {};

export default function start(server: HttpServer) {
    let wss = new Server({ server });

    wss.on("connection", ws => {
        let id: number | null = null;
        let logged = false;

        ws.on("message", (message: string) => {
            let data;
            try { data = JSON.parse(message); } catch { return; }

            if (data.type === "init" && !logged) {
                id = parseInt(data.id);
                if (isNaN(id)) {
                    ws.close(4001, "Invalid ID");
                    return;
                }

                if (data.password !== passwords[id]) {
                    ws.close(4001, "Unauthorized");
                    return;
                }

                logged = true;
                clients[id] = ws;

                let save = null;
                const filePath = path.join(__dirname, "..", "projects", `${id}.json`);
                if (existsSync(filePath))
                    save = JSON.parse(readFileSync(filePath, "utf8"));

                ws.send(JSON.stringify({
                    type: "load",
                    file: save
                }));
            }

            if (!logged) return;

            switch (data.type) {
                case "save":
                    writeFile(path.join(__dirname, "..", "projects", `${id}.json`), JSON.stringify(data.file, null, 2), err => {
                        if (err) console.error(err);
                    });
                    break;
            }
        })

        ws.on("close", () => {
            if (id && clients[id] === ws) {
                delete clients[id];
            }
        })
    })
}