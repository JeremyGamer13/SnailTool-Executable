(async function () {
    const { ipcRenderer } = require("electron")
    const path = require("path")
    const fs = require("fs")
    const Util = require("./utilities.js")
    Util.SetRemoteHandler(ipcRenderer)
    const Converter = require("./converter.js")
    const Settings = require("./settings.js")
    const ImageGenerator = require("./image.js")

    const MousePosition = { x: 0, y: 0 }

    function hexToHsl(H) {
        let r = 0, g = 0, b = 0;
        if (H.length == 4) {
            r = "0x" + H[1] + H[1];
            g = "0x" + H[2] + H[2];
            b = "0x" + H[3] + H[3];
        } else if (H.length == 7) {
            r = "0x" + H[1] + H[2];
            g = "0x" + H[3] + H[4];
            b = "0x" + H[5] + H[6];
        }
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
            h = 0;
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        else if (cmax == g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
            h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return { h: h, s: s, l: l }
    }
    function hslToRgb(h, s, l) {
        if (typeof h == "object") {
            s = h.s
            l = h.l
            h = h.h
        }
        // Must be fractions of 1
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return { r: r, g: g, b: b };
    }
    function rgbToHex(r, g, b) {
        if (typeof r == "object") {
            g = r.g
            b = r.b
            r = r.r
        }
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);

        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;

        return "#" + r + g + b;
    }

    const CachedThemeData = {
        type: "dark",
        color: "#e2acd3"
    }
    function setColorTheme(page) {
        function toggleTransitions(on) {
            Util.GetAllElements().forEach(element => {
                if (on) {
                    element.style.removeProperty("transition")
                    element.style.removeProperty("transition-duration")
                    return
                }
                element.style.setProperty("transition", "none", "important")
                element.style.setProperty("transition-duration", "0s", "important")
            })
        }
        function setCustomColors(hex) {
            const color = hexToHsl(hex)
            const root = document.getElementsByTagName("html").item(0)
            root.style.setProperty('--custom-color', rgbToHex(hslToRgb(color.h, color.s, color.l)))
            root.style.setProperty('--custom-color-hover', rgbToHex(hslToRgb(color.h, color.s, color.l * 0.35)))
            root.style.setProperty('--custom-color-content', rgbToHex(hslToRgb(color.h, color.s, color.l * 0.2)))
            root.style.setProperty('--custom-color-dark', rgbToHex(hslToRgb(color.h, color.s, color.l * 0.05)))
        }
        toggleTransitions(false)
        const css = Util.GetById("PageTheme_CSS")
        Settings.get("THEME_TYPE").then(themeType => Settings.get("THEME_COLOR").then(themeColor => {
            if (themeType == null) themeType = "dark"
            if (themeColor == null) themeColor = "#e2acd3"
            CachedThemeData.type = themeType
            CachedThemeData.color = themeColor
            switch (page) {
                case "HomePage":
                    css.href = `themes/${themeType}.css`
                    setCustomColors(themeColor)
                    break
                default:
                    css.href = `../themes/${themeType}.css`
                    setCustomColors(themeColor)
                    break
            }
            setTimeout(() => {
                toggleTransitions(true)
            }, 50);
        }))
    }

    let targetFile = null
    let backupFolder = null

    window.addEventListener("DOMContentLoaded", async () => {
        const DocumentType = Util.GetById("DocumentHandleType").innerHTML

        setColorTheme(DocumentType)
        window.onmousemove = e => {
            MousePosition.x = e.x
            MousePosition.y = e.y
        }

        // different menus
        Util.GetById("Navbar_Home").onclick = async () => {
            if (targetFile) {
                await Util.SaveToMemory("TargetPath", targetFile.path)
            }
            Util.SwitchMenuFile("index.html")
        }
        Util.GetById("Navbar_Savedit").onclick = async () => {
            if (targetFile) {
                await Util.SaveToMemory("TargetPath", targetFile.path)
            }
            Util.SwitchMenuFile("tools/saveeditor.html")
        }
        Util.GetById("Navbar_Leveledit").onclick = async () => {
            if (targetFile) {
                await Util.SaveToMemory("TargetPath", targetFile.path)
            }
            Util.SwitchMenuFile("tools/leveleditor.html")
        }
        Util.GetById("Navbar_Settings").onclick = async () => {
            if (targetFile) {
                await Util.SaveToMemory("TargetPath", targetFile.path)
            }
            Util.SwitchMenuFile("tools/settings.html")
        }
        Util.GetById("Navbar_Credits").onclick = async () => {
            if (targetFile) {
                await Util.SaveToMemory("TargetPath", targetFile.path)
            }
            Util.SwitchMenuFile("tools/credits.html")
        }

        console.log("loading", DocumentType, "scripts")
        switch (DocumentType) {
            case "HomePage":
                (function () {
                    const TargetFilePicker = Util.GetById("targetFilePicker")
                    TargetFilePicker.onclick = () => {
                        Util.AskForFile().then(files => {
                            console.log(files)
                            targetFile = files[0]
                            TargetFilePicker.innerText = targetFile.path
                        })
                    }
                    Util.GetById("grabLastSavedLevel").onclick = () => {
                        Settings.get("LEVELPATH").then(value => {
                            if (value == null) {
                                alert("As part of a one-time setup, you will need to select the file to grab. Once you set this, it will be remembered and you wont have to do it again.")
                                Util.AskForFile().then(files => {
                                    targetFile = files[0]
                                    TargetFilePicker.innerText = targetFile.path
                                    Settings.set("LEVELPATH", targetFile.path)
                                })
                            } else {
                                Util.GrabFile(value).then(file => {
                                    targetFile = file
                                    TargetFilePicker.innerText = targetFile.path
                                })
                            }
                        })
                    }
                    Util.ExistsInMemory("TargetPath").then(exists => {
                        if (exists) {
                            Util.GetFromMemory("TargetPath").then(path => {
                                Util.GrabFile(path).then(file => {
                                    targetFile = file
                                    TargetFilePicker.innerText = targetFile.path
                                })
                            })
                        } else {
                            Settings.get("LEVELPATH").then(value => {
                                if (value != null) {
                                    Util.GetById("grabLastSavedLevel").click()
                                }
                            })
                        }
                    })
                    const BackupFolderPicker = Util.GetById("BackupFolderPicker")
                    BackupFolderPicker.onclick = () => {
                        Util.AskForFile(null, true).then(folders => {
                            console.log(folders)
                            backupFolder = folders[0]
                            BackupFolderPicker.innerText = folders[0]
                            Settings.set("BACKUPFOLDER", folders[0])
                        })
                    }
                    Settings.get("BACKUPFOLDER").then(value => {
                        if (value != null) {
                            backupFolder = value
                            BackupFolderPicker.innerText = value
                        }
                    })
                    Util.GetById("Backup_List").onclick = () => {
                        Settings.get("BACKUPFOLDER").then(value => {
                            if (value == null) {
                                return Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "No backup folder has been set. Please pick one at the top.",
                                    normalizeAccessKeys: true
                                })
                            }
                            fs.readdir(value, (err, files) => {
                                if (err) return Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Read Folder Failed!",
                                    detail: "Failed to read " + value + "; " + String(err),
                                    normalizeAccessKeys: true
                                })
                                const fileList = files.map(file => {
                                    if (file == ".bak") return "(empty name)"
                                    if (file.endsWith(".bak")) return file.replace(".bak", "")
                                })
                                alert("Here are all the backups you can load:\n\n" + (fileList[0] != null ? fileList.join("\n") : "No backups found in this folder."))
                            })
                        })
                    }
                    Util.GetById("Backup_Save").onclick = () => {
                        Settings.get("BACKUPFOLDER").then(value => {
                            if (value == null) {
                                return Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "No backup folder has been set. Please pick one at the top.",
                                    normalizeAccessKeys: true
                                })
                            }
                            Util.PromptForInput(MousePosition.x, MousePosition.y, false, "Backup Name").then(text => {
                                let ContinueOverwrite = true
                                Util.PCall(function () {
                                    const data = fs.readFileSync(path.join(value, text + '.bak'))
                                    if (!confirm("Are you sure you want to overwrite " + text + "?")) ContinueOverwrite = false
                                })
                                if (!ContinueOverwrite) return
                                Util.GrabFile(targetFile.path).then(file => {
                                    try {
                                        Util.PCall(function () { Util.SetWindowProgress(0.5) })
                                        console.log("saving", file, "backup to", path.join(value, text + '.bak'))
                                        fs.writeFile(path.join(value, text + '.bak'), file.content, "utf8", err => {
                                            if (err) return Util.DisplayMessage({
                                                type: "error",
                                                buttons: ["OK"],
                                                title: "Error",
                                                message: "Backup failed!",
                                                detail: String(err),
                                                normalizeAccessKeys: true
                                            })
                                            Util.PCall(function () { Util.SetWindowProgress(1) })
                                            alert("Save complete!")
                                            Util.PCall(function () { Util.SetWindowProgress(-1) })
                                        })
                                    } catch (err) {
                                        Util.PCall(function () { Util.SetWindowProgress(-1) })
                                        console.error(err)
                                        Util.DisplayMessage({
                                            type: "error",
                                            buttons: ["OK"],
                                            title: "Error",
                                            message: "Backup failed!",
                                            detail: "Backup failed due to a developer issue; " + String(err),
                                            normalizeAccessKeys: true
                                        })
                                    }
                                })
                            })
                        })
                    }
                    Util.GetById("Backup_Load").onclick = () => {
                        Settings.get("BACKUPFOLDER").then(value => {
                            if (value == null) {
                                return Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "No backup folder has been set. Please pick one at the top.",
                                    normalizeAccessKeys: true
                                })
                            }
                            Util.PromptForInput(MousePosition.x, MousePosition.y, false, "Backup Name").then(text => {
                                const confirmation = confirm("Are you sure you want to overwrite " + targetFile.name + " with backup " + text + "?")
                                if (!confirmation) return
                                Util.PCall(function () { Util.SetWindowProgress(0.5) })
                                const attemptFileRead = Util.PCall(function () {
                                    fs.readFileSync(path.join(value, text + '.bak'))
                                })
                                if (!attemptFileRead.success) {
                                    Util.PCall(function () { Util.SetWindowProgress(-1) })
                                    return alert("That backup does not exist!")
                                }
                                Util.GrabFile(path.join(value, text + '.bak')).then(file => {
                                    Util.PCall(function () { Util.SetWindowProgress(1) })
                                    console.log(file)
                                    fs.writeFile(targetFile.path, file.content, "utf8", err => {
                                        Util.PCall(function () { Util.SetWindowProgress(-1) })
                                        if (err) {
                                            return alert("Backup load failed; " + err)
                                        }
                                        alert("Loaded backup!")
                                    })
                                })
                            })
                        })
                    }
                    // json stuff
                    Util.GetById("Convert_SnailaxToJSON").onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            Util.PCall(function () { Util.SetWindowProgress(0.5) })
                            const data = file.content
                            let result = ""
                            let pcallResults = Util.PCall(function () {
                                if (Number(String(data).charAt(0)) < 4) alert("This snailax level is older than version 4. The level may not parse correctly and most likely will break when loading.")
                                if (Number(String(data).charAt(0)) > 5) alert("This snailax level is newer than version 5. The level may not parse correctly and most likely will break when loading.")
                                result = Converter.SnailaxToJSON(data)
                            }, function (err) {
                                console.error(err)
                                Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Failed to convert file.",
                                    detail: String(err),
                                    normalizeAccessKeys: true
                                })
                            })
                            if (!pcallResults.success) return Util.PCall(function () { Util.SetWindowProgress(-1) })
                            console.log(result)
                            Util.AskToSaveFile(JSON.stringify(result), String(file.name).split(".")[0] + ".json", [
                                { name: 'JSON', extensions: ['json'] }
                            ])
                            Util.PCall(function () { Util.SetWindowProgress(-1) })
                        })
                    }
                    Util.GetById("Convert_JSONToSnailax").onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            function RunWithJson(json) {
                                Util.PCall(function () { Util.SetWindowProgress(0.5) })
                                const data = JSON.parse(json)
                                let result = ""
                                let pcallResults = Util.PCall(function () {
                                    result = Converter.JSONToSnailax(data)
                                }, function (err) {
                                    console.error(err)
                                    Util.DisplayMessage({
                                        type: "error",
                                        buttons: ["OK"],
                                        title: "Error",
                                        message: "Failed to convert file.",
                                        detail: String(err),
                                        normalizeAccessKeys: true
                                    })
                                })
                                if (!pcallResults.success) return Util.PCall(function () { Util.SetWindowProgress(-1) })
                                console.log(result)
                                Util.AskToSaveFile(result, String(file.name).split(".")[0] + ".wysld", [
                                    { name: 'Will You Snail Level Data', extensions: ['wysld'] }
                                ])
                                Util.PCall(function () { Util.SetWindowProgress(-1) })
                            }
                            if (!Util.IsJson(file.content)) {
                                return alert("The target file is not a valid JSON file.")
                            }
                            RunWithJson(file.content)
                        })
                    }
                    Util.GetById("Convert_LevelEditorToJSON").onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            Util.PCall(function () { Util.SetWindowProgress(0.5) })
                            const data = file.content
                            let result = ""
                            let pcallResults = Util.PCall(function () {
                                const version = Number(String(data).replace(/\r/gmi, "").split("\n")[0])
                                if (version < 1.5) alert("This level is older than version 1.5. The level may not parse correctly and most likely will break when loading.")
                                if (version > 1.5) alert("This level is newer than version 1.5. The level may not parse correctly and most likely will break when loading.")
                                result = Converter.LevelEditorToJSON(data)
                            }, function (err) {
                                console.error(err)
                                Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Failed to convert file.",
                                    detail: String(err),
                                    normalizeAccessKeys: true
                                })
                            })
                            if (!pcallResults.success) return Util.PCall(function () { Util.SetWindowProgress(-1) })
                            console.log(result)
                            Util.AskToSaveFile(JSON.stringify(result), String(file.name).split(".")[0] + ".json", [
                                { name: 'JSON', extensions: ['json'] }
                            ])
                            Util.PCall(function () { Util.SetWindowProgress(-1) })
                        })
                    }
                    Util.GetById("Convert_JSONToLevelEditor").onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            function RunWithJson(json) {
                                Util.PCall(function () { Util.SetWindowProgress(0.5) })
                                const data = JSON.parse(json)
                                let result = ""
                                let pcallResults = Util.PCall(function () {
                                    result = Converter.JSONToLevelEditor(data)
                                }, function (err) {
                                    console.error(err)
                                    Util.DisplayMessage({
                                        type: "error",
                                        buttons: ["OK"],
                                        title: "Error",
                                        message: "Failed to convert file.",
                                        detail: String(err),
                                        normalizeAccessKeys: true
                                    })
                                })
                                if (!pcallResults.success) return Util.PCall(function () { Util.SetWindowProgress(-1) })
                                console.log(result)
                                Util.AskToSaveFile(result, String(file.name).split(".")[0] + ".lvl", [
                                    { name: 'Level Data', extensions: ['lvl'] }
                                ])
                                Util.PCall(function () { Util.SetWindowProgress(-1) })
                            }
                            if (!Util.IsJson(file.content)) {
                                return alert("The target file is not a valid JSON file.")
                            }
                            RunWithJson(file.content)
                        })
                    }
                    // mod to real | real to mod
                    Util.GetById("Convert_SnailaxToLevelEditor").onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            Util.PCall(function () { Util.SetWindowProgress(0.5) })
                            const data = file.content
                            let result = ""
                            let pcallResults = Util.PCall(function () {
                                alert("The official level editor currently does not have some of the snailax objects. You may have problems loading the level or some elements will be missing.")
                                if (Number(String(data).charAt(0)) < 4) alert("This snailax level is older than version 4. The level may not convert correctly and most likely will break when loading.")
                                if (Number(String(data).charAt(0)) > 5) alert("This snailax level is newer than version 5. The level may not convert correctly and most likely will break when loading.")
                                result = Converter.SnailaxToLevelEditor(data)
                            }, function (err) {
                                console.error(err)
                                Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Failed to convert file.",
                                    detail: String(err),
                                    normalizeAccessKeys: true
                                })
                            })
                            if (!pcallResults.success) return Util.PCall(function () { Util.SetWindowProgress(-1) })
                            console.log(result)
                            Util.AskToSaveFile(result, String(file.name).split(".")[0] + ".lvl", [
                                { name: 'Level Data', extensions: ['lvl'] }
                            ])
                            Util.PCall(function () { Util.SetWindowProgress(-1) })
                        })
                    }
                    Util.GetById("Convert_LevelEditorToSnailax").onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            Util.PCall(function () { Util.SetWindowProgress(0.5) })
                            const data = file.content
                            let result = ""
                            let pcallResults = Util.PCall(function () {
                                alert("Snailax currently does not support some of the level editor tools such as wires or AI triggers. The level may be slightly different from the level editor or fail to load if the object is not present in Snailax.")
                                const version = Number(String(data).replace(/\r/gmi, "").split("\n")[0])
                                if (version < 1.5) alert("This level is older than version 1.5. The level may not convert correctly and most likely will break when loading.")
                                if (version > 1.5) alert("This level is newer than version 1.5. The level may not convert correctly and most likely will break when loading.")
                                result = Converter.LevelEditorToSnailax(data)
                            }, function (err) {
                                console.error(err)
                                Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Failed to convert file.",
                                    detail: String(err),
                                    normalizeAccessKeys: true
                                })
                            })
                            if (!pcallResults.success) return Util.PCall(function () { Util.SetWindowProgress(-1) })
                            console.log(result)
                            Util.AskToSaveFile(result, String(file.name).split(".")[0] + ".wysld", [
                                { name: 'Will You Snail Level Data', extensions: ['wysld'] }
                            ])
                            Util.PCall(function () { Util.SetWindowProgress(-1) })
                        })
                    }
                    const ThumbnailGeneratorButton = Util.GetById("GenerateThumbnail")
                    ThumbnailGeneratorButton.onclick = () => {
                        Util.GrabFile(targetFile.path).then(file => {
                            Util.PCall(function () { Util.SetWindowProgress(0.5) })
                            const data = file.content
                            if (!Converter.IsWYSLevelFile(data)) {
                                Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Failed to generate image.",
                                    detail: "The provided file is not a Snailax or Level editor level. Please pick one and try again.",
                                    normalizeAccessKeys: true
                                })
                                Util.PCall(function () { Util.SetWindowProgress(-1) })
                                return
                            }
                            const jsonInput = (Converter.IsLevelEditor(data) ? Converter.LevelEditorToJSON(data) : Converter.SnailaxToJSON(data))
                            const generator = new ImageGenerator()
                            generator.attachEventFunction("OBJECTADD", (index, max, objectName) => {
                                ThumbnailGeneratorButton.innerText = `Generate thumbnail - Placed ${index}/${max} ${objectName}s`
                            })
                            generator.attachEventFunction("WIREADD", (index, max) => {
                                ThumbnailGeneratorButton.innerText = `Generate thumbnail - Placed ${index}/${max} wires`
                            })
                            generator.attachEventFunction("BUFFERGEN", () => {
                                ThumbnailGeneratorButton.innerText = `Generate thumbnail - Generating base image`
                            })
                            generator.attachEventFunction("GLOWGEN", () => {
                                ThumbnailGeneratorButton.innerText = `Generate thumbnail - Generating effects, this may take a while`
                            })
                            generator.attachEventFunction("ERROR", (err, extra) => {
                                ThumbnailGeneratorButton.innerText = `Generate thumbnail - !! ${extra}; ${err} !!`
                            })
                            generator.attachEventFunction("FINISHED", () => {
                                ThumbnailGeneratorButton.innerText = `Generate thumbnail`
                            })
                            generator.createLevelPreview(jsonInput).then(imageBuffer => {
                                Util.PCall(function () { Util.SetWindowProgress(-1) })
                                Util.AskToSaveFile(imageBuffer, String(file.name).split(".")[0] + ".png", [
                                    { name: 'Level Preview Image', extensions: ['png'] }
                                ])
                            }).catch(err => {
                                Util.PCall(function () { Util.SetWindowProgress(-1) })
                                console.error(err)
                                Util.DisplayMessage({
                                    type: "error",
                                    buttons: ["OK"],
                                    title: "Error",
                                    message: "Failed to generate image.",
                                    detail: String(err),
                                    normalizeAccessKeys: true
                                })
                            })
                        })
                    }
                })();
                break
            case "LevelEditor":
                (async function () {
                    const TileHolder = Util.GetById("LevelContents")
                    let focusedObject = null
                    let currentTool = null
                    let editLevelData = Converter.CloneMainJSONFormat()
                    // let editLevelData = Converter.LevelJSONFormat
                    function GetTileVisualData(tile) {
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
                    function GetTileRotationAnchor(tile) {
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
                    function GetImageOfTile(tile) {
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
                            case "wire_tool":
                                return "../images/objects/wire.png"
                            case "delete_tool":
                                return "../images/objects/delete.png"
                            default:
                                return "../images/objects/unknown.png"
                        }
                    }
                    function CreateObject(tile, x, y, tileWidth, tileHeight, rotation, corrupted, addToData, objIndex) {
                        const scaleAndOffset = GetTileVisualData(tile)
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
                            img.style.transformOrigin = GetTileRotationAnchor(tile)
                            img.src = GetImageOfTile(tile)
                            img.draggable = false
                            img.onclick = () => {
                                if (!currentTool) return
                                if (currentTool.name == "delete_tool") {
                                    if (addToData == false) {
                                        editLevelData.objects[tile].splice(objIndex, 1)
                                    } else {
                                        editLevelData.objects[tile].splice(index, 1)
                                    }
                                    return img.remove()
                                }
                                focusedObject = img
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
                    function GetToolHelpInfo(name) {
                        switch (name) {
                            case "wire_tool":
                                return "Use this tool to connect objects with wires."
                        }
                    }
                    function UpdateToolDetails() {
                        Util.GetById("Details_ToolIcon").src = GetImageOfTile(currentTool.name)
                        Util.GetById("Details_ToolIcon").title = String(currentTool.name)
                        const propertyMenu = Util.GetById("Details_ToolProperties")
                        propertyMenu.innerHTML = ""
                        currentTool.properties.forEach(property => {
                            Util.CreateElement("a", propertyMenu, a => {
                                if (property.key == "hlp") {
                                    a.innerText = GetToolHelpInfo(currentTool.name)
                                    return
                                }
                                a.innerText = GetFullNameProperty(property.key) + " "
                                Util.CreateElement("input", propertyMenu, input => {
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
                            Util.CreateElement("br", propertyMenu)
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
                    TileHolder.onclick = (e) => {
                        if (!currentTool) return
                        if (currentTool.name == "delete_tool" || currentTool.name == "wire_tool") return
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
                })();
                break
            case "SaveEditor":
                (async function () {
                    Util.ExistsInMemory("TargetPath").then(async exists => {
                        if (exists) {
                            Util.GetFromMemory("TargetPath").then(async path => {
                                Util.GrabFile(path).then(async file => {
                                    targetFile = file
                                    Util.GetById("EditingLabel").innerText = "Currently editing: " + targetFile.path
                                })
                            })
                        }
                    })
                })();
                break
            case "Settings":
                const buttons = {
                    resetAll: Util.GetById("SettingsReset_All"),
                    resetPath: Util.GetById("SettingsReset_LevelPath"),
                }
                const themeButtons = {
                    dark: Util.GetById("theme_dark"),
                    light: Util.GetById("theme_light"),
                    custom: Util.GetById("theme_custom"),
                }
                const colorPicker = Util.GetById("theme_color")
                themeButtons.dark.onclick = () => {
                    Settings.set("THEME_TYPE", "dark").then(() => {
                        setColorTheme(DocumentType)
                    })
                }
                themeButtons.light.onclick = () => {
                    Settings.set("THEME_TYPE", "light").then(() => {
                        setColorTheme(DocumentType)
                    })
                }
                themeButtons.custom.onclick = () => {
                    Settings.set("THEME_TYPE", "custom").then(() => {
                        Settings.set("THEME_COLOR", colorPicker.value).then(() => {
                            setColorTheme(DocumentType)
                        })
                    })
                }
                colorPicker.onchange = () => {
                    Settings.set("THEME_COLOR", colorPicker.value).then(() => {
                        setColorTheme(DocumentType)
                    })
                }

                buttons.resetAll.onclick = () => {
                    const uSureBro = confirm("This will reset ALL saved settings. Continue?")
                    if (!uSureBro) return
                    Settings.reset().then(() => {
                        Util.SwitchMenuFile("index.html")
                    })
                }
                buttons.resetPath.onclick = () => {
                    const uSureBro = confirm("Reset the default level path?")
                    if (!uSureBro) return
                    Settings.remove("LEVELPATH")
                }

                // load settings values
                Settings.get("THEME_TYPE").then(type => { themeButtons[type].checked = true })
                Settings.get("THEME_COLOR").then(color => { colorPicker.value = color })
                break
        }
    })
})()