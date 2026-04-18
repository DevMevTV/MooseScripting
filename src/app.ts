import express, { Express } from "express";
import path from "path";
import { clients, passwords } from "./wss";
import { readFileSync } from "fs"
import compile from "./compile"

export default function app(app: Express) {

    app.get('/', function(req, res, next) {
        const id = req.query.id;

        if (!id) {
            return res.status(400).send("No.");
        }

        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    app.post("/world/code", (req, res, next) => {
        const body = JSON.parse(req.body)
        const id = parseInt(body.data.world_id)
        if (!id) return res.status(400).send("Missing id");

        if (!passwords[id]) passwords[id] = crypto.randomUUID()

        res.send({
            url: "https://14bc-94-31-68-33.ngrok-free.app/?id=" + id + "&password=" + passwords[id],
            player_id: body.data.player_id
        })
    })

        .post("/world/reload", (req, res) => {
            const body = JSON.parse(req.body)

            const id = parseInt(body.data.world_id)
            if (!id) return res.status(400).send("Missing id");
            if (isNaN(id)) return res.status(400).send("Invalid id")

            let ws = clients[body.data.world_id]
            if (ws != null) {
              ws.send(JSON.stringify({
                type: "save"
              }))
            }

            const bytecode = compile(get_project(id));

            //console.log(JSON.stringify(byteCode))

            res.send({
                bytecode: bytecode,
                world_id: id
            })
        })
}

const get_project = (world_id: number) => {
    const filePath = path.join(__dirname, "..", "projects", `${world_id}.json`);
    return JSON.parse(readFileSync(filePath, "utf8"));
}