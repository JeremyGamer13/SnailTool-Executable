class Converter {
    static GetProperty = (name, properties) => {
        let a = null
        properties.forEach(property => {
            if (property.key == name) a = property
        })
        return a
    }
    static HasProperty = (name, properties) => {
        let a = false
        properties.forEach(property => {
            if (property.key == name) a = true
        })
        return a
    }
    static HasPropertyEqualTo = (name, value, properties) => {
        let a = false
        properties.forEach(property => {
            if (property.key == name && property.value == value) a = true
        })
        return a
    }
    static AllSnailaxObjects = [
        "obj_wall",
        "obj_wallB",
        "obj_spike_permanent",
        "obj_playerspawn",
        "obj_conveyor_belt",
        "obj_bomb_spawner",
        "obj_sh_gun",
        "obj_sh_gun2",
        "obj_sh_gun3",
        "obj_destructable_wall",
        "obj_explosive_wall",
        "obj_gun",
        "obj_enemy",
        "obj_bubble",
        "obj_difficulty_shower",
        "obj_drone_spawner",
        "obj_sh_enemy_spawnpoint_normy",
        "obj_exploration_point",
        "obj_wall_walkthrough",
        "obj_protector",
        "obj_uplifter",
        "obj_speedbooster",
        "obj_ice_spike",
        "obj_evil_snail",
        "obj_squasher",
        "obj_underwater_current",
        "obj_fish",
        "obj_jellyfish",
        "obj_drone_piranha_spawner",
        "obj_wall_brain",
        "obj_power_generator",
        "obj_antenna",
        "obj_antenna_big_range",
        "obj_antenna_floaty",
        "obj_door"
    ]
    static SnailaxLevelEditorEquivalents = {
        "obj_wall": "wall",
        "obj_wallB": "wall_gl",
        "obj_spike_permanent": "spike",
        "obj_playerspawn": "player",
        "obj_conveyor_belt": null,
        "obj_bomb_spawner": null,
        "obj_sh_gun": null,
        "obj_sh_gun2": null,
        "obj_sh_gun3": null,
        "obj_destructable_wall": null,
        "obj_explosive_wall": null,
        "obj_gun": null,
        "obj_enemy": null,
        "obj_bubble": null,
        "obj_difficulty_shower": null,
        "obj_drone_spawner": null,
        "obj_sh_enemy_spawnpoint_normy": null,
        "obj_exploration_point": null,
        "obj_wall_walkthrough": null,
        "obj_protector": null,
        "obj_uplifter": null,
        "obj_speedbooster": null,
        "obj_ice_spike": "spike_thn",
        "obj_evil_snail": null,
        "obj_squasher": null,
        "obj_underwater_current": null,
        "obj_fish": null,
        "obj_jellyfish": null,
        "obj_drone_piranha_spawner": null,
        "obj_wall_brain": null,
        "obj_power_generator": "battery",
        "obj_antenna": "antenna",
        "obj_antenna_big_range": "rantenna",
        "obj_antenna_floaty": "fantenna",
        "obj_door": "door",
    }
    static LevelEditorSnailaxEquivalents = {
        player: "obj_playerspawn",
        wall: "obj_wall",
        wall_gl: "obj_wallB",
        spike: "obj_spike_permanent",
        spike_thn: "obj_ice_spike",
        door: "obj_door",
        antenna: "obj_antenna",
        rantenna: "obj_antenna_big_range",
        fantenna: "obj_antenna_floaty",
        battery: "obj_power_generator",
        trigg_ai: null,
        property_picker_tool: null,
        wire_tool: null,
        delete_tool: null,
    }
    static LevelJSONFormat = {
        version: "1.5", // game version will always be latest level editor version no matter the snail or the ax
        snailaxVersion: "5", // snailax version for reasons
        objects: {
            player: [
                // {
                //     position: { x: 0, y: 0 },
                //     direction: 0,
                //     scale: { x: 0, y: 0 },
                //     properties: [
                //         { key: key, value: value }
                //     ]
                // }
            ],
            wall: [],
            wall_gl: [],
            spike: [],
            spike_thn: [],
            door: [],
            antenna: [],
            rantenna: [],
            fantenna: [],
            battery: [],
            trigg_ai: [],
            property_picker_tool: [],
            wire_tool: [],
            delete_tool: []
        },
        quickSlots: [ // player pallete in snailax but that isnt saved per level there
            "player",
            "wall",
            "wall_gl",
            "spike",
            "spike_thn",
            "door",
            "antenna",
            "trigg_ai",
            "wire_tool",
            "delete_tool"
        ],
        toolData: {
            player: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "xsc", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                    { key: "ltyp", value: 0 },
                    { key: "ldrk", value: 0 },
                    { key: "lmsc", value: 1 }
                ]
            },
            wall: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "blsi", value: 3 }
                ]
            },
            wall_gl: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "blsi", value: 3 }
                ]
            },
            spike: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "rot", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            spike_thn: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "rot", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            door: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "rot", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            antenna: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "ysc", value: 1 },
                    { key: "coru", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            rantenna: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "ysc", value: 0 },
                    { key: "coru", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            fantenna: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "ysc", value: 0 },
                    { key: "coru", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            battery: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "ysc", value: 0 },
                    { key: "coru", value: 0 },
                    { key: "xoff", value: 0 },
                    { key: "yoff", value: 0 },
                ]
            },
            trigg_ai: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "onoff", value: 1 },
                    { key: "ahea", value: 50 },
                    { key: "fsp", value: 0.4 },
                    { key: "wsp", value: 0.4 },
                    { key: "csp", value: 0.4 },
                    { key: "asp", value: 0 },
                    { key: "fiw", value: 0 },
                    { key: "lsr", value: 0 },
                    { key: "drp", value: 0 },
                    { key: "jmp", value: 0.3 },
                    { key: "rjmp", value: 0.15 },
                    { key: "stp", value: 0.15 },
                    { key: "st", value: 0.5 },
                    { key: "tur", value: 0.1 },
                    { key: "inview", value: 1 }
                ]
            },
            property_picker_tool: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "hlp", value: 0 },
                ]
            },
            wire_tool: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: [
                    { key: "hlp", value: 0 },
                ]
            },
            delete_tool: {
                direction: 0,
                scale: { x: 1, y: 1 },
                properties: []
            }
        },
        wires: [
            // { object: objectType, id: objectIndex, target: { object: objectType, id: objectIndex } }
        ],
        options: {
            ground_spike_probability: 0,
            wall_spike_probability: 0,
            ceiling_spike_probability: 0,
            air_cat_probability: 0,
            badball_probability: 0,
            ice_spike_falling_probability: 0,
            fireworks_probability: 0,
            conveyor_change_probability: 0,
            laser_probability: 0,
            room_xscale: 0,
            room_yscale: 0,
            song: 0,
            theme: 0,
            squid_disabled: false,
        }
    }
    static SnailaxToJSON = (snailax) => {
        let input = snailax.replace(/\r/gmi, "")
        const output = Converter.LevelJSONFormat
        output.snailaxVersion = String(input).charAt(0)
        if (output.snailaxVersion == "4") {
            input.replace("-", "0,0,|\n-")
        }
        // level parser which puts everything into an object
        let nodes = ["obj_antenna", "obj_antenna_floaty", "obj_antenna_big_range", "obj_power_generator"]
        let rotatable = ["obj_squasher", "obj_underwater_current", "obj_fish", "obj_door"]
        let options = (input.slice(0, input.lastIndexOf('|'))).split("\n")
        options.splice(0, 1) // remove version number
        output.options.ground_spike_probability = Number(options.shift())
        output.options.wall_spike_probability = Number(options.shift())
        output.options.ceiling_spike_probability = Number(options.shift())
        output.options.air_cat_probability = Number(options.shift())
        output.options.badball_probability = Number(options.shift())
        output.options.squid_disabled = (Number(options.shift()) == 1)
        output.options.ice_spike_falling_probability = Number(options.shift())
        output.options.fireworks_probability = Number(options.shift())
        output.options.conveyor_change_probability = Number(options.shift())
        output.options.laser_probability = Number(options.shift())
        output.options.room_xscale = Number(options.shift())
        output.options.room_yscale = Number(options.shift())
        output.options.song = Number(options.shift())
        output.options.theme = Number(options.shift())
        let reading = (input.slice(input.lastIndexOf('-') + 2, input.length)).split("\n")
        // bruh :skull: output.content = reading
        reading.forEach(line => {
            if (line == null || line == "") return
            const subObject = {}
            let editedLine = line
            let lineName = line.slice(0, line.indexOf(':'))
            if (lineName == "") lineName = null
            editedLine = editedLine.slice(editedLine.indexOf(':') + 1, editedLine.length)
            let lineX = Number(editedLine.slice(0, editedLine.indexOf(',')))
            editedLine = editedLine.slice(editedLine.indexOf(',') + 1, editedLine.length)
            let lineY = Number(editedLine.slice(0, editedLine.indexOf(',')))
            editedLine = editedLine.slice(editedLine.indexOf(',') + 1, editedLine.length)
            let rotOrCorrupt = Number(editedLine.slice(0, editedLine.indexOf(',')))
            editedLine = editedLine.slice(editedLine.indexOf(',') + 1, editedLine.length)
            let doorHeightOrNull = Number(editedLine.slice(0, editedLine.indexOf(',')))
            editedLine = editedLine.slice(editedLine.indexOf(',') + 1, editedLine.length)
            let rotation = null
            let doorHeight = null
            let corrupted = null
            if (rotatable.includes(lineName)) {
                rotation = rotOrCorrupt
            }
            if (nodes.includes(lineName)) {
                corrupted = ((rotOrCorrupt == 1) ? "1" : "0")
            }
            if (lineName == "obj_door") {
                doorHeight = doorHeightOrNull
            }
            subObject.position = {}
            subObject.position.x = lineX
            subObject.position.y = lineY
            subObject.direction = rotation
            subObject.properties = []
            if (doorHeight != null) subObject.properties.push({ key: "doorHeight", value: doorHeight })
            if (corrupted != null) subObject.properties.push({ key: "coru", value: corrupted })
            const target = output.objects[Converter.SnailaxLevelEditorEquivalents[lineName] != null ? Converter.SnailaxLevelEditorEquivalents[lineName] : lineName]
            if (!target) {
                output.objects[Converter.SnailaxLevelEditorEquivalents[lineName] != null ? Converter.SnailaxLevelEditorEquivalents[lineName] : lineName] = []
                output.objects[Converter.SnailaxLevelEditorEquivalents[lineName] != null ? Converter.SnailaxLevelEditorEquivalents[lineName] : lineName].push(subObject)
                return
            }
            target.push(subObject)
        })
        return output
    }
    static JSONToSnailax = (json) => {
        const parsingData = json
        // const parsingData = Converter.LevelJSONFormat
        // level parser which puts everything into an object
        let nodes = ["obj_antenna", "obj_antenna_floaty", "obj_antenna_big_range", "obj_power_generator"]
        let rotatable = ["obj_squasher", "obj_underwater_current", "obj_fish", "obj_door"]
        let data = json.snailaxVersion + `\n`
        data += String(parsingData.options.ground_spike_probability) + "\n"
        data += String(parsingData.options.wall_spike_probability) + "\n"
        data += String(parsingData.options.ceiling_spike_probability) + "\n"
        data += String(parsingData.options.air_cat_probability) + "\n"
        data += String(parsingData.options.badball_probability) + "\n"
        data += String((parsingData.options.squid_disabled == true ? 1 : 0)) + "\n"
        data += String(parsingData.options.ice_spike_falling_probability) + "\n"
        data += String(parsingData.options.fireworks_probability) + "\n"
        data += String(parsingData.options.conveyor_change_probability) + "\n"
        data += String(parsingData.options.laser_probability) + "\n"
        data += String(parsingData.options.room_xscale) + "\n"
        data += String(parsingData.options.room_yscale) + "\n"
        data += String(parsingData.options.song) + "\n"
        data += String(parsingData.options.theme) + "\n"
        data += `0,0,|\n-` // idk what gimmicks are in snailax lol
        Object.getOwnPropertyNames(parsingData.objects).forEach(name => {
            const category = parsingData.objects[name]
            // const category = parsingData.objects.player
            category.forEach(item => {
                data += "\n"
                data += (Converter.LevelEditorSnailaxEquivalents[name] != null ? Converter.LevelEditorSnailaxEquivalents[name] : name)
                data += ":"
                data += item.position.x
                data += ","
                data += item.position.y
                data += ","
                if (item.direction != null) {
                    data += item.direction
                    data += ","
                }
                if (Converter.HasProperty("doorHeight", item.properties)) {
                    data += Converter.GetProperty("doorHeight", item.properties)
                    data += ","
                }
                if (Converter.HasProperty("coru", item.properties)) {
                    data += Converter.GetProperty("coru", item.properties)
                    data += ","
                }
            })
        })
        return data
    }
    static LevelEditorToJSON = (leveleditor) => {
        const output = Converter.LevelJSONFormat
        const fileData = []
        const parsingData = String(leveleditor).replace(/\r/gmi, "").split("\n").map(value => {
            return value.includes(":") ? value : value.replace(/ /gmi, "")
        })
        parsingData.push("END:")
        parsingData.forEach(line => {
            if (!(line == "" || line === null || line == "\n")) fileData.push(line)
        })
        output.version = fileData.shift()

        let finishedParsingLevel = false
        let i = 0
        const keywords = [
            "LEVEL DIMENSIONS:",
            "TOOL DATA:",
            "QUICK SLOTS:",
            "PLACED OBJECTS:",
            "WIRES:",
            "END:"
        ]
        while (!finishedParsingLevel) {
            const line = fileData[i]
            if (line == "LEVEL DIMENSIONS:") {

            }
            if (line == "TOOL DATA:") {

            }
            if (line == "QUICK SLOTS:") {

            }
            if (line == "PLACED OBJECTS:") {

            }
            if (line == "WIRES:") {

            }
            if (line == "END:") {
                finishedParsingLevel = true
                continue
            }
            if (line == null || line == "") {
                finishedParsingLevel = true
                continue
            }
            i++
        }

        return output
    }
    static JSONToLevelEditor = (json) => {
        const parsingData = json
        // const parsingData = Converter.LevelJSONFormat
        let data = parsingData.version + "\n\nLEVEL DIMENSIONS:\n"
        data += parsingData.options.room_xscale * 1920
        data += "\n"
        data += parsingData.options.room_yscale * 1080
        data += "\n\nTOOL DATA:\n" + Object.getOwnPropertyNames(parsingData.toolData).length + "\n"
        Object.getOwnPropertyNames(parsingData.toolData).forEach(toolName => {
            const tool = parsingData.toolData[toolName]
            data += toolName + "\n"
            data += tool.direction + "\n"
            data += tool.scale.x + "\n"
            data += tool.scale.y + "\n"
            data += tool.properties.length + "\n"
            tool.properties.forEach(property => {
                data += property.key + "\n"
                data += property.value + "\n"
            })
        })
        data += "\nQUICK SLOTS:\n" + parsingData.quickSlots.join("\n") + "\n\nPLACED OBJECTS:\n" + Object.getOwnPropertyNames(parsingData.objects).length + "\n"
        Object.getOwnPropertyNames(parsingData.objects).forEach(objectName => {
            data += objectName + "\n"
            parsingData.objects[objectName].forEach(objectData => {
                data += parsingData.objects[objectName].length + "\n"
                data += objectData.position.x + "\n"
                data += objectData.position.y + "\n"
                data += objectData.direction + "\n"
                data += objectData.scale.x + "\n"
                data += objectData.scale.y + "\n"
                data += objectData.properties.length + "\n"
                objectData.properties.forEach(property => {
                    data += property.key + "\n"
                    data += property.value + "\n"
                })
            })
        })
        data += "\nWIRES:\n" + parsingData.wires.length + "\n"
        parsingData.wires.forEach(wire => {
            data += wire.object + "\n"
            data += wire.id + "\n"
            data += wire.target.object + "\n"
            data += wire.target.id + "\n"
        })
    }
    static SnailaxToLevelEditor = (snailax) => {
        const converted = Converter.SnailaxToJSON(snailax)
        return Converter.JSONToLevelEditor(converted)
    }
    static LevelEditorToSnailax = (leveleditor) => {
        const converted = Converter.LevelEditorToJSON(leveleditor)
        return Converter.JSONToSnailax(converted)
    }
}

module.exports = Converter