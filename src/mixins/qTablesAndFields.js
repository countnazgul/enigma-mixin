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
        return { error: e.message }
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
        return { error: e.message }
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
        return { error: e.message }
    }
}

module.exports = {
    mGetTablesAndFields,
    mGetTables,
    mGetFields
} 