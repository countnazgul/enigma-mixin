const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.170.2.json');

var docMixin = {}
// if (process.env.release == "dev") {
// docMixin = require('./src/main.js');
// }

// if (process.env.release == "prod") {
docMixin = require('./dist/enigma-mixin.js');
// }

// if (process.env.release == "prod-min") {
//   docMixin = require('./dist/enigma-mixin.min.js');
// }

// const OS = require('os')

// const qsHost = process.env.QS_HOST
// const qsPort = process.env.QS_PORT
// const qsDoc = process.env.QS_DOC
// var qsDocPath = ""

const qsHost = 'localhost'
const qsPort = 19076
// const qsDoc = process.env.QS_DOC
// var qsDocPath = ""


if (process.env.QS_PORT == "4848") {
  const OSUser = OS.userInfo().username;
  qsDocPath = `C:\\Users\\${OSUser}\\Documents\\Qlik\\Sense\\Apps\\${qsDoc}`
}





(async function () {
  let qlikConnect = await connect()
  qSession = qlikConnect.session
  qGlobal = qlikConnect.global

  // let list = await qGlobal.getDocList()
  // console.log(list)
  // let doc = await qGlobal.openDoc('/home/engine/./apps/Consumer Sales - Copy.qvf')
  let qDoc = await qlikConnect.global.openDoc('/home/engine/./apps/Consumer Sales - Copy.qvf')
  // console.log(qDoc)
  let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false)
  // console.log(tables)
  // let t = 0
  // let a = await qDoc.mixin.qSelections.getCurrSelectionFields()
  // let a = await qDoc.mGetSelectionsCurr()
  // let a = await qDoc.mGetSelectionsCurrNative() 
  // let a = await qDoc.mixin.qTablesAndFields.getTables()
  // let a = await qDoc.mixin.qTablesAndFields.getFields()
  // let a = await qDoc.mixin.qTablesAndFields.getTablesAndFields()

  // console.log(a)
  // let a = await qDoc.mGetListbox('Case Aging')

  let f = []

  console.log(tables.qtr[10].qFields)
  // for (let table of tables.qtr) {
    // for (let field of tables.qtr[0].qFields) {
      // f.push({ table: table.qName, field: field.qName })
    // }
  // }

  // console.log(f)

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