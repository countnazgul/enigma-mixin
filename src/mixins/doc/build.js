const { handlePromise } = require('../../lib/helpers');

async function mBuild({
    variables = [],
    script = false,
    appProperties = {},
    connections = [],
    measures = [],
    dimensions = [],
    objects = [] }) {

    let [appConnections, error] = await handlePromise(this.getConnections())
    if (error) throw new Error('build: cannot get app connections')

    return Promise.all([
        await processMeasures(measures, this),
        await processDimensions(dimensions, this),
        await processVariables(variables, this),
        await processScript(script, this),
        await processAppProperties(appProperties, this),
        await processConnections(appConnections, connections, this),
        await processObjects(objects, this)
    ]).then(function (d) {
        return {
            measures: d[0],
            dimensions: d[1],
            variables: d[2],
            script: d[3],
            appProperties: d[4],
            connections: d[5],
            objects: d[6]
        }
    })
}

async function processMeasures(measures, app) {
    return Promise.all(measures.map(async function (measure) {
        let [obj, objErr] = await handlePromise(app.getMeasure(measure.qInfo.qId))

        // the measure do not exists and need to be created
        if (objErr) {
            let [created, error] = await handlePromise(app.createMeasure(measure))
            if (error) throw new Error(`build measure: cannot create measure "${measure.qInfo.qId}": ${error.message}`)

            return { qId: measure.qInfo.qId, status: 'Created' }
        }

        // the measure exists and need to be updated
        let [updated, error] = await handlePromise(obj.setProperties(measure))
        if (error) throw new Error(`build measure: cannot update measure "${measure.qInfo.qId}": ${error.message}`)

        return { qId: measure.qInfo.qId, status: 'Updated' }
    }))
}

async function processDimensions(dimensions, app) {
    return Promise.all(dimensions.map(async function (dimension) {
        let [obj, objErr] = await handlePromise(app.getDimension(dimension.qInfo.qId))

        // the dimension do not exists and need to be created
        if (objErr) {
            let [created, error] = await handlePromise(app.createDimension(dimension))
            if (error) throw new Error(`build dimension: cannot create dimension "${dimension.qInfo.qId}": ${error.message}`)

            return { qId: dimension.qInfo.qId, status: 'Created' }
        }

        // the dimension exists and need to be updated
        let [updated, error] = await handlePromise(obj.setProperties(measure))
        if (error) throw new Error(`build dimension: cannot update dimension "${dimension.qInfo.qId}": ${error.message}`)

        return { qId: dimension.qInfo.qId, status: 'Updated' }
    }))
}

async function processScript(script, app) {
    let [s, error] = await handlePromise(app.setScript(script))
    if (error) throw new Error(`build script: cannot set script: ${error.message}`)

    return { status: 'Set' }
}

async function processAppProperties(appProperties, app) {
    let [update, error] = await handlePromise(app.setAppProperties(appProperties))
    if (error) throw new Error(`build app properties: cannot set app properties: ${error.message}`)

    return { status: 'Set' }
}

async function processVariables(variables, app) {
    return Promise.all(variables.map(async function (variable) {
        let [qVar, qVarError] = await handlePromise(app.getVariableByName(variable.qName))

        if (qVarError) {
            let [created, error] = await handlePromise(app.createVariableEx(variable))
            if (error) throw new Error(`build variable: cannot create variable "${variable.qName}": ${error.message}`)

            return { qId: variable.qName, status: 'Created' }
        }

        let [updated, error] = await handlePromise(qVar.setProperties(variable))
        if (error) throw new Error(`build variable: cannot update variable "${variable.qName}": ${error.message}`)

        return { qId: variable.qName, status: 'Updated' }
    }))
}

async function processConnections(appConnections, connections, app) {
    return Promise.all(connections.map(async function (connection) {
        let conn = appConnections.find(o => o.qName === connection.qName)

        if (!conn) {
            let [create, error] = await handlePromise(app.createConnection(connection))
            if (error) throw new Error(`build connection: cannot create connection "${connection.qName}": ${error.message}`)

            return { qId: connection.qName, status: 'Created' }
        }

        let [modify, error] = await handlePromise(app.modifyConnection(conn.qId, connection, true))
        if (error) throw new Error(`build connection: cannot modify connection "${connection.qName}": ${error.message}`)

        return { qId: connection.qName, status: 'Updated' }

    }))
}

async function processObjects(objects, app) {
    return Promise.all(objects.map(async function (object) {
        let objId, objType
        let isGenericObject = false;

        //if the object is GenericObject - the id and the type are in a slightly different path
        if (!object.qInfo) {
            isGenericObject = true
            objId = object.qProperty.qInfo.qId
            objType = object.qProperty.qInfo.qType
        } else {
            objId = object.qInfo.qId
            objType = object.qInfo.qType
        }


        let [obj, objError] = await handlePromise(app.getObject(objId))

        if (!objError) {
            // if its GenericObject we have to set the the props using setFullPropertyTree
            if (isGenericObject) {
                let [updated, error] = await handlePromise(obj.setFullPropertyTree(object))
                if (error) throw new Error(`build object: cannot update object "${objId}": ${error.message}`)

                return { qId: objId, status: 'Updated' }
            }

            // if not GenericObject then use the "usual" setProperties
            if (!isGenericObject) {
                let [updated, error] = await handlePromise(obj.setProperties(object))
                if (error) throw new Error(`build object: cannot update object "${objId}": ${error.message}`)

                return { qId: objId, status: 'Updated' }
            }
        }

        // same rules are applied when we have to create the object
        if (objError) {
            if (isGenericObject) {

                let [o, oError] = await handlePromise(app.createObject({
                    qInfo: {
                        qId: `${objId}`,
                        qType: objType
                    }
                }))
                if (oError) throw new Error(`build object: cannot create object "${objId}": ${oError.message}`)

                let [updated, updatedError] = await handlePromise(o.setFullPropertyTree(object))
                if (updatedError) throw new Error(`build object: cannot update object "${objId}": ${updatedError.message}`)

                return { qId: objId, status: 'Created' }
            }

            if (!isGenericObject) {
                let [created, createdError] = await handlePromise(app.createObject(object))
                if (createdError) throw new Error(`build object: cannot create object: "${objId}": ${createdError.message}`)

                return { qId: objId, status: 'Created' }
            }
        }
    }))
}

module.exports = {
    mBuild
}
