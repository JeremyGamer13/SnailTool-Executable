class DeleteTool {
    static Icon = "../images/tools/trash.png"
    static Name = "delete"
    static Details = "Click on any object to remove it from the level."

    static OnEquip() {

    }
    static OnUnequip() {

    }
    static OnTileClick(toolInheritedData, tile, x, y, tileWidth, tileHeight, rotation, corrupted, addToData, objIndex, index, img, editLevelData) {
        if (addToData == false) {
            editLevelData.objects[tile].splice(objIndex, 1)
        } else {
            editLevelData.objects[tile].splice(index, 1)
        }
        return img.remove()
    }
}
module.exports = DeleteTool