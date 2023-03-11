const fs = require("fs")
const Util = require("./utilities")

class Settings {
    static filePath = "./settings.stsf"
    static fileExists() {
        return new Promise((resolve, reject) => {
            fs.readFile(Settings.filePath, err => {
                if (err) return resolve(false)
                resolve(true)
            })
        })
    }
    static reset() {
        return new Promise((resolve, reject) => {
            fs.writeFile(Settings.filePath, "{}", "utf8", err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }
    static get(key) {
        return new Promise((resolve, reject) => {
            Settings.fileExists().then(exists => {
                if (!exists) {
                    Settings.reset()
                    resolve(null)
                } else {
                    fs.readFile(Settings.filePath, "utf8", (err, data) => {
                        if (err) return reject(err)
                        resolve(Util.IsJson(data) ? JSON.parse(data)[key] : null)
                    })
                }
            })
        })
    }
    static set(key, value) {
        return new Promise((resolve, reject) => {
            Settings.fileExists().then(exists => {
                if (!exists) {
                    const o = {}
                    o[key] = value
                    fs.writeFile(Settings.filePath, JSON.stringify(o), "utf8", err => {
                        if (err) return reject(err)
                        resolve()
                    })
                } else {
                    fs.readFile(Settings.filePath, "utf8", (err, data) => {
                        if (err) return reject(err)
                        const fileData = Util.IsJson(data) ? JSON.parse(data) : {}
                        fileData[key] = value
                        fs.writeFile(Settings.filePath, JSON.stringify(fileData), "utf8", err => {
                            if (err) return reject(err)
                            resolve()
                        })
                    })
                }
            })
        })
    }
    static remove(key) {
        return new Promise((resolve, reject) => {
            Settings.fileExists().then(exists => {
                if (!exists) {
                    Settings.reset()
                    resolve()
                } else {
                    fs.readFile(Settings.filePath, "utf8", (err, data) => {
                        if (err) return reject(err)
                        const fileData = Util.IsJson(data) ? JSON.parse(data) : {}
                        if (fileData.hasOwnProperty(key)) {
                            delete fileData[key]
                        }
                        fs.writeFile(Settings.filePath, JSON.stringify(fileData), "utf8", err => {
                            if (err) return reject(err)
                            resolve()
                        })
                    })
                }
            })
        })
    }
}

module.exports = Settings