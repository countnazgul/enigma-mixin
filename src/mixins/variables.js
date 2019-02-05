const objectDefinitions = require('./object-definitions.js');

async function mGetAllVariables({ showSession = false, showConfig = false, showReserved = false } = {}) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession
    objProp.qShowConfig = showConfig
    objProp.qShowReserved = showReserved

    let sessionObj = await this.createSessionObject(objProp)
    let sessionObjLayout = await sessionObj.getLayout()
    return sessionObjLayout.qVariableList.qItems
}

async function mUpdateVariable(variable) {
    let variableContent = await this.getVariableById(variable.qInfo.qId)
    let newContent = await variableContent.setProperties(variable)

    return newContent
}

async function mCreateVariable({ variableName, variableComment = '', variableDefinition }) {
    let _this = this
    let varProps = {
        "qInfo": {
            "qType": "variable"
        },
        "qName": variableName,
        "qComment": variableComment,
        "qDefinition": variableDefinition
    }

    let result = await _this.createVariableEx(varProps)

    return result
}


module.exports = {
    mGetAllVariables,
    mUpdateVariable,
    mCreateVariable
}
