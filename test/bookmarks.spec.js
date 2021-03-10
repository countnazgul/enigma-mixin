const chai = require("chai");
const expect = chai.expect;

const { connectToQlik } = require("./functions");

describe("Bookmarks", function () {
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

  it("List all bookmarks", async function () {
    let bookmarks = await this.qlik.app.mGetBookmarksMeta();

    expect(bookmarks.length).to.be.greaterThan(0);
  });

  it("Single bookmark meta", async function () {
    let bookmarkId = await this.qlik.app.mGetBookmarksMeta().then((bs) => {
      return bs[0].properties.qInfo.qId;
    });

    let bookmarkMeta = await this.qlik.app.mGetBookmarkMeta(bookmarkId);

    expect(bookmarkMeta.properties).to.exist &&
      expect(bookmarkMeta.layout).to.exist &&
      expect(bookmarkMeta.setAnalysisRaw).to.exist &&
      expect(bookmarkMeta.setAnalysisDestructed).to.exist;
  });

  it("Bookmark values", async function () {
    let bookmarkId = await this.qlik.app.mGetBookmarksMeta().then((bs) => {
      return bs[0].properties.qInfo.qId;
    });

    let bookmarkValues = await this.qlik.app.mGetBookmarkValues(bookmarkId);

    expect(bookmarkValues.length).to.be.greaterThan(0) &&
      expect(bookmarkValues[0].field).to.exist &&
      expect(bookmarkValues[0].values).to.exist &&
      expect(bookmarkValues[0].type).to.exist;
  });

  it("Create bookmark from meta", async function () {
    let bookmarkMeta = await this.qlik.app.mGetBookmarksMeta().then((bs) => {
      return bs[0];
    });

    let newBookmarkId = await this.qlik.app.mCreateBookmarkFromMeta(
      bookmarkMeta,
      "new bookmark",
      "new bookmark created from meta"
    );

    let newBookmarkMeta = await this.qlik.app.mGetBookmarkMeta(newBookmarkId);

    expect(newBookmarkMeta.properties.qMetaDef.title).to.be.equal(
      "new bookmark"
    ) &&
      expect(newBookmarkMeta.properties.qMetaDef.description).to.be.equal(
        "new bookmark created from meta"
      ) &&
      expect(newBookmarkMeta.setAnalysisRaw).to.be.equal(
        bookmarkMeta.setAnalysisRaw
      );
  });

  it("Clone bookmark", async function () {
    let bookmark = await this.qlik.app.mGetBookmarksMeta().then((bs) => {
      return bs[0];
    });

    let newBookmarkId = await this.qlik.app.mCloneBookmark(
      bookmark.properties.qInfo.qId,
      "$",
      "new bookmark",
      "new bookmark created from meta"
    );

    let newBookmarkMeta = await this.qlik.app.mGetBookmarkMeta(newBookmarkId);

    expect(newBookmarkMeta.properties.qMetaDef.title).to.be.equal(
      "new bookmark"
    ) &&
      expect(newBookmarkMeta.properties.qMetaDef.description).to.be.equal(
        "new bookmark created from meta"
      ) &&
      expect(newBookmarkMeta.setAnalysisRaw).to.be.equal(
        bookmark.setAnalysisRaw
      );
  });
});
