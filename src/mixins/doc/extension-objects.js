const { handlePromise } = require('../../lib/helpers');

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
    let [allInfos, error] = await handlePromise(this.getAllInfos())
    if (error) throw new Error(error.message)

    return await filterOnlyExtensionObjects(this, allInfos)
}


async function filterOnlyExtensionObjects(qDoc, allObjects) {
    let possibleExtensionObjects = allObjects.filter(function (o) {
        return nonExtensionObjects.indexOf(o.qType) == -1
    })

    return await Promise.all(possibleExtensionObjects.map(async function (extObj) {
        let isReallyExtension = await realExtensionCheck(qDoc, extObj.qId)

        if (isReallyExtension.isExtension) return {
            appName: qDoc.id,
            objId: isReallyExtension.qObjProps.qInfo.qId,
            objType: isReallyExtension.qObjProps.qInfo.qType,
            extName: isReallyExtension.qObjProps.extensionMeta.name,
            extVersion: isReallyExtension.qObjProps.version,
            extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
            extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
            extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
            qProps: isReallyExtension.qObjProps
        }
    })).then(function (o) {
        // make sure we filter out all object which are not 
        // native object but are not extensions as well 
        return o.filter(function (a) {
            return a != undefined
        })
    })
}

const realExtensionCheck = async function (qDoc, objId) {
    let isExtension = false

    let [qObj, qObjError] = await handlePromise(qDoc.getObject(objId))
    if (qObjError) throw new Error(qObjError.message)

    let [qObjProps, qObjPropsError] = await handlePromise(qObj.getProperties())
    if (qObjPropsError) throw new Error(qObjPropsError.message)

    isExtension = qObjProps.extensionMeta ? true : false

    return { qObjProps, isExtension }
}

module.exports = {
    mGetAllExtensionObjects
}