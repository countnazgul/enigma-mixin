const objectDefinitions = require('./object-definitions.js')

async function iGetSelectionsNative(qDoc) {
    try {
        let sessionObj = await qDoc.createSessionObject(objectDefinitions.sessionList)
        let selections = await sessionObj.getLayout()
        return selections
    } catch (e) {
        return { error: e.message }
    }

}

async function mGetSelectionsCurrNative() {
    try {
        let selections = await iGetSelectionsNative(this)
        return selections
    } catch (e) {
        return { error: e.message }
    }
}

/**
 * Get current selections
 */
async function mGetSelectionsCurr() {
    try {
        let selections = await iGetSelectionsNative(this)

        let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
            return s.qField
        })

        return { selections: selections.qSelectionObject.qSelections, fields: fieldsSelected }
    } catch (e) {
        return { error: e.message }
    }
}

/**
 * Select value(s) in a field
 * @param {string} fieldName - Name of the field
 * @param {array} values - String array with the values to be selected
 * @param {boolean} [toggle=false] toggle - How to apply the selection
 */
async function mSelectInField({ fieldName, values, toggle = false }) {

    try {
        let field = await this.getField(fieldName)

        let valuesToSelect = values.map(function (v) {
            return {
                qText: v
            }
        })

        try {
            let selection = await field.selectValues({ qFieldValues: valuesToSelect, qToggleMode: toggle })
            return selection
        } catch (e) {
            return { error: e.message }
        }
    } catch (e) {
        return { error: e.message }
    }
}

module.exports = {
    mGetSelectionsCurr,
    mGetSelectionsCurrNative,
    mSelectInField
}
