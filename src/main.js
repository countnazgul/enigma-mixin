const qVariables = require('./mixins/qVariables.js')
const qSelections = require('./mixins/qSelections.js')
const qTablesAndFields = require('./mixins/qTablesAndFields.js')

const docMixin = {
    types: ['Doc'],
    init(args) {

    },
    extend: {
        ...qSelections,
        ...qTablesAndFields,
        ...qVariables
    },
};

module.exports = docMixin