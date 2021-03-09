const chai = require("chai");
const expect = chai.expect;

const { connectToQlik } = require("./functions");

describe("General", function () {
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

  it("mixins are present/loaded", async function () {
    expect(this.qlik.session.config.mixins.length).to.be.equal(1);
  });

  it("mixins to be for Qlik Document", async function () {
    expect(this.qlik.session.config.mixins[0].types[0]).to.be.equal("Doc");
  });
});
