async function mAppProperties() {
    try {
        let appProperties = await this.getAppProperties()
        return appProperties
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {
    mAppProperties
}