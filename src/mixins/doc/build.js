async function mBuild({
    variables = [],
    script = false,
    appProperties = {},
    connections = [],
    measures = [],
    dimensions = [],
    objects = [] }, doSave = false) {

    let status = {}
    let errors = { status: false }

    if (measures.length > 0) {
        status.measures = []
        for (let measure of measures) {
            let p = await processMasure(measure, this)
            status.measures.push(p)
        }
    }

    if (dimensions.length > 0) {
        status.dimensions = []
        for (let dimension of dimensions) {
            let p = await processDimension(dimension, this)
            status.dimensions.push(p)
        }
    }

    // if (objects.length > 0) {
    //     for (let object of objects) {
    //         let o = await processObjects(object, this)
    //         status.objects.push(o)
    //     }
    // } else {
    //     console.log('No objects to process')
    // }

    // if (doSave) await this.doSave()

    if (variables.length > 0) {
        status.variables = []
        for (let variable of variables) {
            let o = await processVariable(variable, this)
            status.variables.push(o)
        }
    }

    if (script != false) {
        status.script = {}
        let s = await this.setScript(script)
        status.script = { status: 'Set' }
    }

    if (appProperties.qTitle) {
        status.appProperties = {}
        let a = await this.setAppProperties(appProperties)
        status.appProperties = { status: 'Set' }
    }

    if (connections.length > 0) {
        status.connections = []
        let qConnections = await this.getConnections()
        for (let connection of connections) {
            let o = await processConnection(qConnections, connection, this)
            if (o.status = 'ERROR') {
                errors.status = true
                if (!errors.connections) errors.connections = []
                errors.connections.push(o)
            } else {
                status.connections.push(o)
            }

        }
    }

    return { status, errors }
}

async function processMasure(measure, app) {
    let obj = await app.getMeasure(measure.qInfo.qId).catch(function () {
        return { error: true }
    })

    if (obj.error) {
        let m = await app.createMeasure(measure)
        return { qId: measure.qInfo.qId, status: 'Created' }
    }

    let m = await obj.setProperties(measure)
    return { qId: measure.qInfo.qId, status: 'Updated' }

}

async function processDimension(dimension, app) {
    let obj = await app.getDimension(dimension.qInfo.qId).catch(function () {
        return { error: true }
    })

    if (obj.error) {
        let m = await app.createDimension(dimension)
        return { qId: dimension.qInfo.qId, status: 'Created' }
    }

    let m = await obj.setProperties(dimension)
    return { qId: dimension.qInfo.qId, status: 'Updated' }
}

async function processObjects(object, app) {
    let objId, objType
    let isGenericObject = false;

    if (!object.qInfo) {
        isGenericObject = true
        objId = object.qProperty.qInfo.qId
        objType = object.qProperty.qInfo.qType
    } else {
        objId = object.qInfo.qId
        objType = object.qInfo.qType
    }


    let obj = await app.getObject(objId).catch(function () {
        return { error: true }
    })

    if (!obj.error) {
        if (isGenericObject) {
            await obj.setFullPropertyTree(object)
            return { qId: objId, status: 'Updated' }
        }

        if (!isGenericObject) {
            await obj.setProperties(object)
            return { qId: objId, status: 'Updated' }
        }
    }

    if (obj.error) {
        if (isGenericObject) {
            let o = await app.createObject({
                qInfo: {
                    qId: `${objId}`,
                    qType: objType
                }
            }).catch(function (f) {
                let b = 1
            })
            await o.setFullPropertyTree(object).catch(function (f) {
                let b = 1
            })
            return { qId: objId, status: 'Created' }
        }

        if (!isGenericObject) {
            await obj.createObject(object)
            return { qId: objId, status: 'Created' }
        }
    }





    let a = 1
    // if (obj.error) {
    //     let m = await app.createDimension(dimension)
    //     return { qId: dimension.qInfo.qId, status: 'Created' }
    // }

    // let m = await obj.setProperties(dimension)
    // return { qId: dimension.qInfo.qId, status: 'Updated' }
}

async function processVariable(variable, app) {
    let qVar = await app.getVariableByName(variable.qName).catch(() => ({ error: true }))

    if (qVar.error) {
        let r = await app.createVariable(variable)
        return { qId: variable.qName, status: 'Created' }
    }

    let r = await qVar.setProperties(variable)
    return { qId: variable.qName, status: 'Updated' }
}

async function processConnection(qConnections, connection, app) {
    let conn = qConnections.find(o => o.qName === connection.qName)

    if (!conn) {
        let createConn = await app.createConnection(connection)
        return { qId: connection.qName, status: 'Created' }
    }

    let modifyConn = await app.modifyConnection(connection.qId, connection, true).catch(function (e) {
        return { error: true, message: e.message }
    })

    if (modifyConn.error) return { qId: connection.qName, status: 'ERROR', message: modifyConn.message }

    return { qId: connection.qName, status: 'Updated' }
}


module.exports = {
    mBuild
}