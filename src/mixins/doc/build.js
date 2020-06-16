async function mBuild({ measures = [], dimensions = [], objects = [] } = {}) {
    let status = {
        measures: [],
        dimensions: []
    }

    if (measures.length > 0) {
        for (let measure of measures) {
            let p = await processMasure(measure, this)
            status.measures.push(p)
        }
    } else {
        console.log('No measures to process')
    }

    if (dimensions.length > 0) {
        for (let dimension of dimensions) {
            let p = await processDimension(dimension, this)
            status.dimensions.push(p)
        }
    } else {
        console.log('No measures to process')
    }

    return status
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


module.exports = {
    mBuild
}