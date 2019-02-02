const objectDefinitions = require('./object-definitions.js')

async function getCurrSelectionFields() {
    let sessionObj = await _this.api.createSessionObject(objectDefinitions.sessionList)
    let selections = await sessionObj.getLayout()
    return selections
}

async function getCurrentSelections() {

    let selections = await getCurrSelectionFields()

    let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
        return s.qField
    })

    // let fields = await getSelectionFields(doc, fieldsSelected)
    return { selections: selections.qSelectionObject.qSelections, fields: fieldsSelected }
}

async function selectInField({ fieldName, values, toggle = false }) {
    let field = await _this.api.getField(fieldName)

    let valuesToSelect = values.map(function (v) {
        return {
            qText: v
        }
    })

    try {
        let selection = await field.selectValues({ qFieldValues: valuesToSelect, qToggleMode: toggle })
        return selection
    } catch(e) {
        console.log(e.message)
        return false
    }
}

module.exports = {
    getCurrSelectionFields,
    selectInField,
    getCurrentSelections
}
