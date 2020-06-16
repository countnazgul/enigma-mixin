async function mConnections() {
    try {
        let appConnections = await this.getConnections()

        return appConnections
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {
    mConnections
}