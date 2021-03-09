const chai = require("chai");
const expect = chai.expect;

const { connectToQlik } = require("./functions");

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
});
