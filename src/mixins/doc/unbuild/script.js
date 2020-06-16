async function mUnbuildScript() {
    try {
        let script = await this.getScript()
        return script
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {
    mUnbuildScript
}