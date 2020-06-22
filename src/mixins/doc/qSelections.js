const objectDefinitions = require('./object-definitions.js')
const { handlePromise } = require('../../lib/helpers');

async function iGetSelectionsNative(qDoc) {
    let [sessionObj, sessionObjError] = await handlePromise(qDoc.createSessionObject(objectDefinitions.sessionList))
    if (sessionObjError) throw new Error(error.sessionObjError)

    let [selections, selectionsError] = await handlePromise(sessionObj.getLayout())
    if (selectionsError) throw new Error(error.selectionsError)

    return selections
}

async function mGetSelectionsCurrNative() {
    let [selections, error] = await handlePromise(iGetSelectionsNative(this))
    if (error) throw new Error(error.message)

    return selections
}

/**
 * Get current selections
 */
async function mGetSelectionsCurr() {
    let [selections, error] = await handlePromise(iGetSelectionsNative(this))
    if (error) throw new Error(error.message)

    let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
        return s.qField
    })

    return { selections: selections.qSelectionObject.qSelections, fields: fieldsSelected }
}

/**
 * Select value(s) in a field
 * @param {string} fieldName - Name of the field
 * @param {array} values - String array with the values to be selected
 * @param {boolean} [toggle=false] toggle - How to apply the selection
 */
async function mSelectInField({ fieldName, values, toggle = false }) {

    let [field, fieldError] = await handlePromise(this.getField(fieldName))
    if (fieldError) if (error) throw new Error(error.fieldError)

    let valuesToSelect = values.map(function (v) {
        return {
            qText: v
        }
    })

    let [selection, selectionError] = await handlePromise(field.selectValues({ qFieldValues: valuesToSelect, qToggleMode: toggle }))
    if (selectionError) throw new Error(error.selectionError)

    return selection

}

module.exports = {
    mGetSelectionsCurr,
    mGetSelectionsCurrNative,
    mSelectInField
}
