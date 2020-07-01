const objectDefinitions = require('./object-definitions.js')
const { handlePromise } = require('../../lib/helpers');

async function iGetSelectionsNative(qDoc) {
    let [sessionObj, sessionObjError] = await handlePromise(qDoc.createSessionObject(objectDefinitions.sessionList))
    if (sessionObjError) throw new Error(sessionObjError.message)

    let [selections, selectionsError] = await handlePromise(sessionObj.getLayout())
    if (selectionsError) throw new Error(selectionsError.message)

    let [destroy, destroyError] = await handlePromise(qDoc.destroySessionObject(sessionObj.id))
    if (destroyError) throw new Error(destroyError.message)

    return selections
}

async function mSelectionsAll() {
    let [selections, error] = await handlePromise(iGetSelectionsNative(this))
    if (error) throw new Error(error.message)

    return selections.qSelectionObject
}

async function mSelectionsFields() {
    let [selections, error] = await handlePromise(iGetSelectionsNative(this))
    if (error) throw new Error(error.message)

    let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
        return s.qField
    })

    return fieldsSelected
}

async function mSelectionsSimple(groupByField = false) {
    let [selections, error] = await handlePromise(iGetSelectionsNative(this))
    if (error) throw new Error(error.message)

    if (!groupByField)
        return selections.qSelectionObject.qSelections.map(function (s) {
            return s.qSelectedFieldSelectionInfo.map(function (f) {
                return { field: s.qField, value: f.qName }
            })
        }).flat()


    return selections.qSelectionObject.qSelections.map(function (s) {
        let values = s.qSelectedFieldSelectionInfo.map(function (f) {
            return f.qName
        })

        return { field: s.qField, values }
    })
}

async function mSelectInField(fieldName, values, toggle = false) {
    let lbDef = objectDefinitions.listBox
    lbDef.field.qListObjectDef.qDef.qFieldDefs = [fieldName]
    lbDef.qInfo.qType = "session-listbox"

    let [sessionObj, sessionObjErr] = await handlePromise(this.createSessionObject(lbDef))
    if (sessionObjErr) throw new Error(sessionObjErr.message)

    let [layout, layoutError] = await handlePromise(sessionObj.getLayout())
    if (layoutError) throw new Error(layoutError.message)

    let index = layout.field.qListObject.qDataPages[0].qMatrix.filter(function (m) {
        return values.indexOf(m[0].qText) > -1
    }).map(function (e) {
        return e[0].qElemNumber
    })

    let [selection, selectionError] = await handlePromise(sessionObj.selectListObjectValues('/field/qListObjectDef', index, toggle))
    if (selectionError) throw new Error(selectionError.message)

    let [destroy, destroyError] = await handlePromise(this.destroySessionObject(sessionObj.id))
    if (destroyError) throw new Error(destroyError.message)

    return selection
}

module.exports = {
    mSelectionsAll,
    mSelectionsFields,
    mSelectionsSimple,
    mSelectInField
}
