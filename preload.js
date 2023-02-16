const { ipcRenderer } = require("electron");
const Util = require("./utilities.js")
Util.SetRemoteHandler(ipcRenderer)
const Converter = require("./converter.js")
const Settings = require("./settings.js")

let targetFile = null
let backupFolder = null
window.addEventListener("DOMContentLoaded", () => {
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
})