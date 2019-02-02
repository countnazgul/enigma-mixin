const objectDefinitions = require('./object-definitions.js');

async function getAllVariables({ qDoc, showSession = false, showConfig = false, showReserved = false }) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession,
        objProp.qShowConfig = showConfig,
        objProp.qShowReserved = showReserved

    let sessionObj = await qDoc.createSessionObject(objProp)
    let sessionObjLayout = await sessionObj.getLayout()
    return sessionObjLayout
}

async function updateVariable({ qDoc, variable }) {
    let variableContent = await qDoc.getVariableById(variable.qInfo.qId)
    let newContent = await variableContent.setProperties(variable)

    return newContent
}

async function createVariable({ qDoc, variableName, variableComment = '', variableDefinition }) {
    let varProps = {
        "qInfo": {
            "qType": "variable"
        },
        "qName": variableName,
        "qComment": variableComment,
        "qDefinition": variableDefinition
    }

    let result = await doc.createVariableEx(varProps)

    return result
}


module.exports = {
    getAllVariables,
    updateVariable,
    createVariable
}
