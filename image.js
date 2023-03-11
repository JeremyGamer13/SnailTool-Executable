const Jimp = require("jimp")
const Util = require("./utilities")

const directory = "./images/imagegenerator"

class ImageGenerator {
    _eventFuncs = {
        "GLOWGEN": [],
        "BUFFERGEN": [],
        "OBJECTADD": [],
        "WIREADD": [],
        "FINISHED": [],
        "ERROR": [],
    }
    constructor() {
        // nothing currently
    }

    attachEventFunction(_event, func) {
        const event = this._eventFuncs[_event]
        if (!event) return
        event.push(func)
    }
    fireEvent(_event, ...args) {
        const event = this._eventFuncs[_event]
        if (!event) return
        for (let i = 0; i < event.length; i++) {
            const func = event[i]
            func(...args)
        }
    }
    removeEventFunction(_event, func) {
        const event = this._eventFuncs[_event]
        if (!event) return
        event.splice(event.indexOf(func), 1)
    }
    removeAllEventFunctions(event) {
        this._eventFuncs[event] = []
    }

    static readImageWithBackup(path, backupPath) {
        return new Promise((resolve, reject) => {
            Jimp.read(path, (err, image1) => {
                if (err) {
                    Jimp.read(backupPath, (err, image2) => {
                        if (err) reject(err)
                        resolve(image2)
                    })
                    return
                }
                resolve(image1)
            })
        })
    }
    static async glowImageBuffer(buffer) {
        return new Promise((resolve, reject) => {
            Jimp.read(buffer, async (err, image) => {
                if (err) {
                    reject(err)
                    return
                }
                // console.log("blurring image")
                image.blur(12)
                // console.log("reading original buffer")
                const JimpImageC = await Jimp.read(buffer)
                // console.log("compositing original buffer")
                image.composite(JimpImageC, 0, 0, {
                    mode: Jimp.BLEND_ADD,
                    opacitySource: 1,
                    opacityDest: 1
                })
                // console.log("saving")
                image.getBufferAsync(Jimp.MIME_PNG).then(buffer => resolve(buffer)).catch(reject)
            })
        })
    }
    static getDistance(x1, y1, x2, y2) {
        let y = x2 - x1
        let x = y2 - y1
        return Math.sqrt(x * x + y * y)
    }
    static directionFromTo(x1, y1, x2, y2) {
        return (Math.atan((x2 - x1) / (y2 - y1)) + (180 * (y1 > y2)))
    }
    static makeLineImage(color, x, y, dx, dy) {
        return new Promise((resolve, reject) => {
            const distance = ImageGenerator.getDistance(x, y, dx, dy)
            const rotation = ImageGenerator.directionFromTo(x, y, dx, dy)
            new Jimp(distance, 3, color, (err, image) => {
                if (err) return reject(err)
                image.rotate(rotation)
                resolve(image)
            })
        })
    }

    async createLevelPreview(object) {
        return new Promise((resolve, reject) => {
            Jimp.read(directory + '/preview/background.png', async (err, baseImage) => {
                // console.log("got bg")
                if (err) {
                    reject(err)
                    this.fireEvent("ERROR", err, "Failed to grab starting image")
                    return
                }
                baseImage.resize(1920 * object.options.room_xscale, 1080 * object.options.room_yscale)
                for (let _i = 0; _i < 2; _i++) {
                    const scaleAmount = [object.options.room_xscale, object.options.room_yscale]
                    for (let i = 0; i < 24 * scaleAmount[_i]; i++) {
                        const square = await Jimp.read(`${directory}/preview/background_square.png`)
                        square.opacity(0.12)
                        const x = Math.round(Math.random() * ((1920 + 128) * object.options.room_xscale)) - 64
                        const y = Math.round(Math.random() * ((1080 + 128) * object.options.room_yscale)) - 64
                        baseImage.blit(square, x, y)
                    }
                }
                const objects = object.objects
                for (let i = 0; i < Object.getOwnPropertyNames(objects).length; i++) {
                    const objectName = Object.getOwnPropertyNames(objects)[i]
                    // console.log(objectName)
                    for (let i = 0; i < objects[objectName].length; i++) {
                        const object = objects[objectName][i]
                        // console.log(object)
                        const image = await ImageGenerator.readImageWithBackup(`${directory}/preview/${objectName}.png`, `${directory}/preview/unknown.png`)
                        const placementDetails = {
                            position: {
                                x: 0,
                                y: 0
                            },
                            scale: {
                                x: 60,
                                y: 60
                            },
                            rotation: 0,
                            hue: 0
                        }
                        if (object.position) {
                            placementDetails.position.x = object.position.x
                            placementDetails.position.y = object.position.y
                        }
                        if (object.scale) {
                            placementDetails.scale.x = object.scale.x * 60
                            placementDetails.scale.y = object.scale.y * 60
                        }
                        if (object.direction != null) {
                            placementDetails.rotation = object.direction
                        }
                        // console.log(image)
                        Util.PCall(() => {
                            image.resize(placementDetails.scale.x, placementDetails.scale.y)
                            image.rotate(placementDetails.rotation)
                            baseImage.blit(image, placementDetails.position.x, placementDetails.position.y)
                            this.fireEvent("OBJECTADD", i + 1, objects[objectName].length, objectName)
                        }, err => {
                            this.fireEvent("ERROR", err, `Failed to place ${objectName}`)
                        })
                    }
                }
                const wires = object.wires
                for (let i = 0; i < wires.length; i++) {
                    const wire = wires[i]
                    // { object: objectType, id: objectIndex, target: { object: objectType, id: objectIndex } }
                    const object1 = objects[wire.object][wire.id]
                    const object2 = objects[wire.target.object][wire.target.id]

                    const line = await ImageGenerator.makeLineImage("#00AAFF", object1.position.x, object1.position.y, object2.position.x, object2.position.y)
                    baseImage.blit(line, object1.position.x, object1.position.y)
                    this.fireEvent("WIREADD", i + 1, wires.length)
                }
                this.fireEvent("BUFFERGEN")
                baseImage.getBufferAsync(Jimp.MIME_PNG).then(buffer => {
                    this.fireEvent("GLOWGEN")
                    ImageGenerator.glowImageBuffer(buffer).then(buffer => {
                        this.fireEvent("FINISHED")
                        resolve(buffer)
                    }).catch(reject)
                }).catch(reject)
            })
        })
    }
}
module.exports = ImageGenerator