const objectDefinitions = require('./object-definitions.js');
const { handlePromise } = require('../../lib/helpers');

async function mGetVariablesAll({ showSession = false, showConfig = false, showReserved = false } = {}) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession
    objProp.qShowConfig = showConfig
    objProp.qShowReserved = showReserved

    let [sessionObj, sessionObjError] = await handlePromise(this.createSessionObject(objProp))
    if (sessionObjError) throw new Error(sessionObjError.message)

    let [layout, layoutError] = handlePromise(await sessionObj.getLayout())
    if (layoutError) throw new Error(layoutError.message)

    return layout.qVariableList.qItems

}

async function mUpdateVariable(variable) {
    let [variableContent, variableContentError] = await handlePromise(this.getVariableById(variable.qInfo.qId))
    if (variableContentError) throw new Error(variableContentError.message)

    let [newContent, newContentError] = await handlePromise(variableContent.setProperties(variable))
    if (newContentError) throw new Error(newContentError.message)

    return newContent
}

async function mCreateVariable({ name = '', comment = '', definition = '' }) {

    let varProps = {
        "qInfo": {
            "qType": "variable"
        },
        "qName": name,
        "qComment": comment,
        "qDefinition": definition
    }

    let [created, createdError] = await handlePromise(this.createVariableEx(varProps))
    if (createdError) throw new Error(createdError.message)

    return result
}

module.exports = {
    mGetVariablesAll,
    mUpdateVariable,
    mCreateVariable
}
