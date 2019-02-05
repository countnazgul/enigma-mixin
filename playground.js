const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.170.2.json');
// const docMixin = require('./dist/enigma-mixin.js');
const docMixin = require('./src/main.js');
const OS = require('os')

const OSUser = OS.userInfo().username;
const qvfPath = `C:\\Users\\${OSUser}\\Documents\\Qlik\\Sense\\Apps\\Helpdesk Management.qvf`;

  (async function () {
    let qlikConnect = await connect()
    qSession = qlikConnect.session
    qGlobal = qlikConnect.global

    let qDoc = await qlikConnect.global.openDoc(qvfPath)

    let t = 0
    // let a = await qDoc.mixin.qSelections.getCurrSelectionFields()
    let a = await qDoc.mGetCurrSelectionFields()
    // let a = await qDoc.mixin.qTablesAndFields.getTables()
    // let a = await qDoc.mixin.qTablesAndFields.getFields()
    // let a = await qDoc.mixin.qTablesAndFields.getTablesAndFields()

    

    await qSession.close()

  })();

async function connect() {
  let session = enigma.create({
    schema,
    mixins: [docMixin],
    url: 'ws://localhost:4848/app/engineData',
    createSocket: url => new WebSocket(url),
  });

  let global = await session.open()

  return ({ session, global })
}