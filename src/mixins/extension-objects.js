const nonExtensionObjects = [
    "barchart",
    "bookmark",
    "combochart",
    "dimension",
    "embeddedsnapshot",
    "filterpane",
    "gauge",
    "kpi",
    "linechart",
    "listbox",
    "LoadModel",
    "map",
    "masterobject",
    "measure",
    "piechart",
    "pivot-table",
    "scatterplot",
    "sheet",
    "slide",
    "slideitem",
    "snapshot",
    "story",
    "StringExpression",
    "table",
    "treemap"
]

async function mGetAllExtensionObjects() {
    let allInfos = await this.getAllInfos()
    let extensionObjects = await filterOnlyExtensionObjects(this, allInfos)

    return extensionObjects
}



async function filterOnlyExtensionObjects(qDoc, allObjects) {
    let possibleExtensionObjects = allObjects.filter(function (o) {
        return nonExtensionObjects.indexOf(o.qType) == -1
    })

    let realExtensionObjects = []
    if (possibleExtensionObjects.length > 0) {
        for (let extObj of possibleExtensionObjects) {
            let isReallyExtension = await realExtensionCheck(qDoc, extObj.qId)
            if (isReallyExtension.isExtension) {
                realExtensionObjects.push({
                    appName: qDoc.id,
                    objId: isReallyExtension.qObjProps.qInfo.qId,
                    objType: isReallyExtension.qObjProps.qInfo.qType,
                    extName: isReallyExtension.qObjProps.extensionMeta.name,
                    extVersion: isReallyExtension.qObjProps.version,
                    extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
                    extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
                    extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
                    qProps: isReallyExtension.qObjProps
                })
            }
        }

        return realExtensionObjects
    } else {
        return []
    }
}

const realExtensionCheck = async function (qDoc, objId) {
    let isExtension = false
    let qObjProps = {}

    try {
        let qObj = await qDoc.getObject(objId)

        qObjProps = await qObj.getProperties()

        if (qObjProps.extensionMeta) {
            isExtension = true
        }

    } catch (e) {
        throw new Error(e.message)
    }
    return { qObjProps, isExtension }
}

module.exports = {
    mGetAllExtensionObjects
}