const Util = require("../../../utilities")
const Converter = require("../../../converter")
class PackageTool {
    static Icon = "../images/tools/package.png"
    static Name = "package"
    static Details = "Click and Drag to select objects.<br>Click the \"Add Selection\" button to add them to the packaged list.<br>You can select these list items after to place them in the level.<br><br>You can also click on the \"Add Level\" button to add the entire level."

    static Dependencies = ["GetLevelData", "CreateStylingDataForObject"]
    static LoadedDependencies = {}

    static IsSelected = false
    static IsSchematicSelected = false
    static SelectedSchematic = null

    static PropertyMenu = null
    static CustomDisplay = null
    static SchematicListSection = null

    static SelectionStartPoint = { x: 0, y: 0 }
    static LastSelectionInfo = { x: 0, y: 0, width: 0, height: 0 }
    static SelectionShouldExist = false
    static SelectedObjects = {}

    static SavedSchematics = {}

    static OnAttachedElements(documentBody, tileHolder, toolPreviewHolder, toolCustomDisplay, propertyMenu, toolList) {
        // we need to be able to make the selection box
        // this function gives us the element that should hold it (custom display)
        PackageTool.PropertyMenu = propertyMenu
        PackageTool.CustomDisplay = toolCustomDisplay
    }
    static OnCursorDown(event) {
        if (!PackageTool.CustomDisplay) return
        if (PackageTool.IsSchematicSelected) return
        if (!event.clicked) return
        if (!event.isLeftClick) return
        PackageTool.CustomDisplay.innerHTML = ""
        PackageTool.SelectionShouldExist = true
        PackageTool.SelectionStartPoint = {
            x: event.x,
            y: event.y
        }
        PackageTool.LastSelectionInfo = {
            x: event.x,
            y: event.y,
            width: 0,
            height: 0
        }
    }
    static OnCursorUp({ scroll }) {
        if (!PackageTool.CustomDisplay) return
        if (PackageTool.IsSchematicSelected) return
        PackageTool.CustomDisplay.innerHTML = ""
        if (PackageTool.SelectionShouldExist) {
            // we just selected som objects
            PackageTool.SelectionShouldExist = false

            const selectionBox = PackageTool.LastSelectionInfo
            const levelData = PackageTool.LoadedDependencies.GetLevelData()
            const selectedObjects = {}
            for (const objectName in levelData.objects) {
                let idx = 0;
                selectedObjects[objectName] = []
                for (const object of levelData.objects[objectName]) {
                    // save idx since we can make things easier with continue
                    const currentIdx = idx;
                    idx++;

                    if (!object.position) continue
                    const x = object.position.x
                    const y = object.position.y

                    // check if x & y are inside
                    if (x < (selectionBox.x + scroll.x)) continue
                    if (y < (selectionBox.y + scroll.y)) continue
                    if (x > (selectionBox.x + scroll.x) + selectionBox.width) continue
                    if (y > (selectionBox.y + scroll.y) + selectionBox.height) continue

                    // add to selected
                    const selectObject = Util.CloneJSON(object)
                    // selectObject.selectedIndex = currentIdx
                    selectedObjects[objectName].push(selectObject)
                }
            }

            // set
            PackageTool.SelectedObjects = selectedObjects
            console.log(selectedObjects)
        }
    }
    static OnCursorMove(event) {
        if (!PackageTool.CustomDisplay) return
        if (PackageTool.IsSchematicSelected) return
        PackageTool.CustomDisplay.innerHTML = ""
        if (!PackageTool.SelectionShouldExist) return
        let x = PackageTool.SelectionStartPoint.x
        let y = PackageTool.SelectionStartPoint.y
        let width = event.x - PackageTool.SelectionStartPoint.x
        let height = event.y - PackageTool.SelectionStartPoint.y

        if (event.x < x) {
            // swap
            x = event.x
            width = PackageTool.SelectionStartPoint.x - event.x
        }
        if (event.y < y) {
            // swap
            y = event.y
            height = PackageTool.SelectionStartPoint.y - event.y
        }

        let html = '<div style="position:absolute;left:'
        html += x
        html += 'px;top:'
        html += y
        html += 'px;width:'
        html += width
        html += 'px;height:'
        html += height
        html += 'px;border: 4px white dashed;"></div>'
        PackageTool.CustomDisplay.innerHTML = html

        PackageTool.LastSelectionInfo = {
            x: x,
            y: y,
            width: width,
            height: height
        }
    }

