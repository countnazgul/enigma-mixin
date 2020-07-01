const objectDefinitions = require('./object-definitions.js');
const { handlePromise } = require('../../lib/helpers');

async function mUnbuild() {
    return await Promise.all([
        await unbuildVariables(this),
        await unbuildScript(this),
        await unbuildAppProperties(this),
        await unbuildConnections(this),
        await unbuildEntities(this)
    ]).then((data) => ({
        variables: data[0],
        script: data[1],
        appProperties: data[2],
        connections: data[3],
        dimensions: data[4].dimensions,
        measures: data[4].measures,
        objects: data[4].objects
    }))


    // let variables = await unbuildVariables(this)
    // let script = await unbuildScript(this)
    // let appProperties = await unbuildAppProperties(this)
    // let connections = await unbuildConnections(this)
    // let entities = await unbuildEntities(this)

    // return {
    //     variables,
    //     script,
    //     appProperties,
    //     connections,
    //     dimensions: entities.dimensions,
    //     measures: entities.measures,
    //     objects: entities.objects
    // }
}

async function unbuildVariables(app) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = false
    objProp.qShowConfig = false
    objProp.qShowReserved = false

    let [sessionObj, sessionObjErr] = await handlePromise(app.createSessionObject(objProp))
    if (sessionObjErr) throw new Error('unbuild variables: cannot create session object');

    let [sessionObjLayout, sessionObjLayoutErr] = await handlePromise(sessionObj.getLayout())
    if (sessionObjLayoutErr) throw new Error('unbuild variables: cannot get session object layout');

    let [delSessionObj, delSessionObjErr] = await handlePromise(app.destroySessionObject(sessionObj.id))
    if (delSessionObjErr) throw new Error('unbuild variables: cannot delete session object');

    return sessionObjLayout.qVariableList.qItems
}

async function unbuildScript(app) {
    let [script, scriptErr] = await handlePromise(app.getScript())
    if (scriptErr) throw new Error('unbuild script: cannot fetch script');

    return script
}

async function unbuildAppProperties(app) {
    let [appProperties, appPropertiesError] = await handlePromise(app.getAppProperties())
    if (appPropertiesError) throw new Error('unbuild app properties: cannot fetch app properties');

    return appProperties

}

async function unbuildConnections(app) {
    let [appConnections, appConnectionsErr] = await handlePromise(app.getConnections())
    if (appConnectionsErr) throw new Error('unbuild connections: cannot fetch app connections');

    return appConnections
}

async function unbuildEntities(app) {
    let data = {
        dimensions: [],
        measures: [],
        objects: []
    }

    let errors = []

    // get list of all objects
    let [appAllInfos, appAllInfosErr] = await handlePromise(app.getAllInfos())
    if (appAllInfosErr) throw new Error('unbuild app infos: cannot fetch all app infos')

    return Promise.all(appAllInfos.map(async function (item) {
        if (item.qType == 'dimension') {
            let [dim, dimErr] = await handlePromise(app.getDimension(item.qId))
            if (dimErr) throw new Error('unbuild dimension: cannot fetch dimension')

            let [dimProp, dimPropErr] = await handlePromise(dim.getProperties())
            if (dimPropErr) throw new Error('unbuild dimension: cannot fetch dimension properties')

            data.dimensions.push(dimProp)
        }

        if (item.qType == 'measure') {
            let [measure, measureErr] = await handlePromise(app.getMeasure(item.qId))
            if (measureErr) throw new Error('unbuild dimension: cannot fetch measure')

            let [measureProp, measurePropErr] = await handlePromise(measure.getProperties())
            if (measurePropErr) throw new Error('unbuild dimension: cannot fetch measure properties')

            data.measures.push(measureProp)
        }

        if (item.qType != 'dimension' && item.qType != 'measure') {
            let o = await processObject(item, app)

            if (!o.error) data.objects.push(o)
            if (o.error) errors.push(o)
        }
    })).then(() => data)
}

async function processObject(item, app) {
    let [obj, objErr] = await handlePromise(app.getObject(item.qId))

    // embeddedsnapshot, snapshot, hiddenbookmark, story --> need to be handled differently
    if (objErr) return { ...item, error: true }

    let [parent, parentErr] = await handlePromise(obj.getParent())
    let [children, childrenErr] = await handlePromise(obj.getChildInfos())

    if (childrenErr) throw new Error(`unbuild entity: cannot fetch entity children`)

    // parent-less objects - masterobject, sheet, appprops, LoadModel
    if (parentErr && children.length > 0) {
        let [propTree, propTreeErr] = await handlePromise(obj.getFullPropertyTree())
        if (propTreeErr) throw new Error('unbuild entity: cannot fetch entity full property tree')

        return propTree
    }

    let [prop, propErr] = await handlePromise(obj.getProperties())
    if (propErr) throw new Error('unbuild entity: cannot fetch entity properties')

    return prop
}

module.exports = {
    mUnbuild
}