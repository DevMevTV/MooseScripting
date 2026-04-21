import { Express } from "express";
import path from "path";
import { clients, passwords } from "./wss";
import { readFileSync } from "fs"
import compile from "./compile"
import { AUTH_TOKEN, URL } from "./config"

const verify = (res: any, body_str: any) => {
    try {
        const body = typeof body_str === "string" ? JSON.parse(body_str) : body_str;
        if (!body || !body.data) {
            res.status(400).send("Invalid JSON format or missing data");
            return null;
        }

        const { auth_token, data } = body;
        if (auth_token !== AUTH_TOKEN) {
            res.status(401).send("Unauthorized");
            return null;
        }

        const id = parseInt(data.world_id)
        if (isNaN(id)) {
            res.status(400).send("Invalid or missing id");
            return null;
        }

        return { data, id };
    } catch (e) {
        res.status(400).send("Invalid JSON format");
        return null
    }
}

export default function app(app: Express) {

    app.get('/', function(req, res, next) {
        const id = req.query.id;
        if (!id) return res.status(400).send("No.");
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    app.post("/world/code", (req, res, next) => {
        const result = verify(res, req.body);
        if (!result) return;

        const { data, id} = result;

        if (!passwords[id]) passwords[id] = crypto.randomUUID()

        res.send({
            url: URL + "/?id=" + id + "&password=" + passwords[id],
            player_id: data.player_id
        })
    })

        .post("/world/reload", (req, res) => {
            const result = verify(res, req.body);
            if (!result) return;

            const { id} = result;

            let ws = clients[id]
            if (ws != null) {
              ws.send(JSON.stringify({
                type: "save"
              }))
            }

            try {
                const project = get_project(id);
                let bytecode
                try {
                    bytecode = compile(project);
                } catch (e) {
                    // @ts-ignore
                    res.status(500).send(e.toString());
                    return;
                }
                res.send({
                    bytecode: bytecode,
                    world_id: id
                });
            } catch (e) {
                res.status(404).send("Project file not found");
            }
        })
}

const get_project = (world_id: number) => {
    const filePath = path.join(__dirname, "..", "projects", `${world_id}.json`);
    return JSON.parse(readFileSync(filePath, "utf8"));
}