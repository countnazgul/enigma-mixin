const chai = require("chai");
const expect = chai.expect;

const { connectToQlik, docConf } = require("./functions");

describe("Selections", function () {
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

  it("Selecting value in field to be ok", async function () {
    let select = await this.qlik.app.mSelectInField(
      docConf.otherField,
      docConf.otherFieldValues,
      false
    );

    expect(select).to.be.true;
  });

  it("Selected values are correct", async function () {
    let select = await this.qlik.app.mSelectInField(
      docConf.otherField,
      docConf.otherFieldValues,
      false
    );

    let fieldsSelections = await this.qlik.app.mSelectionsFields();
    let selectionsSimple = await this.qlik.app.mSelectionsSimple();
    let { selections: selectionsNative } = await this.qlik.app.mSelectionsAll();

    expect(select).to.be.true &&
      expect(fieldsSelections[0]).to.be.equal(docConf.otherField) &&
      expect(selectionsSimple.length).to.be.equal(
        docConf.otherFieldValues.length
      ) &&
      expect(selectionsNative.qSelections.length).to.be.equal(1);
  });
});
