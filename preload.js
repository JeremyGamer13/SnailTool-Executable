const { ipcRenderer } = require("electron")
const path = require("path")
const fs = require("fs")
const Util = require("./utilities.js")
Util.SetRemoteHandler(ipcRenderer)
const Converter = require("./converter.js")
const Settings = require("./settings.js")

const MousePosition = { x: 0, y: 0 }

let targetFile = null
let backupFolder = null
window.addEventListener("DOMContentLoaded", () => {
    window.onmousemove = e => {
        MousePosition.x = e.x
        MousePosition.y = e.y
    }

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
    Settings.get("LEVELPATH").then(value => {
        if (value != null) {
            Util.GetById("grabLastSavedLevel").click()
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
        Util.PCall(function () { Util.SetWindowProgress(0.5) })
        const data = targetFile.content
        let result = ""
        let pcallResults = Util.PCall(function () {
            if (Number(String(data).charAt(0)) < 4) alert("This snailax level is older than version 4. The level may not parse correctly and most likely will break when loading.")
            if (Number(String(data).charAt(0)) > 5) alert("This snailax level is newer than version 5. The level may not parse correctly and most likely will break when loading.")
            result = Converter.SnailaxToJSON(data)
        }, function (err) {
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
        Util.AskToSaveFile(JSON.stringify(result), String(targetFile.name).split(".")[0] + ".json", [
            { name: 'JSON', extensions: ['json'] }
        ])
        Util.PCall(function () { Util.SetWindowProgress(-1) })
    }
    Util.GetById("Convert_JSONToSnailax").onclick = () => {
        function RunWithJson(json) {
            Util.PCall(function () { Util.SetWindowProgress(0.5) })
            const data = JSON.parse(json)
            let result = ""
            let pcallResults = Util.PCall(function () {
                result = Converter.JSONToSnailax(data)
            }, function (err) {
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
            Util.AskToSaveFile(result, String(targetFile.name).split(".")[0] + ".wysld", [
                { name: 'Will You Snail Level Data', extensions: ['wysld'] }
            ])
            Util.PCall(function () { Util.SetWindowProgress(-1) })
        }
        if (!Util.IsJson(targetFile.content)) {
            return alert("The target file is not a valid JSON file.")
        }
        RunWithJson(targetFile.content)
    }
    Util.GetById("Convert_LevelEditorToJSON").onclick = () => {
        Util.PCall(function () { Util.SetWindowProgress(0.5) })
        const data = targetFile.content
        let result = ""
        let pcallResults = Util.PCall(function () {
            const version = Number(String(data).replace(/\r/gmi, "").split("\n")[0])
            if (version < 1.5) alert("This level is older than version 1.5. The level may not parse correctly and most likely will break when loading.")
            if (version > 1.5) alert("This level is newer than version 1.5. The level may not parse correctly and most likely will break when loading.")
            result = Converter.LevelEditorToJSON(data)
        }, function (err) {
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
        Util.AskToSaveFile(JSON.stringify(result), String(targetFile.name).split(".")[0] + ".json", [
            { name: 'JSON', extensions: ['json'] }
        ])
        Util.PCall(function () { Util.SetWindowProgress(-1) })
    }
})