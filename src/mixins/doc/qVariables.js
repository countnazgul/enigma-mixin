const objectDefinitions = require('./object-definitions.js');
const { handlePromise } = require('../../lib/helpers');

async function mVariableGetAll(showSession = false, showConfig = false, showReserved = false) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession
    objProp.qShowConfig = showConfig
    objProp.qShowReserved = showReserved

    let [sessionObj, sessionObjError] = await handlePromise(this.createSessionObject(objProp))
    if (sessionObjError) throw new Error(sessionObjError.message)

    let [layout, layoutError] = await handlePromise(sessionObj.getLayout())
    if (layoutError) throw new Error(layoutError.message)

    return layout.qVariableList.qItems
}

async function mVariableUpdateById(id, definition, comment = undefined) {
    let [variable, variableError] = await handlePromise(this.getVariableById(id))
    if (variableError) throw new Error(variableError.message)

    let [variableProps, variablePropsError] = await handlePromise(variable.getProperties())
    if (variablePropsError) throw new Error(variablePropsError.message)

    variableProps.qDefinition = definition
    if (comment) variableProps.qComment = comment

    let [setProps, setPropsError] = await handlePromise(variable.setProperties(variableProps))
    if (setPropsError) throw new Error(setPropsError.message)

    let [newProps, newPropsError] = await handlePromise(variable.getProperties())
    if (newPropsError) throw new Error(newPropsError.message)

    return newProps
}

async function mVariableUpdateByName(name, definition, comment = undefined) {
    let [variable, variableError] = await handlePromise(this.getVariableByName(name))
    if (variableError) throw new Error(variableError.message)

    let [variableProps, variablePropsError] = await handlePromise(variable.getProperties())
    if (variablePropsError) throw new Error(variablePropsError.message)

    variableProps.qDefinition = definition
    if (comment) variableProps.qComment = comment

    let [setProps, setPropsError] = await handlePromise(variable.setProperties(variableProps))
    if (setPropsError) throw new Error(setPropsError.message)

    let [newProps, newPropsError] = await handlePromise(variable.getProperties())
    if (newPropsError) throw new Error(newPropsError.message)

    return newProps
}

async function mVariableCreate(name = '', definition = '', comment = '') {
    let varProps = {
        "qInfo": {
            "qType": "variable"
        },
        "qName": name,
        "qDefinition": definition,
        "qComment": comment
    }

    let [created, createdError] = await handlePromise(this.createVariableEx(varProps))
    if (createdError) throw new Error(createdError.message)

    let [props, propsError] = await handlePromise(created.getProperties())
    if (propsError) throw new Error(propsError.message)

    return props
}

module.exports = {
    mVariableGetAll,
    mVariableUpdateById,
    mVariableUpdateByName,
    mVariableCreate
}
