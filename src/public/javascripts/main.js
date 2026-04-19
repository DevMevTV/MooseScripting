const toolbox = {
    kind: "categoryToolbox",
    contents: [
        {
            kind: "category",
            name: "Logic",
            colour: "%{BKY_LOGIC_HUE}",
            contents: [
                { kind: "block", type: "controls_if" },
                {
                    kind: "block",
                    type: "logic_compare",
                    inputs: {
                        A: {
                            shadow: {
                                type: "text"
                            }
                        },
                        B: {
                            shadow: {
                                type: "text"
                            }
                        }
                    }
                },
                { kind: "block", type: "logic_operation" },
                { kind: "block", type: "logic_negate" }
            ]
        },
        //{
        //    kind: "category",
        //    name: "Loops",
        //    colour: "%{BKY_LOOPS_HUE}",
        //    contents: [
        //        { kind: "block", type: "controls_whileUntil" }
        //    ]
        //},
        {
            kind: "category",
            name: "Numbers",
            colour: "%{BKY_MATH_HUE}",
            contents: [
                {
                    kind: "block",
                    type: "math_arithmetic",
                    inputs: {
                        A: {
                            shadow: {
                                type: "text"
                            }
                        },
                        B: {
                            shadow: {
                                type: "text"
                            }
                        }
                    }
                }
            ]
        },
        {
            kind: "category",
            name: "Text",
            colour: "%{BKY_TEXTS_HUE}",
            contents: [
                {
                    kind: "block",
                    type: "text_join",
                    inputs: {
                        ADD0: {
                            shadow: {
                                type: "text"
                            }
                        },
                        ADD1: {
                            shadow: {
                                type: "text"
                            }
                        }
                    }
                },
                {
                    kind: "block",
                    type: "text_print",
                    inputs: {
                        TEXT: {
                            shadow: {
                                type: "text"
                            }
                        }
                    }
                }
            ]
        },
        {
            kind: "category",
            name: "Events",
            colour: "#FFBF00",
            contents: [
                {
                    kind: "block",
                    type: "player_events"
                },
                {
                    kind: "block",
                    type: "world_events"
                }
            ]
        },
        //{
            //kind: "category",
            //name: "World",
            //colour: "#4CAF50",
            //contents: [
                //{
                //    kind: "block",
                //    type: "setblock",
                //    inputs: {
                //        X: {
                //            shadow: {
                //                type: "text",
                //            }
                //        },
                //        Y: {
                //            shadow: {
                //                type: "text",
                //            }
                //        },
                //        Z: {
                //            shadow: {
                //                type: "text",
                //            }
                //        },
                //        BLOCK: {
                //            shadow: {
                //                type: "text",
                //            }
                //        }
                //    }
                //}
            //]
        //},
        {
            kind: "category",
            name: "Player",
            colour: "#3366CC",
            contents: [
                {
                    kind: "block",
                    type: "player_data"
                },
                {
                    kind: "block",
                    type: "player_tell",
                    inputs: {
                        MESSAGE: {
                            shadow: {
                                type: "text",
                                fields: { TEXT: "" }
                            }
                        }
                    }
                }
            ]
        },
        //{
        //    kind: "category",
        //    name: "Variables",
        //    colour: "#A55B80",
        //    custom: "VARIABLE"
        //}
    ]
}

const workspace = Blockly.inject("blocklyDiv", {
    toolbox: toolbox,
    renderer: "zelos",
    move: {
        scrollbars: {
            horizontal: true,
            vertical: true
        },
        drag: true,
        wheel: true
    },
    grid: {
        spacing: 25,
        length: 3,
        colour: "#ccc",
        snap: true
    },
    zoom: {
        controls: true,
        wheel: true,
        startScale: 0.8
    }
});

document.getElementById("main").style.display = "none"

let ws = null
let logged = false;

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const password = urlParams.get("password");

function connectWS(password) {
    ws = new WebSocket(`wss://${window.location.hostname}`);

    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: "init",
            id: new URLSearchParams(window.location.search).get("id"),
            password: password
        }))
    }

    ws.onclose = () => {
        if (!logged) return;
        console.log("Ws closed, retrying in 2s...")
        setTimeout(connectWS, 2000)
    }

    ws.onmessage = event => {
        let data = JSON.parse(event.data);

        if (!logged && data.type === "load") {
            logged = true;
            workspace.clear()
            if (data.file != null)
                Blockly.serialization.workspaces.load(data.file, workspace)
            document.getElementById("main").style.display = "block"
            document.getElementById("login").style.display = "none"
        }
    }
}

let last_saved = ""

const save = () => {
    if (!logged) return;
    const json = Blockly.serialization.workspaces.save(workspace)
    const str = JSON.stringify({
        type: "save",
        file: json
    })
    if (last_saved === str) return;
    last_saved = str;
    ws.send(str)
}

setInterval(save, 2000)

connectWS(password)

window.addEventListener("beforeunload", () => {
    save()
})