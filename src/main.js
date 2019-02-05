const qVariables = require('./mixins/variables.js')
const qSelections = require('./mixins/selections.js')
const qTablesAndFields = require('./mixins/tables.js')

const docMixin = {
    types: ['Doc'],
    init(args) {
        const api = args;
    },
    extend: {
        ...qSelections,
        ...qTablesAndFields,
        ...qVariables
    },
};

module.exports = docMixin