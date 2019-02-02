async function getTablesAndKeys(qDoc) {

    let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false)

    let f = [];

    for (let table of tables.qtr) {
        for (let field of table.qFields) {
            f.push({ table: table.qName, field: field.qName })
        }
    }

    return { tables: tables, fields: f }
}

async function getTablesAndFields(qDoc) {
    let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false)

    let f = [];

    for (let table of tables.qtr) {
        for (let field of table.qFields) {
            f.push({ table: table.qName, field: field.qName })
        }
    }

    return f
}

async function getTables(qDoc) {
    let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false)

    let t = [];

    for (let table of tables.qtr) {
        t.push(table.qName)
    }

    return t
}

async function getFields(qDoc) {

    let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false)

    let f = [];

    for (let table of tables.qtr) {
        for (let field of table.qFields) {
            f.push(field.qName)
        }
    }

    return f
}

module.exports = {
    getTablesAndKeys,
    getTablesAndFields,
    getTables,
    getFields
}