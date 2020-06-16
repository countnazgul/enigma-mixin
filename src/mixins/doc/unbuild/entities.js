async function mEntities() {
    try {
        let data = {
            dimensions: [],
            measures: [],
            objects: []
        }

        let errors = []

        let appAllInfos = await this.getAllInfos()
        let t = JSON.stringify(appAllInfos, null, 4)
        for (let item of appAllInfos) {
            if (item.qType == 'dimension') {
                let dim = await this.getDimension(item.qId)
                let dimProp = await dim.getProperties()
                data.dimensions.push(dimProp)
            }

            if (item.qType == 'measure') {
                let measure = await this.getMeasure(item.qId)
                let measureProp = await measure.getProperties()
                data.measures.push(measureProp)
            }


            if (item.qType != 'dimension' && item.qType != 'measure') {
                let o = await processObject(item, this)

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
    mEntities
}