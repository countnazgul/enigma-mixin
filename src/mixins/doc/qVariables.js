const objectDefinitions = require('./object-definitions.js');

async function mGetVariablesAll({ showSession = false, showConfig = false, showReserved = false } = {}) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession
    objProp.qShowConfig = showConfig
    objProp.qShowReserved = showReserved

    try {
        let sessionObj = await this.createSessionObject(objProp)
        let sessionObjLayout = await sessionObj.getLayout()
        return sessionObjLayout.qVariableList.qItems
    } catch (e) {
        throw new Error(e.message)
    }
}

async function mUpdateVariable(variable) {
    try {
        let variableContent = await this.getVariableById(variable.qInfo.qId)
        let newContent = await variableContent.setProperties(variable)

        return newContent
    } catch (e) {
        throw new Error(e.message)
    }
}

async function mCreateVariable({ name, comment = '', definition }) {

    let varProps = {
        "qInfo": {
            "qType": "variable"
        },
        "qName": name,
        "qComment": comment,
        "qDefinition": definition
    }

    try {
        let result = await this.createVariableEx(varProps)
        return result
    } catch (e) {
        throw new Error(e.message)
    }
}


module.exports = {
    mGetVariablesAll,
    mUpdateVariable,
    mCreateVariable
}
