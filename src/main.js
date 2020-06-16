const qVariables = require('./mixins/doc/qVariables.js')
const qSelections = require('./mixins/doc/qSelections.js')
const qTablesAndFields = require('./mixins/doc/qTablesAndFields.js')
const extensionObjects = require('./mixins/doc/extension-objects.js')
const unbuildVariables = require('./mixins/doc/unbuild/variables.js')
const unbuildScript = require('./mixins/doc/unbuild/script.js')
const unbuildAppProperties = require('./mixins/doc/unbuild/appProperties.js')
const unbuildConnections = require('./mixins/doc/unbuild/connections.js')
const unbuildEntities = require('./mixins/doc/unbuild/entities.js')
const build = require('./mixins/doc/build.js')

const docMixin = [
    {
        types: ['Doc'],
        init(args) {

        },
        extend: {
            ...qSelections,
            ...qTablesAndFields,
            ...qVariables,
            ...extensionObjects,
            ...unbuildVariables,
            ...unbuildScript,
            ...unbuildAppProperties,
            ...unbuildConnections,
            ...unbuildEntities,
            ...build
        },
    }
]

module.exports = docMixin