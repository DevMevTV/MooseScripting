import { OPCODES } from "./compile";

for (let key in OPCODES) {
    if (!isNaN(Number(key))) continue;
    console.log(`execute if data storage legitermoose:code code{op:${OPCODES[key]}} run return run function legitermoose:code/instructions/${key.toLowerCase()}`)
}

process.exit(0);