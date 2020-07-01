const { handlePromise } = require('../../lib/helpers');

async function mExtensionObjectsAll() {
    let [allInfos, error] = await handlePromise(this.getAllInfos())
    if (error) throw new Error(error.message)

    let [props, propsError] = await handlePromise(this.getAppProperties())
    if (propsError) throw new Error(propsError.message)

    return await filterOnlyExtensionObjects(this, props, allInfos)
}

async function filterOnlyExtensionObjects(qDoc, props, allObjects) {
    return await Promise.all(allObjects.map(async function (extObj) {
        let isReallyExtension = await realExtensionCheck(qDoc, extObj.qId)

        if (isReallyExtension.isExtension) {
            return {
                appId: qDoc.id,
                appName: props.qTitle,
                objId: isReallyExtension.qObjProps.qInfo.qId,
                objType: isReallyExtension.qObjProps.qInfo.qType,
                extName: isReallyExtension.qObjProps.extensionMeta.name,
                extVersion: isReallyExtension.qObjProps.version,
                extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
                extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
                extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
                qProps: isReallyExtension.qObjProps
            }
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
    let nativeObjectTypes = [
        "barchart",
        "boxplot",
        "combochart",
        "distributionplot",
        "gauge",
        "histogram",
        "kpi",
        "linechart",
        "piechart",
        "pivot-table",
        "scatterplot",
        "table",
        "treemap",
        "extension",
        "map",
        "listbox",
        "filterpane",
        "title",
        "paragraph"
    ]

    let [qObj, qObjError] = await handlePromise(qDoc.getObject(objId))
    if (qObjError) return { isExtension: false }

    let [qObjProps, qObjPropsError] = await handlePromise(qObj.getProperties())
    if (qObjPropsError) throw new Error(qObjPropsError.message)
    if (!qObjProps.visualization) return { isExtension: false }

    let isNative = nativeObjectTypes.indexOf(qObjProps.visualization)
    return { qObjProps, isExtension: (isNative == -1 && qObjProps.extensionMeta) ? true : false }
}

module.exports = {
    mExtensionObjectsAll
}