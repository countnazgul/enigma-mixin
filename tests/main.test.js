const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.20.0.json');
// const docMixin = require('../dist/enigma-mixin.min.js');
const docMixin = require('../src/main.js');

let docConf = {
  testDoc: `/data/Executive Dashboard(1).qvf`,
  table: 'ProductGroupMaster',
  field: 'Product Group Desc',
  otherField: 'Account'
}

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
    console.log("Unable to connect to to Qlik Sense")
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
    mixins: docMixin,
    url: 'ws://localhost:9076/app/engineData',
    createSocket: url => new WebSocket(url),
  });

  let global = await session.open()

  return ({ session, global })
}

describe('initialization', () => {
  it('qlik session should have mixins', async function () {
    expect(qSession.config.mixins.length).toBe(1);
  });

  it('mixins to be for Qlik Document', async function () {
    expect(qSession.config.mixins[0].types[0]).toBe('Doc');
  });
});


describe('Selections', () => {
  it('Selecting value in field to be ok', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let select = await qDoc.mSelectInField(
      'Product Sub Group Desc',
      ['Cheese', 'Ice Cream', 'Juice', 'Chips'],
      false).catch((e) => e.message)

    expect(select).toBeTruthy
  });

  it('Selected values are correct', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)

    let select = await qDoc.mSelectInField(
      'Product Sub Group Desc',
      ['Cheese', 'Ice Cream', 'Juice', 'Chips'],
      false).catch((e) => e.message)

    let fieldsSelections = await qDoc.mSelectionsFields()
    let selectionsSimple = await qDoc.mSelectionsSimple()
    let selectionsNative = await qDoc.mSelectionsAll()

    expect(fieldsSelections[0]).toBe('Product Sub Group Desc')
    expect(selectionsSimple.length).toBe(4)
    expect(selectionsNative.qSelections.length).toBe(1)
  });
});

describe('Tables and fields', () => {
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

  it('Correctly create listbox', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let listbox = await qDoc.mCreateSessionListbox('Product Sub Group Desc')

    expect(listbox.layout.qInfo.qType).toBe('session-listbox')
  });
});

describe('Variables', () => {
  it('Document to contain more than 1 variable', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let allVariables = await qDoc.mVariableGetAll()

    expect(allVariables.length).toBeGreaterThan(0)
  });

  it('Create new variable', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)

    let randomNumber = Math.floor(Math.random() * 10000)

    let createVariable = await qDoc.mVariableCreate(
      `Test Variable Jest - ${randomNumber}`,
      'sum(100)',
      'Commenting Test Variable'
    )

    let allVariables = await qDoc.mVariableGetAll()

    let createdVariable = allVariables.filter(function (v) {
      return v.qName == `Test Variable Jest - ${randomNumber}`
    })[0]

    expect(createVariable.qName).toBe(`Test Variable Jest - ${randomNumber}`)
    expect(createdVariable.qName).toBe(`Test Variable Jest - ${randomNumber}`)
  });

  it('Update variable by name', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)
    let allVariables = await qDoc.mVariableGetAll()

    let updateVariableName = await qDoc.mVariableUpdateByName(allVariables[0].qName, 'sum(test)')
    let updateVariableId = await qDoc.mVariableUpdateById(allVariables[0].qInfo.qId, 'sum(test)')

    expect(updateVariableName.qDefinition).toBe('sum(test)')
    expect(updateVariableId.qDefinition).toBe('sum(test)')
  });
});

describe('Extensions', () => {
  it('List all extensions in a document', async function () {
    let qDoc = await qGlobal.openDoc(docConf.testDoc)

    let extensionObjects = await qDoc.mExtensionObjectsAll()

    expect(extensionObjects.length).toBe(4)
  });
});

// describe('Build/Unbuild', () => {
//   it('Unbuild is ok', async function () {
//     let qDoc = await qGlobal.openDoc(docConf.testDoc)

//     let unbuild = await qDoc.mUnbuild()

//     expect(unbuild).toBe(1)
//     // expect(unbuild.appProperties.qTitle).toBe("Executive Dashboard(1)")
//     // expect(unbuild.connections.length).toBe(0)
//     // expect(unbuild.dimensions.length).toBe(21)
//     // expect(unbuild.measures.length).toBe(33)
//     // expect(unbuild.objects.length).toBe(66)
//     // expect(unbuild.variables.length).toBe(22)
//     // expect(unbuild.script.indexOf('///$tab Main')).toBeGreaterThan(-1)
//   });
// })
