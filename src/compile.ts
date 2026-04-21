import { Workspace, Block, serialization } from "blockly"

import "./public/javascripts/definitions";
const workspace = new Workspace();

export enum OPCODES {
    PUSH_STRING,
    PUSH_PLAYER,

    GET_PLAYER_NAME,
    GET_PLAYER_UUID,

    PRINT,
    TELL_PLAYER,

    SETBLOCK,
    TELEPORT,

    JUMP,
    LOAD_IF_TRUE,

    NOT,
    AND,
    OR,

    ADD,
    SUB,
    MLT,
    DIV,

    EQUAL,
    NOT_EQUAL,
    GREATER,
    LESS,
    GREATER_EQUAL,
    LESS_EQUAL,

    TEXT_JOIN,
    RANDOM_NUMBER
}

let extra_blocks: any[][] = []

const generate = (block: Block | null): any[] => {
    if (block == null) return [];

    switch (block.type) {
        case "player_tell":
            return [
                ...generate(block.getInputTargetBlock("PLAYER")),
                ...generate(block.getInputTargetBlock("MESSAGE")),
                [OPCODES.TELL_PLAYER]
            ]
        case "text":
            return [
                [OPCODES.PUSH_STRING, block.getFieldValue("TEXT")],
            ]
        case "math_number":
            return [
                [OPCODES.PUSH_STRING, block.getFieldValue("NUM").toString()],
            ]
        case "math_random_int":
            return [
                ...generate(block.getInputTargetBlock("A")),
                ...generate(block.getInputTargetBlock("B")),
                [OPCODES.RANDOM_NUMBER]
            ]
        case "logic_negate":
            return [
                ...generate(block.getInputTargetBlock("BOOL")),
                [OPCODES.NOT]
            ]
        case "logic_operation":
            const property = block?.getFieldValue("OP");
            let op;
            if (property == "AND") op = OPCODES.AND
            else if (property == "OR") op = OPCODES.OR


            return [
                ...generate(block.getInputTargetBlock("A")),
                ...generate(block.getInputTargetBlock("B")),
                [op]
            ]
        case "player_var":
            return [
                [OPCODES.PUSH_PLAYER],
            ]
        case "text_join":
            return [
                ...generate(block.getInputTargetBlock("ADD0")),
                ...generate(block.getInputTargetBlock("ADD1")),
                [OPCODES.TEXT_JOIN]
            ]
        case "player_data":{
            const property = block?.getFieldValue("PROPERTY");
            let opcode;

            if (property === "NAME") opcode = OPCODES.GET_PLAYER_NAME;
            else if (property === "UUID") opcode = OPCODES.GET_PLAYER_UUID;

            return [
                ...generate(block.getInputTargetBlock("PLAYER")),
                [opcode]
            ]
        }
        case "logic_compare": {
            const property = block?.getFieldValue("OP");
            let op;
            if (property == "EQ") op = OPCODES.EQUAL
            else if (property == "NEQ") op = OPCODES.NOT_EQUAL
            else if (property == "GT") op = OPCODES.GREATER
            else if (property == "GTE") op = OPCODES.GREATER_EQUAL
            else if (property == "LT") op = OPCODES.LESS
            else if (property == "LTE") op = OPCODES.LESS_EQUAL

            return [
                ...generate(block.getInputTargetBlock("A")) || [0],
                ...generate(block.getInputTargetBlock("B")) || [0],
                [op]
            ]
        }
        case "text_print":
            return [
                ...generate(block.getInputTargetBlock("TEXT")),
                [OPCODES.PRINT]
            ]
        case "controls_if":
            extra_blocks.push(generateChain(block.getInputTargetBlock("DO0")))

            return [
                ...generate(block.getInputTargetBlock("IF0")),
                [OPCODES.LOAD_IF_TRUE, extra_blocks.length - 1]
            ]
        case "math_arithmetic": {
            const property = block?.getFieldValue("PROPERTY");
            let op;
            if (property == "+") op = OPCODES.ADD;
            if (property == "-") op = OPCODES.SUB;
            if (property == "*") op = OPCODES.MLT;
            if (property == "/") op = OPCODES.DIV;
            return [
                ...generate(block.getInputTargetBlock("A")),
                ...generate(block.getInputTargetBlock("B")),
                [op]
            ]
        }
        //case "setblock": {
        //    return [
        //        ...generate(block.getInputTargetBlock("X")),
        //        ...generate(block.getInputTargetBlock("Y")),
        //        ...generate(block.getInputTargetBlock("Z")),
        //        ...generate(block.getInputTargetBlock("BLOCK")),
        //        [OPCODES.SETBLOCK]
        //    ]
        //}
        default:
            console.log(block.type)
            return [];
    }
}

const generateChain = (block: Block | null): any[] => {
    let code = [];

    while (block) {
        code.push(...generate(block));
        block = block.getNextBlock();
    }

    return code;
}

export default function compile(src: JSON) {
    const result: Record<'player_events_join' | 'player_events_death' | 'player_events_leave' | 'world_events_load' | 'world_events_stop' | 'extra_blocks', any[][]> = {
        player_events_join: [],
        player_events_death: [],
        player_events_leave: [],
        world_events_load: [],
        world_events_stop: [],
        extra_blocks: [],
    };

    extra_blocks = []

    workspace.clear();
    serialization.workspaces.load(src, workspace)

    const blocks = workspace.getTopBlocks(true)

    for (const block of blocks) {
        if (block.type !== "player_events" && block.type !== "world_events") continue;

        let key = block.type + "_" + block.getFieldValue("ACTION").toLowerCase();

        const firstStatement = block.getNextBlock();
        const code = generateChain(firstStatement)

        // @ts-ignore
        result[key].push(code)
    }

    result.extra_blocks = extra_blocks

    //console.log(JSON.stringify(result))

    return result
}