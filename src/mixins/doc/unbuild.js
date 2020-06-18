const objectDefinitions = require('./object-definitions.js');

async function mUnbuild() {
    let qApp = this

    let data = await Promise.all([
        await unbuildVariables(qApp),
        await unbuildScript(qApp),
        await unbuildAppProperties(qApp),
        await unbuildConnections(qApp),
        await unbuildEntities(qApp)
    ])

    return {
        variables: data[0],
        script: data[1],
        appProperties: data[2],
        connections: data[3],
        dimensions: data[4].dimensions,
        measures: data[4].measures,
        objects: data[4].objects
    }
}


async function unbuildVariables(app) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = false
    objProp.qShowConfig = false
    objProp.qShowReserved = false

    try {
        let sessionObj = await app.createSessionObject(objProp)
        let sessionObjLayout = await sessionObj.getLayout()
        await app.destroySessionObject(sessionObj.id)
        return sessionObjLayout.qVariableList.qItems
    } catch (e) {
        throw new Error(e.message)
    }
}

async function unbuildScript(app) {
    try {
        let script = await app.getScript()
        return script
    } catch (e) {
        throw new Error(e.message)
    }
}

async function unbuildAppProperties(app) {
    try {
        let appProperties = await app.getAppProperties()
        return appProperties
    } catch (e) {
        throw new Error(e.message)
    }
}

async function unbuildConnections(app) {
    try {
        let appConnections = await app.getConnections()

        return appConnections
    } catch (e) {
        throw new Error(e.message)
    }
}

async function unbuildEntities(app) {
    try {
        let data = {
            dimensions: [],
            measures: [],
            objects: []
        }

        let errors = []

        let appAllInfos = await app.getAllInfos()
        let t = JSON.stringify(appAllInfos, null, 4)
        for (let item of appAllInfos) {
            if (item.qType == 'dimension') {
                let dim = await app.getDimension(item.qId)
                let dimProp = await dim.getProperties()
                data.dimensions.push(dimProp)
            }

            if (item.qType == 'measure') {
                let measure = await app.getMeasure(item.qId)
                let measureProp = await measure.getProperties()
                data.measures.push(measureProp)
            }


            if (item.qType != 'dimension' && item.qType != 'measure') {
                let o = await processObject(item, app)

                if (!o.error) data.objects.push(o)
                if (o.error) errors.push(o)
            }




            // if (item.qType != 'dimension'
            //     && item.qType != 'measure'
            //     && item.qType != 'embeddedsnapshot'
            //     && item.qType != 'snapshot'
            //     && item.qType != 'hiddenbookmark'
            //     && item.qType != 'story') {

            //     console.log(item.qId)
            //     let obj = await this.getObject(item.qId)

            // if (item.qType != 'masterobject' && item.qType != 'sheet' && item.qType != 'appprops' && item.qType != 'LoadModel') {
            //     let parent = await obj.getParent()
            //     let children = await obj.getChildInfos()
            // }



            // }
        }
        let a = 1
        return data
    } catch (e) {
        throw new Error(e.message)
    }
}

async function processObject(item, app) {
    let obj = await app.getObject(item.qId).catch(function () {
        return { error: true }
    })

    // embeddedsnapshot, snapshot, hiddenbookmark, story --> need to be handled differently
    if (obj.error) return {
        ...item,
        error: true
    }

    let parent = await obj.getParent().catch(function () {
        return { error: true }
    })

    let children = await obj.getChildInfos()

    // parent-less objects - masterobject, sheet, appprops, LoadModel
    if (parent.error && children.length > 0) {
        return await obj.getFullPropertyTree()
    } else {
        return await obj.getProperties()
    }
}

module.exports = {
    mUnbuild
}