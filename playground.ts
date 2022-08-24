// import OS from "os";
// import fs from "fs";

import enigma from "enigma.js";
import WebSocket from "ws";
import schema from "enigma.js/schemas/12.612.0.json";

import { docMixin } from "./dist/enigma-mixin.min";

(async function () {
  const { session, global } = await connect();
  // qSession = qlikConnect.session;
  // qGlobal = qlikConnect.global;

  const doc = await global.openDoc(
    "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\CarsOriginal.qvf"
  );

  // await doc.

  let a = 1;
})();

async function connect() {
  const session = enigma.create({
    schema,
    mixins: docMixin,
    url: `ws://localhost:4848/app/engineData`,
    createSocket: (url) => new WebSocket(url),
  });

  const global = await session.open();

  return { session, global };
}

// var docMixin = {};
// if (process.env.release == "dev") {
//   docMixin = require("./src/main.js");
// }

// if (process.env.release == "prod") {
//   docMixin = require("./dist/enigma-mixin.js");
// }

// if (process.env.release == "prod-min") {
//   docMixin = require("./dist/enigma-mixin.min.js");
// }

// // const qsHost = process.env.QS_HOST
// // const qsPort = process.env.QS_PORT
// // const qsDoc = process.env.QS_DOC
// // var qsDocPath = ""

// let qsDocPath = "";

// if (process.env.QS_PORT == "9076") {
//   const OSUser = OS.userInfo().username;
//   qsDocPath = process.env.QS_DOC;
// }

// if (process.env.QS_PORT == "4848") {
//   const OSUser = OS.userInfo().username;
//   qsDocPath = process.env.QS_DOC;
// }

// (async function () {
//   let qlikConnect = await connect();
//   qSession = qlikConnect.session;
//   qGlobal = qlikConnect.global;

//   // let t = await qGlobal.createDocEx('build-test')
//   let qDoc = await qGlobal.openDoc(qsDocPath);
//   // let t = await qDoc.mUnbuildVariables({ showSession: true, showConfig: true, showReserved: true })
//   // let t = await qDoc.mUnbuildScript()
//   // let t = await qDoc.mAppProperties()
//   // let t = await qDoc.mConnections()
//   let unbuild = await qDoc.mUnbuild().catch(function (e) {
//     let b = 1;
//   });
//   // fs.writeFileSync('./unbuild.json', JSON.stringify(unbuild, null, 4))

//   // let f = await qDoc.getField('User Full Name')
//   // let fp1 = await f.getNxProperties();
//   // let fp = await f.getProperties();
//   // let fl = await f.getLayout();

//   // let data = JSON.parse(fs.readFileSync('./unbuild.json'))
//   // let build = await qDoc.mBuild(data).catch(function (e) {
//   //   let c = 1
//   // })

//   // let extensions1 = await qDoc.mSelectInFieldSimple({
//   //   fieldName: 'Month',
//   //   values: [4, 5, 6],
//   //   toggle: false,
//   //   isNumber: false
//   // }).catch(function (e) {
//   //   let c = 1
//   // })

//   // let extensions1 = await qDoc.mSelectInField(
//   //   'Month',
//   //   ['May', 'Apr'],
//   //   false).catch(function (e) {
//   //     let c = 1
//   //   })

//   // await qDoc.mSelectInField(
//   //   'state_name',
//   //   ['Minnesota', 'Ohio', 'Texas'],
//   //   false).catch(function (e) {
//   //     let c = 1
//   //   })

//   // await qDoc.mSelectInField(
//   //   'Product Sub Group Desc',
//   //   ['Cheese', 'Ice Cream', 'Juice', 'Chips'],
//   //   false).catch(function (e) {
//   //     let c = 1
//   //   })

//   // let extensions = await qDoc.mSelectionsAll().catch(function (e) {
//   //   let c = 1
//   // })

//   // let extensions = await qDoc.mSelectionsFields().catch(function (e) {
//   //   let c = 1
//   // })

//   // let extensions2 = await qDoc.mSelectionsSimple().catch(function (e) {
//   //   let c = 1
//   // })

//   // let variablesAll = await qDoc.mVariableGetAll().catch(function (e) {
//   //   let c = 1
//   // })

//   // let variableUpdate = await qDoc.mVariableUpdateById('ddfa82ca-e199-4baf-b1f5-7f8313ae6cbc', '=sum(test)').catch(function (e) {
//   //   let c = 1
//   // })

//   // let variableUpdate = await qDoc.mVariableUpdateByName('vLanguage', '=sum(test)').catch(function (e) {
//   //   let c = 1
//   // })

//   // let variableCreate = await qDoc.mVariableCreate('vLanguage1', '=sum(test)').catch(function (e) {
//   //   let c = 1
//   // })

//   // let extensions = await qDoc.mGetSelectionsCurr().catch(function (e) {
//   //   let c = 1
//   // })

//   // let tables = await qDoc.mGetTables().catch(function (e) {
//   //   let c = 1
//   // })

//   // let b = await qDoc.mCreateSessionListbox('Product Sub Group Desc')

//   // await qDoc.doSave()
//   // let allExtensions = await qDoc.mExtensionObjectsAll()
//   let a = 1;

//   // let a = 1

//   // let list = await qGlobal.getDocList()
//   // console.log(list)
//   // let doc = await qGlobal.openDoc('/home/engine/./apps/Consumer Sales - Copy.qvf')
//   // let qDoc = await qlikConnect.global.openDoc('/home/engine/./apps/Consumer Sales - Copy.qvf')
//   // console.log(qDoc)
//   // let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false)
//   // console.log(tables)
//   // let t = 0
//   // let a = await qDoc.mixin.qSelections.getCurrSelectionFields()
//   // let a = await qDoc.mGetSelectionsCurr()
//   // let a = await qDoc.mGetSelectionsCurrNative()
//   // let a = await qDoc.mixin.qTablesAndFields.getTables()
//   // let a = await qDoc.mixin.qTablesAndFields.getFields()
//   // let a = await qDoc.mixin.qTablesAndFields.getTablesAndFields()

//   // console.log(a)
//   // let a = await qDoc.mGetListbox('Case Aging')

//   // let f = []

//   // console.log(tables.qtr[10].qFields)
//   // for (let table of tables.qtr) {
//   // for (let field of tables.qtr[0].qFields) {
//   // f.push({ table: table.qName, field: field.qName })
//   // }
//   // }

//   // console.log(f)

//   await qSession.close();
// })();
