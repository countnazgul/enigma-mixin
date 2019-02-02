const qVariables = require('./mixins/variables.js')
const qSelections = require('./mixins/selections.js')
const qTablesAndFields = require('./mixins/tables.js')

const docMixin = {
    types: ['Doc'],
    init(args) {
        _this = args
        ConfiguredPromise = args.config.Promise;
    },
    extend: {
        mixin: {
            qVariables,
            qSelections,
            qTablesAndFields
        }
    },
};

module.exports = docMixin