const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.20.0.json');
// const docMixin = require('../src/main.js');
const docMixin = require('../dist/enigma-mixin.min.js');
const OS = require('os')

const OSUser = OS.userInfo().username;

// const testDoc = `C:\\Users\\${OSUser}\\Documents\\Qlik\\Sense\\Apps\\Executive Dashboard.qvf`
let docConf = {
  testDoc: `C:\\Users\\${OSUser}\\Documents\\Qlik\\Sense\\Apps\\Executive Dashboard.qvf`,
  table: 'ProductGroupMaster',
  field: 'Product Group Desc',
  values: ['Baked Goods'],
  otherField: 'Account'
}
// const testDoc = `/docs/Helpdesk Management.qvf`

let qSession;
let qGlobal;

beforeAll(async function () {
  try {
    let qlikConnect = await connect()

    try {
      let qDoc = await qlikConnect.global.openDoc(docConf.testDoc)
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

describe('Selections', async function () {
  it('Selecting value in field to be ok', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let a1 = await qDoc.mSelectInField({ fieldName: docConf.field, values: docConf.values })

    expect(a1).toBeTruthy
  });

  it('Check selected values are correct', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let a1 = await qDoc.mSelectInField({ fieldName: docConf.field, values: docConf.values })
    // let a2 = await qDoc.mGetCurrSelectionFields()
    let a2 = await qDoc.mGetSelectionsCurrNative()

    expect(a2.qSelectionObject.qSelections[0].qSelected).toBe(docConf.values[0])
  });

});

describe('Tables and fields', async function () {
  it('Document to contain more than 1 table', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let tables = await qDoc.mGetTables()

    let tablesIndex = tables.indexOf(docConf.table)

    expect(tables.length).toBeGreaterThan(1)
    expect(tablesIndex).toBeGreaterThan(-1)
  });

  it('Document to contain more than 1 field', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let fields = await qDoc.mGetFields()

    let fieldIndex = fields.indexOf(docConf.otherField)

    expect(fields.length).toBeGreaterThan(1)
    expect(fieldIndex).toBeGreaterThan(-1)
  });

  it('Returns array of fields <-> tables', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let tablesAndFields = await qDoc.mGetTablesAndFields()

    let field = tablesAndFields.filter(function (f) {
      return (f.field == docConf.field && f.table == docConf.table)
    })

    expect(tablesAndFields.length).toBeGreaterThan(1)
    expect(field.length).toBe(1)
  });

});

describe('Variables', async function () {
  it('Document to contain more than 1 variable', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let allVariables = await qDoc.mGetVariablesAll()

    expect(allVariables.length).toBeGreaterThan(1)
  });

  it('Create new variable', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let newVariable = {
      name: 'Test Variable',
      comment: 'Commenting Test Variable',
      definition: 'sum(100)'
    }

    let createVariable = await qDoc.mCreateVariable(newVariable)
    let allVariables = await qDoc.mGetVariablesAll()

    let createdVariable = allVariables.filter(function (v) {
      return v.qName == newVariable.name
    })[0]

    expect(createdVariable.qName).toBe(newVariable.name)
  });

  it('Update variable name', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let allVariables = await qDoc.mGetVariablesAll()

    let toUpdate = allVariables[0]
    toUpdate.qName = 'Test Update Variable'

    let updateVariable = await qDoc.mUpdateVariable(toUpdate)

    let updatedVariable = await qDoc.getVariableById(toUpdate.qInfo.qId)
    let varProperties = await updatedVariable.getProperties()
    expect(varProperties.qName).toBe('Test Update Variable')
  });


});