    static OnEquip() {
        PackageTool.IsSelected = true
        if (PackageTool.PropertyMenu) {
            // hide since we dont need it
            PackageTool.PropertyMenu.style.display = "none"
        }
        PackageTool._UpdateSchematicList()
    }
    static OnUnequip() {
        PackageTool.IsSelected = false
        if (PackageTool.PropertyMenu) {
            PackageTool.PropertyMenu.style.display = ""
        }
    }
    static OnTileCreationRequest(CreateObject, currentTool, x, y, xScale, yScale, direction, corrupted) {
        // if we have a schematic selected, place that schematic down
        if (!PackageTool.IsSchematicSelected) return
        const Schematic = PackageTool.SavedSchematics[PackageTool.SelectedSchematic]
        if (!Schematic) return
        // get offset position since we should ideally place from top left
        const offset = PackageTool._GetSchematicOffset(Schematic)
        // for each object
        for (const objectType in Schematic) {
            for (const object of Schematic[objectType]) {
                const corrupted = Number(Converter.GetProperty("coru", object.properties)) == 1
                CreateObject(
                    object,
                    objectType,
                    x + (object.position.x - offset.x),
                    y + (object.position.y - offset.y),
                    object.scale.x,
                    object.scale.y,
                    object.direction,
                    corrupted
                )
            }
        }
    }

    static CreateToolPreview() {
        // this function should be fast since it is constantly called each movement
        if (!PackageTool.IsSchematicSelected) {
            return // this just wont generate a preview
        }
        // generate styles for stuff
        const CreateStylingDataForObject = PackageTool.LoadedDependencies.CreateStylingDataForObject
        const Schematic = PackageTool.SavedSchematics[PackageTool.SelectedSchematic]
        if (!Schematic) {
            return {
                html: '<p style="font-weight: bold; color: red">No schematic found<br>(invalid data?)</p>',
                followCursor: true,
                opacity: 0.5
            }
        }
        let html = "";
        // get offset position since we should ideally place from top left
        const offset = PackageTool._GetSchematicOffset(Schematic)
        // for each object
        for (const objectType in Schematic) {
            for (const object of Schematic[objectType]) {
                const corrupted = Number(Converter.GetProperty("coru", object.properties)) == 1
                const style = CreateStylingDataForObject(
                    objectType,
                    object.position.x - offset.x,
                    object.position.y - offset.y,
                    object.scale.x,
                    object.scale.y,
                    object.direction,
                    corrupted
                )
                // console.log(style)
                html += '<img style="'
                for (const attribute in style) {
                    if (attribute == "src") continue // handle after
                    html += `${attribute}: ${style[attribute]};`
                }
                html += '" src="'
                html += style.src
                html += '">'
            }
        }
        return {
            html: html,
            followCursor: true,
            opacity: 0.25 // schematics might have overlapping pieces
        }
    }

