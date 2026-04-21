const Blockly = typeof window !== "undefined" ? window.Blockly : require("blockly/core");

Blockly.Blocks["player_data"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["Name", "NAME"],
                ["Id", "ID"]
            ], value => {
                this.updateOutput(value);
                return value;
            }), "PROPERTY")
            .appendField("of player");

        this.appendValueInput("PLAYER")
            .setCheck("Player")

        this.setColour("#3366CC");
        this.setInputsInline(true);

        this.updateOutput("NAME")
    },

    updateOutput: function (value) {
        if (value === "NAME")
            this.setOutput(true, "String");
        else if (value === "ID")
            this.setOutput(true, "Number");
    }
}

Blockly.Blocks["player_tell"] = {
    init: function () {
        this.appendValueInput("PLAYER")
            .setCheck("Player")
            .appendField("tell player")
        this.appendValueInput("MESSAGE")
            .setCheck(["String", "Number"])
            .appendField("message")

        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#3366CC")
        this.setInputsInline(false);
    }
}

Blockly.Blocks["math_arithmetic"] = {
    init: function () {
        this.appendValueInput("A")
            .setCheck("Number");

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["+", "+"],
                ["-", "-"],
                ["*", "*"],
                ["/", "/"]
            ]), "PROPERTY");

        this.appendValueInput("B")
            .setCheck("Number");

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour("%{BKY_MATH_HUE}");
    }
};

Blockly.Blocks["math_random_int"] = {
    init: function() {
        this.appendValueInput("A")
            .setCheck("Number")
            .appendField("random from");

        this.appendValueInput("B")
            .setCheck("Number")
            .appendField("to");

        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour("%{BKY_MATH_HUE}");
    }
}

Blockly.Blocks["logic_compare"] = {
    init: function () {
        this.appendValueInput("A")
            .setCheck(["String", "Number", "Boolean"]);

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["=", "EQ"],
                ["\u2260", "NEQ"],
                //[">", "GT"],
                //["\u2265", "GTE"],
                //["<", "LT"],
                //["\u2264", "LTE"]
            ]), "OP");

        this.appendValueInput("B")
            .setCheck(["String", "Number", "Boolean"]);

        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour("%{BKY_LOGIC_HUE}");
    }
};

Blockly.Blocks["world_events"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("on world")
            .appendField(new Blockly.FieldDropdown([
                ["Load", "LOAD"],
                //["Stop", "STOP"]
            ]), "ACTION")

        this.setNextStatement(true);
        this.setColour("#FFBF00");

        this.setInputsInline(true);
    }
}

Blockly.Blocks["player_events"] = {
    init: function () {
        this.appendDummyInput()
            .appendField("on player")
            .appendField(new Blockly.FieldDropdown([
                ["Join", "JOIN"],
                //["Death", "DEATH"],
                //["Leave", "LEAVE"]
            ]), "ACTION");

        this.appendValueInput("PLAYER")
            .setCheck("Player");

        this.setNextStatement(true);
        this.setColour("#FFBF00");

        this.setInputsInline(true);

        this.change
    },

    onchange: function () {
        if (!this.workspace) return;

        const input = this.getInput("PLAYER");

        if (input && !input.connection.isConnected()) {
            const playerBlock = this.workspace.newBlock("player_var");
            if (typeof window !== "undefined") {
                playerBlock.initSvg();
                playerBlock.render();
            }

            input.connection.connect(playerBlock.outputConnection);
        }
    }
};

Blockly.Blocks["player_var"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("player")
        this.setOutput(true, "Player");
        this.setColour("#FFBF00");
    }
}

Blockly.Blocks["text"] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput(""), "TEXT")
        this.setOutput(true, "String")
        this.setInputsInline(true);
    }
}

Blockly.Blocks["text_join"] = {
    init: function () {
        this.appendValueInput("ADD0")
            .setCheck(["String", "Number"]);

        this.appendDummyInput()
            .appendField("join")

        this.appendValueInput("ADD1")
            .setCheck(["String", "Number"])

        this.setInputsInline(true);
        this.setOutput(true, "String");
        this.setColour("%{BKY_TEXTS_HUE}");
    }
};

Blockly.Blocks["setblock"] = {
    init: function() {

        this.appendDummyInput()
            .appendField("set block at")

        this.appendValueInput("X")
            .setCheck("String");

        this.appendValueInput("Y")
            .setCheck("String");

        this.appendValueInput("Z")
            .setCheck("String");

        this.appendDummyInput()
            .appendField("to")

        this.appendValueInput("BLOCK")
            .setCheck("String");

        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#4CAF50");

        this.setInputsInline(true);
    }
}