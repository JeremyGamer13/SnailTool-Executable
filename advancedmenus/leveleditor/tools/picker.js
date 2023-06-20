class PickerTool {
    static Icon = "../images/tools/picker.png"
    static Name = "picker"
    static Details = "Click on any object to select and copy it's properties."

    static Dependencies = ["SwitchObject", "SkipPlaceTick"]
    static LoadedDependencies = {}

    static OnEquip() {

    }
    static OnUnequip() {

    }
    static OnTileClick(toolInheritedData, tile) {
        console.log(tile, toolInheritedData)
        PickerTool.LoadedDependencies.SkipPlaceTick()
        PickerTool.LoadedDependencies.SwitchObject(tile, toolInheritedData)
        PickerTool.LoadedDependencies.SkipPlaceTick()
    }
}
module.exports = PickerTool