    static ModifyToolMenu(section) {
        section.innerHTML = `<p>${PackageTool.Details}</p>`
        Util.CreateElement("button", section, (e) => {
            e.innerHTML = "Add Selection"
            e.classList.add("windowsbutton")
            e.onclick = PackageTool._AddSelection
        })
        Util.CreateElement("button", section, (e) => {
            e.innerHTML = "Add Level"
            e.classList.add("windowsbutton")
            e.onclick = PackageTool._AddLevel
        })
        Util.CreateElement("button", section, (e) => {
            e.innerHTML = "Import Object"
            e.classList.add("windowsbutton")
            e.onclick = PackageTool._ImportObject
        })
        Util.CreateElement("br", section)
        Util.CreateElement("button", section, (e) => {
            e.innerHTML = "Deselect Schematic"
            e.classList.add("windowsbutton")
            e.onclick = () => {
                PackageTool.IsSchematicSelected = false
                PackageTool.SelectedSchematic = null
            }
        })
        Util.CreateElement("div", section, (e) => {
            e.style = "width: 100%; height: 192px; margin-top: 8px; resize: vertical; overflow: auto;"
            e.classList.add("contentbox")
            PackageTool.SchematicListSection = e
        })
        PackageTool._UpdateSchematicList()
    }

    // internal functions
    // use _FunctionName to protect against functions being overwritten by plugin API updates
    static _AddSelection(e) {
        // grab selected objects
        const objects = PackageTool.SelectedObjects
        Util.PromptForInput(e.x, e.y, false, "Schematic Name").then(name => {
            PackageTool.SavedSchematics[name] = objects
            console.log("saved", name, "as", objects)
            // update list
            PackageTool._UpdateSchematicList()
        })
    }
    static _AddLevel(e) {
        if (!confirm("Add the entire level and it's objects to the list?")) return
        // grab the entire level
        const levelData = PackageTool.LoadedDependencies.GetLevelData()
        const objects = levelData.objects
        console.log(objects)
        // prompt name
        // do timeout since pop-ups cause weird focusing issues
        setTimeout(() => {
            Util.PromptForInput(e.x, e.y, false, "Schematic Name").then(name => {
                PackageTool.SavedSchematics[name] = objects
                console.log("saved", name, "as", objects)
                // update list
                PackageTool._UpdateSchematicList()
            })
        }, 100);
    }
    static async _ImportObject() {
        // an error just stops this function so we can use await
        const files = await Util.AskForFile({
            name: "SnailTool Editor Objects",
            extensions: [".snailobj"]
        }, false, true)
        console.log(files)
        // update list
        PackageTool._UpdateSchematicList()
    }

    static _GetSchematicOffset(schematic) {
        // gets the top left object in the schematic
        const current = { x: 0, y: 0 }
        let closestX = Infinity
        let closestY = Infinity
        for (const objectType in schematic) {
            for (const object of schematic[objectType]) {
                if (!object.position) continue
                if (object.position.x < closestX) {
                    closestX = object.position.x
                    current.x = closestX
                }
                if (object.position.y < closestY) {
                    closestY = object.position.y
                    current.y = closestY
                }
            }
        }
        return current
    }

    static _UpdateSchematicList() {
        if (!PackageTool.SchematicListSection) return;
        const list = PackageTool.SchematicListSection
        list.innerHTML = ""
        for (const schematicName in PackageTool.SavedSchematics) {
            Util.CreateElement("div", list, (row) => {
                row.style = "display: flex; align-items: center;"
                Util.CreateElement("p", row, (e) => {
                    e.innerText = schematicName
                })
                Util.CreateElement("button", row, (e) => {
                    e.innerHTML = "Select"
                    e.classList.add("windowsbutton")
                    e.onclick = () => {
                        PackageTool.IsSchematicSelected = true
                        PackageTool.SelectedSchematic = schematicName
                    }
                })
                Util.CreateElement("button", row, (e) => {
                    e.innerHTML = "Export"
                    e.classList.add("windowsbutton")
                    e.onclick = () => {
                        const json = PackageTool.SavedSchematics[schematicName]
                        const stringified = JSON.stringify(json)
                        console.log(json)
                        const cleanName = schematicName.replace(/[^a-zA-Z0-9-_]+/gmi, "_")
                        Util.AskToSaveFile(stringified, cleanName + ".snailobj")
                    }
                })
            })
        }
    }
}
module.exports = PackageTool