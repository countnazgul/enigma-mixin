const objectDefinitions = require('./object-definitions.js')

async function mGetTablesAndFields() {

    try {
        let tables = await this.getTablesAndKeys({}, {}, 0, true, false)

        let f = [];

        if (tables.qtr.length == 0) {
            return f
        } else {
            for (let table of tables.qtr) {
                for (let field of table.qFields) {
                    f.push({ table: table.qName, field: field.qName })
                }
            }

            return f
        }
    } catch (e) {
        throw new Error(e.message)
    }
}

async function mGetTables() {
    try {
        let qTables = await this.getTablesAndKeys({}, {}, 0, true, false)

        let tables = [];

        if (qTables.length == 0) {
            return tables
        } else {
            for (let table of qTables.qtr) {
                tables.push(table.qName)
            }

            return tables
        }
    } catch (e) {
        throw new Error(e.message)
    }
}

async function mGetFields() {
    try {

        let qTables = await this.getTablesAndKeys({}, {}, 0, true, false)

        let fields = [];

        for (let table of qTables.qtr) {
            for (let field of table.qFields) {
                fields.push(field.qName)
            }
        }

        return fields
    } catch (e) {
        throw new Error(e.message)
    }
}

async function mGetListbox(fieldName) {

    try {
        let lbDef = objectDefinitions.listBox
        lbDef.field.qListObjectDef.qDef.qFieldDefs.push(fieldName)
        let sessionObj = await this.createSessionObject(lbDef)
        let fieldValues = await sessionObj.getLayout()
        return fieldValues.field.qListObject
    } catch (e) {
        throw new Error(e.message)
    }

}

module.exports = {
    mGetTablesAndFields,
    mGetTables,
    mGetFields,
    mGetListbox
} 