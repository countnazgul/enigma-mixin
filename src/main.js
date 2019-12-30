const qVariables = require('./mixins/doc/qVariables.js')
const qSelections = require('./mixins/doc/qSelections.js')
const qTablesAndFields = require('./mixins/doc/qTablesAndFields.js')
const extensionObjects = require('./mixins/doc/extension-objects.js')

const docMixin = [
    {
        types: ['Doc'],
        init(args) {

        },
        extend: {
            ...qSelections,
            ...qTablesAndFields,
            ...qVariables,
            ...extensionObjects
        },
    }
]

module.exports = docMixin