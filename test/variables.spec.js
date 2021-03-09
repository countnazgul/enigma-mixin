const chai = require("chai");
const expect = chai.expect;

const { connectToQlik } = require("./functions");

describe("Variables", function () {
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

  it("Create new variable", async function () {
    const variableName = `Test Variable - ${Math.floor(Math.random() * 10000)}`;

    let createVariable = await this.qlik.app.mVariableCreate(
      variableName,
      "sum(100)",
      "Commenting Test Variable"
    );

    let allVariables = await this.qlik.app.mVariableGetAll();

    let createdVariable = allVariables.filter(function (v) {
      return v.qName == variableName;
    })[0];

    await this.qlik.app.removeVariable(variableName);

    expect(createVariable.qName).to.be.equal(variableName) &&
      expect(createdVariable.qName).to.be.equal(variableName);
  });

  it("Update variable by name and ID", async function () {
    const variableName = `Test Variable - ${Math.floor(Math.random() * 10000)}`;

    let createVariable = await this.qlik.app.mVariableCreate(
      variableName,
      "sum(100)",
      "Commenting Test Variable"
    );

    let updateVariableName = await this.qlik.app.mVariableUpdateByName(
      variableName,
      "sum(test123)"
    );

    let updateVariableId = await this.qlik.app.mVariableUpdateById(
      createVariable.qInfo.qId,
      "sum(test456)"
    );

    await this.qlik.app.removeVariable(variableName);

    expect(updateVariableName.qDefinition).to.be.equal("sum(test123)") &&
      expect(updateVariableId.qDefinition).to.be.equal("sum(test456)");
  });
});
