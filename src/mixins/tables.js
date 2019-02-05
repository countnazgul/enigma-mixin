// async function getTablesAndKeys() {

//     let tables = await _this.api.getTablesAndKeys({}, {}, 0, true, false)

//     let f = [];

//     for (let table of tables.qtr) {
//         for (let field of table.qFields) {
//             f.push({ table: table.qName, field: field.qName })
//         }
//     }

//     return { tables: tables, fields: f }
// }

async function mGetTablesAndFields() {
    let tables = await this.getTablesAndKeys({}, {}, 0, true, false)

    let f = [];

    for (let table of tables.qtr) {
        for (let field of table.qFields) {
            f.push({ table: table.qName, field: field.qName })
        }
    }

    return f
}

async function mGetTables() {
    let tables = await this.getTablesAndKeys({}, {}, 0, true, false)

    let t = [];

    for (let table of tables.qtr) {
        t.push(table.qName)
    }

    return t
}

async function mGetFields() {

    let tables = await this.getTablesAndKeys({}, {}, 0, true, false)

    let f = [];

    for (let table of tables.qtr) {
        for (let field of table.qFields) {
            f.push(field.qName)
        }
    }

    return f
}

module.exports = {
    // getTablesAndKeys,
    mGetTablesAndFields,
    mGetTables,
    mGetFields
}