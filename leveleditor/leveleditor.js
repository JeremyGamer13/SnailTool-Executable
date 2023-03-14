const fs = require("fs")
const Util = require("../utilities.js")
const Converter = require("../converter.js")

class LevelEditor {
    static CoreToolIds = [
        "default",
        "delete",
        "wire",
        "picker",
        "package",
    ]
    static ImportedTools = {}
    static CreateToolButton(parent, module, callback) {
        const button = Util.CreateElement("button", parent, button => {
            button.classList.add("windowsbutton")
            button.style.setProperty("transition", "none", "important")
            button.style.setProperty("transition-duration", "0s", "important")
            setTimeout(() => {
                button.style.removeProperty("transition")
                button.style.removeProperty("transition-duration")
            }, 500);
            button.onclick = callback
            Util.CreateElement("img", button, img => {
                img.draggable = false
                img.width = 32
                img.height = 32
                img.src = module.Icon
            })
        })
        return button
    }
    static LoadTools(customTools) {
        LevelEditor.CoreToolIds.forEach(tool => {
            const module = require(`./tools/${tool}`)
            LevelEditor.ImportedTools[tool] = module
        })
        if (!customTools) return
        if (customTools.length <= 0) return
    }
    static CreateToolDependencies(key, value) {
        Object.getOwnPropertyNames(LevelEditor.ImportedTools).forEach(toolName => {
            const module = LevelEditor.ImportedTools[toolName]
            if (!module.Dependencies) return
            if (!module.Dependencies.includes(key)) return
            module.LoadedDependencies[key] = value
        })
    }

    static GetTileRotationAnchor(tile) {
        switch (tile) {
            case "antenna":
            case "rantenna":
            case "battery":
            case "spike_thn":
            case "spike":
                return "50% 100%"
            case "door":
                return "0% 0%"
            case "fantenna":
                return "46.55% 47.36%"
            default:
                return "50% 50%"
        }
    }
    static GetTileVisualData(tile) {
        switch (tile) {
            case "player":
                return { scale: { x: 1, y: 1 }, offset: { x: -30, y: -30 } }
            case "fantenna":
                return { scale: { x: 1, y: 1 }, offset: { x: -30, y: -30 } }
            case "antenna":
            case "rantenna":
            case "battery":
                return { scale: { x: 1, y: 2 }, offset: { x: -30, y: -120 } }
            case "spike_thn":
            case "spike":
                return { scale: { x: 1, y: 1 }, offset: { x: -30, y: -60 } }
            default:
                return { scale: { x: 1, y: 1 }, offset: { x: 0, y: 0 } }
        }
    }
    static GetImageOfTile(tile) {
        switch (tile) {
            case "player":
                return "../images/objects/player.png"
            case "wall":
                return "../images/objects/wall.png"
            case "wall_gl":
                return "../images/objects/wall_glow.png"
            case "spike":
                return "../images/objects/spike.png"
            case "spike_thn":
                return "../images/objects/spike_ice.png"
            case "door":
                return "../images/objects/door.png"
            case "antenna":
                return "../images/objects/antenna.png"
            case "rantenna":
                return "../images/objects/antenna_range.png"
            case "fantenna":
                return "../images/objects/antenna_float.png"
            case "battery":
                return "../images/objects/battery.png"
            case "trigg_ai":
                return "../images/objects/trigg_ai.png"
            default:
                return "../images/objects/unknown.png"
        }
    }

