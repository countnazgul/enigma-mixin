const objectDefinitions = require('../object-definitions.js');

async function mUnbuildVariables({ showSession = false, showConfig = false, showReserved = false } = {}) {
    let objProp = objectDefinitions.variableList
    objProp.qShowSession = showSession
    objProp.qShowConfig = showConfig
    objProp.qShowReserved = showReserved

    try {
        let sessionObj = await this.createSessionObject(objProp)
        let sessionObjLayout = await sessionObj.getLayout()
        await this.destroySessionObject(sessionObj.id)
        return sessionObjLayout.qVariableList.qItems
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {
    mUnbuildVariables
}