const chai = require("chai");
const expect = chai.expect;

const { connectToQlik } = require("./functions");

describe("Extensions", function () {
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

  it("List all extensions in a document", async function () {
    let extensionObjects = await this.qlik.app.mExtensionObjectsAll();

    expect(extensionObjects.length).to.be.greaterThan(0);
  });
});
