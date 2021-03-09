const chai = require("chai");
const expect = chai.expect;

const { connectToQlik, docConf } = require("./functions");

describe("Tables and fields", function () {
  this.timeout(30000);

  beforeEach(async function () {
    this.timeout(10000);

    let { session, global, app } = await connectToQlik();

    this.qlik = {
      session,
      global,
      app,
    };
  });

  afterEach(async function () {
    await this.qlik.session.close();
  });

  it("Document to contain more than 1 table", async function () {
    let tables = await this.qlik.app.mGetTables();

    let tablesIndex = tables.indexOf(docConf.table);

    expect(tables.length).to.be.greaterThan(1) &&
      expect(tablesIndex).to.be.greaterThan(-1);
  });

  it("Document to contain more than 1 field", async function () {
    let fields = await this.qlik.app.mGetFields();

    let fieldIndex = fields.indexOf(docConf.otherField);

    expect(fields.length).to.be.greaterThan(1);
    expect(fieldIndex).to.be.greaterThan(-1);
  });

  it("Returns array of fields <-> tables", async function () {
    let tablesAndFields = await this.qlik.app.mGetTablesAndFields();

    let field = tablesAndFields.filter(function (f) {
      return f.field == docConf.field && f.table == docConf.table;
    });

    expect(tablesAndFields.length).to.be.greaterThan(1);
    expect(field.length).to.be.equal(1);
  });

  it("Correctly create listbox", async function () {
    let listbox = await this.qlik.app.mCreateSessionListbox("Region Name");

    expect(listbox.layout.qInfo.qType).to.be.equal("session-listbox");
  });
});
