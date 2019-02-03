const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.20.0.json');
const docMixin = require('../src/main.js');
const OS = require('os')

const OSUser = OS.userInfo().username;
const testDoc = `C:\\Users\\${OSUser}\\Documents\\Qlik\\Sense\\Apps\\Helpdesk Management1.qvf`

let qSession;
let qGlobal;

beforeAll(async function () {
  try {
    let qlikConnect = await connect()

    try {
      let qDoc = await qlikConnect.global.openDoc(testDoc)
    } catch (e) {
      console.log(`Test qvf do not exists`)
      process.exit(1)
    } finally {
      await qlikConnect.session.close()
    }
  } catch (e) {
    console.log("Unable to connecto to Qlik Sense")
    process.exit(1)
  }
});

beforeEach(async function () {
  let qlikConnect = await connect()
  qSession = qlikConnect.session
  qGlobal = qlikConnect.global
});

afterEach(async function () {
  await qSession.close()
});


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



describe('initialization', async function () {
  it('qlik session should have mixins', async function () {
    let a = qSession.config.mixins.length
    expect(a).toBe(1);
  });

  it('mixins to be for Qlik Document', async function () {
    let a = qSession.config.mixins[0].types[0]
    expect(a).toBe('Doc');
  });
});

describe('Selectioins', async function () {
  it('Selecting value in field to be ok', async function () {
    let qDoc = await qGlobal.openDoc(testDoc)
    let a1 = await qDoc.mixin.qSelections.selectInField({ fieldName: 'Case Owner Group', values: ['Operatioins'] })

    expect(a1).toBeTruthy
  });

  it('Check selected values are correct', async function () {
    let qDoc = await qGlobal.openDoc(testDoc)
    let a1 = await qDoc.mixin.qSelections.selectInField({ fieldName: 'Case Owner Group', values: ['Operations'] })
    let a2 = await qDoc.mixin.qSelections.getCurrSelectionFields()

    expect(a2.qSelectionObject.qSelections[0].qSelected).toBe('Operations')
  });

});