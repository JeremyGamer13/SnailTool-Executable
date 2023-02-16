class Converter {
    static SnailaxToJSON = (snailax) => {

    }
    static JSONToSnailax = (json) => {

    }
    static LevelEditorToJSON = (leveleditor) => {

    }
    static JSONToLevelEditor = (json) => {

    }
    static SnailaxToLevelEditor = (snailax) => {
        const converted = Converter.SnailaxToJSON(snailax)
        return Converter.JSONToLevelEditor(converted)
    }
    static LevelEditorToSnailax = (leveleditor) => {
        const converted = Converter.LevelEditorToJSON(leveleditor)
        return Converter.JSONToSnailax(converted)
    }
}

module.exports = Converter