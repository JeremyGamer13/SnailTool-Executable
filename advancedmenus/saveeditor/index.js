const Util = require("../../utilities.js")

class SaveEditor {
    static async load(baseFile) {
        const div = Util.GetById("TabContent")
        div.innerHTML = `<p>Loading file, please wait...</p>`

        const file = await Util.GrabFile(baseFile.path)
        div.innerHTML = `<p>Reading data, please wait...</p>`
        if (!SaveEditor.isSave(file.content, "SaavoGame23")) {
            div.innerHTML = `<p>Failed to read data; file is not a save file</p>`
            return Util.DisplayMessage({
                type: "error",
                buttons: ["OK"],
                title: "Error",
                message: "Failed to read save file.",
                detail: "Target file has to be a .sav save file with the SaavoGame23 format.",
                normalizeAccessKeys: true
            })
        }
        const saveData = SaveEditor.removeGroups(SaveEditor.readSave(file.content, "SaavoGame23"), ": ")
        div.innerHTML = ""

        Object.getOwnPropertyNames(saveData).forEach(key => {
            const inputType = Util.IsNumber(saveData[key]) ? "number" : "text"
            const input = typeof saveData[key] === "object" ? `<p style="opacity:0.5">&lt;not editable yet></p>` : `<input type="${inputType}" value="${saveData[key]}">`
            div.innerHTML += `<div><p>${key}</p>`
                + input
                + `</div>`
        })

        div.innerHTML += `<details><summary>Raw JSON</summary>`
            + `<p>Grouped</p>`
            + `<p style="font-family:monospace;overflow:auto;width:100%">${JSON.stringify(SaveEditor.createGroups(saveData, ": "))}</p>`
            + `<p>Ungrouped</p>`
            + `<p style="font-family:monospace;overflow:auto;width:100%">${JSON.stringify(saveData)}</p>`
            + `<button class="windowsbutton">Download Grouped</button>`
            + `<button class="windowsbutton">Copy Grouped</button>`
            + `<button class="windowsbutton">Download Ungrouped</button>`
            + `<button class="windowsbutton">Copy Ungrouped</button>`
            + `</details>`
    }

    static isSave(data, format) {
        switch (format) {
            case "SaavoGame23": {
                const parsed = String(data).replace(/\r/gmi, "").split("\n").filter(value => value.replace(/ /gmi, "").replace(/\t/gmi, "") !== "")
                if (!Util.IsNumber(parsed.shift())) return false
                if (parsed.shift() !== "Hello, human. Cheating isn't really fun when it's that easy, is it?") return false
                if (parsed.shift() !== "Change whatever you want if it helps to makes you feel good.") return false
                if (parsed.shift() !== "!! Edit at your own risk !!") return false
                return true
            }
            default:
                throw new Error("Unknown format " + format)
        }
    }

    static createGroups(object, splitter) {
        const clone = Util.CloneJSON(object)
        const grouped = {}

        Object.getOwnPropertyNames(clone).forEach(group => {
            if (group.includes(splitter)) {
                const groupNames = group.split(splitter)
                // create groups if they dont exist
                if (!grouped[groupNames[0]]) {
                    grouped[groupNames[0]] = {}
                }
                grouped[groupNames[0]][groupNames[1]] = clone[group]
                return
            }
            grouped[group] = clone[group]
        })

        return grouped
    }
    static removeGroups(object, splitter) {
        const clone = Util.CloneJSON(object)
        const ungrouped = {}

        Object.getOwnPropertyNames(clone).forEach(group => {
            if (Util.IsObjectWithKeys(clone[group])) {
                // object has keys in it
                Object.getOwnPropertyNames(clone[group]).forEach(key => {
                    ungrouped[group + splitter + key] = clone[group][key]
                })
                return
            }
            ungrouped[group] = clone[group]
        })

        return ungrouped
    }

    static readSave(data, format) {
        switch (format) {
            case "SaavoGame23": {
                const parsed = String(data).replace(/\r/gmi, "").split("\n").map(value => value.trim())
                const compiledVersion = {}
                const parserStates = {
                    canStartReading: false,
                    readingOption: false,
                    optionName: "",
                    readingList: false
                }
                // start reading parsed
                const currentValues = []
                for (let i = 0; i < parsed.length; i++) {
                    const line = parsed[i]
                    // reading an empty line
                    if (line === "") {
                        if (parserStates.optionName !== "") {
                            if (parserStates.readingList) {
                                currentValues.shift()
                                compiledVersion[parserStates.optionName] = Util.CloneJSON(currentValues)
                            } else {
                                compiledVersion[parserStates.optionName] = currentValues[0]
                            }
                        }
                        currentValues.splice(0, currentValues.length)
                        parserStates.readingOption = false
                        parserStates.readingList = false
                        parserStates.optionName = ""
                        continue
                    }
                    // we can start reading because we have gotten past the unimportant stuff
                    if (line === "!! Edit at your own risk !!") {
                        parserStates.canStartReading = true
                        continue
                    }
                    if (!parserStates.canStartReading) continue
                    // we are now reading a value with at least some content in it
                    if (!parserStates.readingOption) {
                        parserStates.optionName = line
                        parserStates.readingOption = true
                    } else {
                        // we are reading an option already
                        // normalize it (turn numbers in strings into actual numbers)
                        const normalized = Util.IsNumber(line) ? Number(line) : line
                        currentValues.push(normalized)
                        // we could have just added the second value to an option
                        // if so, this option is a list of values
                        if (currentValues.length > 1) parserStates.readingList = true
                    }
                }
                // fully compiled everything, return it grouped since its nice
                return SaveEditor.createGroups(compiledVersion, ": ")
            }
            default:
                throw new Error("Unknown format " + format)
        }
    }
    static exportSave(object, format) {
        switch (format) {
            case "SaavoGame23": {
                break
            }
            default:
                throw new Error("Unknown format " + format)
        }
    }
}

module.exports = SaveEditor