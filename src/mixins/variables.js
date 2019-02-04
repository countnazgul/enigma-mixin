const objectDefinitions = require('./object-definitions.js');

async function getAllVariables({ showSession = false, showConfig = false, showReserved = false } = {}) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession
    objProp.qShowConfig = showConfig
    objProp.qShowReserved = showReserved

    let sessionObj = await _this.api.createSessionObject(objProp)
    let sessionObjLayout = await sessionObj.getLayout()
    return sessionObjLayout.qVariableList.qItems
}

async function updateVariable(variable) {
    let variableContent = await _this.api.getVariableById(variable.qInfo.qId)
    let newContent = await variableContent.setProperties(variable)

    return newContent
}

async function createVariable({ variableName, variableComment = '', variableDefinition }) {
    let varProps = {
        "qInfo": {
            "qType": "variable"
        },
        "qName": variableName,
        "qComment": variableComment,
        "qDefinition": variableDefinition
    }

    let result = await _this.api.createVariableEx(varProps)

    return result
}


module.exports = {
    getAllVariables,
    updateVariable,
    createVariable
}