    static async Run(targetFile) {
        const ToolList = Util.GetById("Tools_List")
        const TileHolder = Util.GetById("LevelContents")
        let currentTool = null
        Object.getOwnPropertyNames(LevelEditor.ImportedTools).forEach(toolname => {
            LevelEditor.CreateToolButton(ToolList, LevelEditor.ImportedTools[toolname], () => {
                const toolData = {
                    direction: 0,
                    scale: { x: 1, y: 1 },
                    properties: []
                }
                toolData.name = toolname
                currentTool = toolData
                UpdateToolDetails(toolname)
                console.log("switched tool", toolData)
            })
        })
        let editLevelData = Converter.CloneMainJSONFormat()
        // let editLevelData = Converter.LevelJSONFormat
        function CreateObject(toolInheritedData, tile, x, y, tileWidth, tileHeight, rotation, corrupted, addToData, objIndex) {
            const scaleAndOffset = LevelEditor.GetTileVisualData(tile)
            let index = 0
            if (addToData != false) {
                index = editLevelData.objects[tile].length
                let object = {
                    position: { x: x, y: y },
                    direction: rotation,
                    scale: { x: tileWidth, y: tileHeight },
                    properties: currentTool ? currentTool.properties : []
                }
                editLevelData.objects[tile][index] = object
            }
            Util.CreateElement("img", TileHolder, img => {
                Util.Restyle(img, {
                    position: "absolute",
                    left: `${0 + (scaleAndOffset.offset.x * tileWidth)}px`,
                    top: `${0 + (scaleAndOffset.offset.y * tileHeight)}px`,
                    width: Math.abs((tileWidth * scaleAndOffset.scale.x) * 60) + "px",
                    height: Math.abs((tileHeight * scaleAndOffset.scale.y) * 60) + "px",
                })
                if (tile == "trigg_ai") img.style.zIndex = 0
                else img.style.zIndex = 1
                if (corrupted) {
                    img.style.filter = "hue-rotate(138deg)"
                }
                img.style.transform = `translate(${x}px, ${y}px) scale(${tileWidth < 0 ? -1 : 1}, ${tileHeight < 0 ? -1 : 1}) rotate(${0 - rotation}deg)`
                img.style.transformOrigin = LevelEditor.GetTileRotationAnchor(tile)
                img.src = LevelEditor.GetImageOfTile(tile)
                img.draggable = false
                img.onclick = () => {
                    if (!currentTool) return
                    const module = LevelEditor.ImportedTools[currentTool.name]
                    if (module) {
                        if (module.OnTileClick) module.OnTileClick(toolInheritedData, tile, x, y, tileWidth, tileHeight, rotation, corrupted, addToData, objIndex, index, img, editLevelData)
                    }
                    // focusedObject = img
                }
            })
        }
        function LoadLevel(data) {
            editLevelData = data
            TileHolder.innerHTML = ""
            Util.CreateElement("img", TileHolder, img => {
                img.src = "../images/objects/transparent.png"
                img.draggable = false
                Util.Restyle(img, {
                    position: "absolute",
                    left: ((editLevelData.options.room_xscale * 1920) - 64) + "px",
                    top: ((editLevelData.options.room_yscale * 1080) - 64) + "px",
                    width: "64px",
                    height: "64px",
                    zIndex: -10
                })
            })
            Object.getOwnPropertyNames(editLevelData.objects).forEach(objectName => {
                const objectList = editLevelData.objects[objectName]
                let i = 0
                objectList.forEach(object => {
                    const objectnam = (Converter.SnailaxLevelEditorEquivalents[objectName] != null ? Converter.SnailaxLevelEditorEquivalents[objectName] : objectName)
                    //if (objectnam.endsWith("antenna")) console.log(object.properties, Number(Converter.GetProperty("coru", object.properties)) == 1)
                    CreateObject(
                        object,
                        objectnam,
                        object.position.x,
                        object.position.y,
                        object.scale.x,
                        object.scale.y,
                        object.direction,
                        Number(Converter.GetProperty("coru", object.properties)) == 1,
                        false,
                        i
                    )
                    i++
                })
            })
        }
        Util.ExistsInMemory("TargetPath").then(async exists => {
            if (exists) {
                Util.GetFromMemory("TargetPath").then(async path => {
                    Util.GrabFile(path).then(async file => {
                        targetFile = file
                        Util.GetById("EditingLabel").innerText = "Currently editing: " + targetFile.path
                        const levelData = Converter.LevelEditorToJSON(targetFile.content)
                        editLevelData = levelData
                        LoadLevel(levelData)
                    })
                })
            }
        })
        Util.GetById("Save_Save").onclick = () => {
            if (!confirm("Save and overwrite the original with the edited level?")) return
            const levelData = Converter.JSONToLevelEditor(editLevelData)
            console.log(levelData)
            Util.PCall(function () { Util.SetWindowProgress(0.5) })
            fs.writeFile(targetFile.path, levelData, "utf8", err => {
                Util.PCall(function () { Util.SetWindowProgress(-1) })
                if (err) {
                    return alert("Level save failed; " + err)
                }
                alert("Saved level!")
            })
        }
        Util.GetById("Save_SaveAs").onclick = () => {
            const levelData = Converter.JSONToLevelEditor(editLevelData)
            console.log(levelData)
            Util.PCall(function () { Util.SetWindowProgress(0.5) })
            Util.AskToSaveFile(levelData, String(targetFile.name)).finally(() => {
                Util.PCall(function () { Util.SetWindowProgress(-1) })
            })
        }
        Util.GetById("Load_Load").onclick = () => {
            if (!confirm("Are you sure you want to reload the level?")) return
            Util.GrabFile(targetFile.path).then(async file => {
                targetFile = file
                Util.GetById("EditingLabel").innerText = "Currently editing: " + targetFile.path
                const levelData = Converter.LevelEditorToJSON(targetFile.content)
                editLevelData = levelData
                LoadLevel(levelData)
            })
        }
        function GetFullNameProperty(name) {
            switch (name) {
                case "hlp":
                    return "Tool Info"
                case "xoff":
                    return "X Offset"
                case "yoff":
                    return "Y Offset"
                case "xsc":
                    return "Flip X"
                case "ysc":
                    return "Flip Y"
                case "rot":
                    return "Rotation"
                case "coru":
                    return "Corrupted"
                case "blsi":
                    return "Max Block Size"
                case "lmsc":
                    return "Music ID"
                case "ldrk":
                    return "Dark level"
                case "ltyp":
                    return "Level Style"
                case "onoff":
                    return "Enabled"
                case "ahea":
                    return "Look ahead time"
                case "fsp":
                    return "Floor spike probability"
                case "fsp":
                    return "Floor spike probability"
                case "wsp":
                    return "Wall spike probability"
                case "csp":
                    return "Ceiling spike probability"
                case "asp":
                    return "Air spike probability"
                case "fiw":
                    return "Firework probability"
                case "lsr":
                    return "Laser probability"
                case "drp":
                    return "Spike drop probability"
                case "jmp":
                    return "Jump probability"
                case "rjmp":
                    return "Jump release probability"
                case "stp":
                    return "Stop probability"
                case "st":
                    return "Start probability"
                case "tur":
                    return "Turn probability"
                case "inview":
                    return "Don't spawn offscreen traps"
                default:
                    return name
            }
        }
        const PropertyMenu = Util.GetById("Details_ToolProperties")
        function UpdateToolDetails(toolname) {
            const ToolClass = LevelEditor.ImportedTools[toolname]
            if (ToolClass) {
                // this is a tool not an object
                Util.GetById("Details_ToolIcon").src = ToolClass.Icon
                Util.GetById("Details_ToolIcon").title = ToolClass.Name
                PropertyMenu.innerHTML = ""
                Util.CreateElement("a", PropertyMenu, a => {
                    a.innerText = (Util.IsJson(ToolClass.Details) ? JSON.parse(ToolClass.Details) : String(ToolClass.Details))
                })
                return
            }
            Util.GetById("Details_ToolIcon").src = LevelEditor.GetImageOfTile(currentTool.name)
            Util.GetById("Details_ToolIcon").title = String(currentTool.name)
            PropertyMenu.innerHTML = ""
            currentTool.properties.forEach(property => {
                Util.CreateElement("a", PropertyMenu, a => {
                    a.innerText = GetFullNameProperty(property.key) + " "
                    Util.CreateElement("input", PropertyMenu, input => {
                        input.type = "text"
                        input.placeholder = "Value"
                        input.value = property.value
                        input.onchange = () => {
                            const tryChange = Converter.SetProperty(property.key, input.value, currentTool.properties)
                            currentTool.properties = tryChange
                            // console.log("updated tool properties", currentTool.properties, "to", tryChange)
                        }
                    })
                })
                Util.CreateElement("br", PropertyMenu)
            })
        }
        const ToolPlacementElements = {
            scale: {
                x: Util.GetById("Details_ScaleX"),
                y: Util.GetById("Details_ScaleY")
            },
            alignment: {
                x: Util.GetById("Details_AlignmentX"),
                y: Util.GetById("Details_AlignmentY")
            },
            rotation: {
                degrees: Util.GetById("Details_RotationDegrees"),
                amount: Util.GetById("Details_RotationAmount")
            }
        }
        function UpdatePlacementElements() {
            currentTool.scale.x = Converter.SafeNullAndNaN(Number(ToolPlacementElements.scale.x.value))
            currentTool.scale.y = Converter.SafeNullAndNaN(Number(ToolPlacementElements.scale.y.value))
            currentTool.direction = Converter.SafeNullAndNaN(Number(ToolPlacementElements.rotation.degrees.value))
        }
        ToolPlacementElements.scale.x.onchange = UpdatePlacementElements
        ToolPlacementElements.scale.y.onchange = UpdatePlacementElements
        Util.GetByTag("button").forEach(button => {
            if (String(button.id).startsWith("Tool_")) {
                button.onclick = () => {
                    const toolData = Converter.CloneMainJSONFormat().toolData[button.getAttribute("tool")]
                    toolData.name = button.getAttribute("tool")
                    currentTool = toolData
                    UpdateToolDetails()
                    console.log("switched tool", toolData)
                }
            }
        })
        let CanActivateBackgroundClick = true
        LevelEditor.CreateToolDependencies("SwitchObject", (toolName, data) => {
            let toolData = null
            if (data != null) {
                toolData = data
                toolData.name = toolName
            } else {
                toolData = Converter.CloneMainJSONFormat().toolData[toolName]
                toolData.name = toolName
            }
            currentTool = toolData
            UpdateToolDetails()
            console.log("switched tool", toolData)
        })
        LevelEditor.CreateToolDependencies("SkipPlaceTick", () => {
            CanActivateBackgroundClick = false
        })
        TileHolder.onclick = (e) => {
            if (!CanActivateBackgroundClick) {
                CanActivateBackgroundClick = true
                return
            }
            if (!currentTool) return
            const module = LevelEditor.ImportedTools[currentTool.name]
            if (module) {
                if (module.OnBackgroundClick) module.OnBackgroundClick(e, TileHolder, ToolPlacementElements, currentTool)
                return
            }
            const offset = TileHolder.getClientRects()[0]
            const _x = TileHolder.scrollLeft + (e.x - offset.x)
            const _y = TileHolder.scrollTop + (e.y - offset.y)
            UpdatePlacementElements()
            const gridSize = {
                x: Math.round(Util.Clamp(ToolPlacementElements.alignment.x.value, 0, Infinity)),
                y: Math.round(Util.Clamp(ToolPlacementElements.alignment.y.value, 0, Infinity)),
            }
            const x = (gridSize.x == 0 ? _x : (gridSize.x * Math.round(_x / gridSize.x)))
            const y = (gridSize.y == 0 ? _y : (gridSize.y * Math.round(_y / gridSize.y)))
            const corrupted = Number(Converter.GetProperty("coru", currentTool.properties)) == 1
            CreateObject(
                currentTool,
                currentTool.name,
                x,
                y,
                currentTool.scale.x,
                currentTool.scale.y,
                currentTool.direction,
                corrupted
            )
        }
        Util.GetDocumentBody().addEventListener("keypress", (e) => {
            if (e.key == "e" || e.key == "E") {
                currentTool.direction += Converter.SafeNullAndNaN(Number(ToolPlacementElements.rotation.amount.value))
                ToolPlacementElements.rotation.degrees.value = currentTool.direction
            }
        })
        const ViewportFrame = Util.GetById("LevelContents")
        const ViewportZoomElement = Util.GetById("Viewport_Zoom")
        ViewportZoomElement.onchange = () => {
            const zoom = Number(ViewportZoomElement.value) / 100
            ViewportFrame.style.width = (640 / zoom) + "px"
            ViewportFrame.style.height = (360 / zoom) + "px"
            ViewportFrame.style.transform = `scale(${zoom})`
        }
    }
}
module.exports = LevelEditor