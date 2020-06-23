const objectDefinitions = require('./object-definitions.js')
const { handlePromise } = require('../../lib/helpers');

async function mGetTablesAndFields() {

    let [tables, error] = await handlePromise(this.getTablesAndKeys({}, {}, 0, true, false))
    if (error) throw new Error(error.message)

    return tables.qtr.map(function (t) {
        return t.qFields.map(function (f) {
            return { table: t.qName, field: f.qName }
        })
    }).flat()
}

async function mGetTables() {
    let [qTables, qTablesError] = await handlePromise(this.getTablesAndKeys({}, {}, 0, true, false))
    if (qTablesError) throw new Error(qTablesError.message)

    return qTables.qtr.map((t) => t.qName)
}

async function mGetFields() {
    let [qTables, qTablesError] = await handlePromise(this.getTablesAndKeys({}, {}, 0, true, false))
    if (qTablesError) throw new Error(qTablesError.message)

    return qTables.qtr.map(function (t) {
        return t.qFields.map(function (f) {
            return f.qName
        })
    }).flat()
}

async function mGetListbox(fieldName) {
    let lbDef = objectDefinitions.listBox
    lbDef.field.qListObjectDef.qDef.qFieldDefs = [fieldName]

    let [sessionObj, sessionObjErr] = await handlePromise(this.createSessionObject(lbDef))
    if (sessionObjErr) throw new Error(sessionObjErr.message)

    let [layout, layoutError] = await handlePromise(sessionObj.getLayout())
    if (layoutError) throw new Error(layoutError.message)

    return {
        sessionObj,
        layout
    }
}

module.exports = {
    mGetTablesAndFields,
    mGetTables,
    mGetFields,
    mGetListbox
} 