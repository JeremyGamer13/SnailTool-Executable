const fs = require("fs")
class Util {
    static Lerp = (current, target, amount) => {
        return current + amount * (target - current)
    }
    static Clamp = (number, min, max) => {
        if (number >= min && number <= max) return number
        if (number < min) return min
        if (number > max) return max
    }
    static IsJson = (json) => {
        let canparse = true
        try {
            JSON.parse(json)
        } catch {
            canparse = false
        }
        return canparse
    }
    static PCall = (func, catc) => {
        let success = true
        let error = null
        try {
            func()
        } catch (err) {
            success = false
            error = err
            catc(err)
        }
        return { success: success, error: error }
    }

    static HTMLCollectionToArray = (collection) => {
        const array = []
        for (let i = 0; i < collection.length; i++) {
            const element = collection[i]
            array.push(element)
        }
        return array
    }
    static BasicTextToBinary = (text) => {
        let output = ""
        for (let i = 0; i < text.length; i++) {
            output += text[i].charCodeAt(0).toString(2) + " "
        }
        return output
    }

    static AddDocumentCore = (name, object) => {
        document[name] = object
    }
    static GetDocumentBody = () => {
        return document.body
    }

    static Reparent = (element, parent, prepend) => {
        if (prepend) return parent.prepend(element)
        parent.append(element)
    }
    static CreateElement = (tag, parent, cb, svg) => {
        const e = svg ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag)
        if (parent) Util.Reparent(e, parent)
        if (cb) cb(e)
        return e
    }
    static Restyle = (element, style) => {
        Object.getOwnPropertyNames(style).forEach(key => {
            element.style[key] = style[key]
        })
    }
    static GetById = (id, returnIfNotFound) => {
        const e = document.getElementById(id)
        return e != null ? e : returnIfNotFound
    }
    static GetByTag = (tag, returnIfNotFound) => {
        const e = document.getElementsByTagName(tag)
        return e.length != 0 ? Util.HTMLCollectionToArray(e) : returnIfNotFound
    }
    static SetId = (element, id) => {
        element.id = id
    }
    static GetAllChildren = (parent, nodes) => {
        return nodes ? parent.childNodes : parent.children
    }
    static MoveAllChildren = (oldParent, newParent) => {
        const children = Util.GetAllChildren(oldParent)
        const array = []

        for (let i = 0; i < children.length; i++) {
            array.push(children[i])
        }

        array.forEach(child => {
            Util.Reparent(child, newParent)
        })
    }
    static Delete = (element) => {
        element.remove()
    }
    static GetAllAttributes = (element) => {
        const array = element.attributes
        const object = {}
        for (let i = 0; i < array.length; i++) {
            const element = array[i]
            object[element.name] = element.value
        }
        return object
    }
    static ConvertTag = (element, tag) => {
        const NewParent = Util.CreateElement(tag)
        const atts = Util.GetAllAttributes(element)

        Object.getOwnPropertyNames(atts).forEach(name => {
            NewParent.attributes[name] = atts[name]
            NewParent.setAttribute(name, atts[name])
        })
        // Util.MoveAllChildren(element, NewParent)
        NewParent.innerHTML = element.innerHTML

        element.parentNode.replaceChild(NewParent, element)
        return NewParent
    }
    static ApplyAttributesFromObject = (element, object) => {
        Object.getOwnPropertyNames(object).forEach(key => {
            element.setAttribute(key, object[key])
        })
    }
    static AskForFileHTML = (accept) => {
        return new Promise((resolve, reject) => {
            Util.CreateElement("input", document.body, input => {
                const fileReader = new FileReader()
                let FileDataToSend = {}
                fileReader.onload = e => {
                    resolve([
                        {
                            name: FileDataToSend.name,
                            size: FileDataToSend.size,
                            type: FileDataToSend.type,
                            date: new Date(FileDataToSend.lastModified),
                            path: FileDataToSend.name,
                            content: e.target.result
                        }
                    ])
                }
                input.style.display = "none"
                input.type = "file"
                input.accept = accept
                input.onchange = () => {
                    const file = input.files[0]
                    if (!file) {
                        reject("NotSelected")
                        return
                    }
                    FileDataToSend.name = file.name
                    FileDataToSend.size = file.size
                    FileDataToSend.type = file.type
                    FileDataToSend.lastModified = file.lastModified
                    fileReader.readAsText(file)
                    input.remove()
                }
                input.onblur = () => {
                    input.onchange()
                }
                input.focus()
                input.click()
            })
        })
    }

    static AddClass = (element, cl) => {
        element.classList.add(cl)
    }

    static GoToPage = (page) => {
        window.location.href += page
    }
    static OpenUrl = (url) => {
        window.open(String(url), "_blank")
    }

    // specific to electron shit
    static _remote = null
    static SetRemoteHandler = (handler) => {
        Util._remote = handler
    }
    static RemoteRequest = (key, value) => {
        try {
            if (!Util._remote) throw new Error("Remote was not set before sending request. Set the remote using Util.SetRemoteHandler()")
            return Util._remote.invoke(String(key), String(value))
        } catch (err) {
            throw new Error("Remote didn't recieve request for " + key + " (" + value + " was missed!) due to " + String(err))
        }
    }
    static DisplayMessage = (data) => {
        try {
            Util.RemoteRequest("showDialog", JSON.stringify(data))
        } catch (err) {
            alert("Failed to display MessageData using RemoteRequest in Util: " + String(err))
        }
    }
    static QuitApplication = () => {
        try {
            Util.RemoteRequest("quitApp", "")
        } catch (err) {
            alert("Failed to quit application using RemoteRequest in Util: " + String(err))
        }
    }
    static SetWindowProgress = (precentage) => {
        try {
            Util.RemoteRequest("setProgress", String(precentage))
        } catch (err) {
            throw new Error("Failed to set window progress using RemoteRequest in Util: " + String(err))
        }
    }
    static DisplayClosingError = (stack) => {
        try {
            const result = Util.DisplayMessage({
                type: "error",
                buttons: ["&Exit the process"],
                title: "Error",
                message: "The program has ran into an error and needs to close.",
                detail: String(stack),
                normalizeAccessKeys: true
            })
            return Util.QuitApplication()
        } catch (err) {
            alert("Error message failed to display. The program will be closed. " + String(err))
            Util.QuitApplication()
        }
    }
    static AskForFile = (accept, directories, allowMultipleFiles) => {
        try {
            return new Promise((resolve, reject) => {
                const props = [
                    "openFile",
                    "showHiddenFiles"
                ]
                if (directories) props.push("openDirectory")
                if (allowMultipleFiles) props.push("multiSelections")
                Util.RemoteRequest("showOpenDialog", JSON.stringify({
                    title: "Select a " + (directories ? "folder" : "file"),
                    filters: accept,
                    properties: props,
                    normalizeAccessKeys: true
                })).then(result => {
                    if (result.canceled) return reject("NotSelected")
                    if (directories) {
                        return resolve(result.filePaths)
                    }
                    const files = []
                    // should end up like
                    // [
                    //     {
                    //         name: FileDataToSend.name,
                    //         size: FileDataToSend.size,
                    //         type: FileDataToSend.type,
                    //         date: new Date(FileDataToSend.lastModified),
                    //         content: e.target.result
                    //     }
                    // ]
                    let amountOfFiles = result.filePaths.length
                    for (let i = 0; i < amountOfFiles; i++) {
                        const fileObject = {}
                        Util.PCall(function () {
                            Util.SetWindowProgress((i + 1) / amountOfFiles)
                        })
                        const path = result.filePaths[i]
                        fileObject.name = String(path).split('\\').pop().split('/').pop()
                        fileObject.path = String(path)
                        fs.stat(path, (err, stats) => {
                            if (err) return alert("Could not get details for " + path + "; " + String(err))
                            fileObject.size = stats.size
                            fileObject.type = fileObject.name.replace(".", "/")
                            fileObject.date = new Date(stats.birthtime)
                        })
                        fs.readFile(path, "utf8", (err, data) => {
                            if (err) return alert("Could not read " + path + "; " + String(err))
                            fileObject.content = data
                        })
                        files.push(fileObject)
                    }
                    resolve(files)
                    Util.SetWindowProgress(-1)
                })
            })
        } catch (err) {
            Util.DisplayClosingError("Failed to ask for file using RemoteRequest in Util: " + String(err))
        }
    }
    static GrabFile = (path) => {
        try {
            return new Promise((resolve, reject) => {
                const files = []
                const fileObject = {}
                Util.PCall(function () {
                    Util.SetWindowProgress(0.5)
                })
                fileObject.name = String(path).split('\\').pop().split('/').pop()
                fileObject.path = String(path)
                fs.stat(path, (err, stats) => {
                    if (err) return alert("Could not get details for " + path + "; " + String(err))
                    fileObject.size = stats.size
                    fileObject.type = fileObject.name.replace(".", "/")
                    fileObject.date = new Date(stats.birthtime)
                })
                fs.readFile(path, "utf8", (err, data) => {
                    if (err) return alert("Could not read " + path + "; " + String(err))
                    fileObject.content = data
                })
                files.push(fileObject)
                resolve(files[0])
                Util.SetWindowProgress(-1)
            })
        } catch (err) {
            Util.DisplayClosingError("Failed to grab file; " + String(err))
        }
    }
}

module.exports = Util