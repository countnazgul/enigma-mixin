const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.170.2.json');

var docMixin = {}
if (process.env.release == "dev") {
  docMixin = require('./src/main.js');
}

if (process.env.release == "prod") {
  docMixin = require('./dist/enigma-mixin.js');
}

if (process.env.release == "prod-min") {
  docMixin = require('./dist/enigma-mixin.min.js');
}

const OS = require('os')

const qsHost = process.env.QS_HOST
const qsPort = process.env.QS_PORT
const qsDoc = process.env.QS_DOC
var qsDocPath = ""

if (process.env.QS_PORT == "4848") {
  const OSUser = OS.userInfo().username;
  qsDocPath = `C:\\Users\\${OSUser}\\Documents\\Qlik\\Sense\\Apps\\${qsDoc}`
}





(async function () {
  let qlikConnect = await connect()
  qSession = qlikConnect.session
  qGlobal = qlikConnect.global

  let qDoc = await qlikConnect.global.openDoc(qsDocPath)

  let t = 0
  // let a = await qDoc.mixin.qSelections.getCurrSelectionFields()
  // let a = await qDoc.mGetSelectionsCurr()
  // let a = await qDoc.mGetSelectionsCurrNative() 
  // let a = await qDoc.mixin.qTablesAndFields.getTables()
  // let a = await qDoc.mixin.qTablesAndFields.getFields()
  // let a = await qDoc.mixin.qTablesAndFields.getTablesAndFields()

  let a = await qDoc.mGetListbox('Case Aging')



  await qSession.close()

})();

async function connect() {
  let session = enigma.create({
    schema,
    mixins: [docMixin],
    url: `ws://${qsHost}:${qsPort}/app/engineData`,
    createSocket: url => new WebSocket(url),
  });

  let global = await session.open()

  return ({ session, global })
}