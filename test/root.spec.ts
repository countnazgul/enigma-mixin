import chai from "chai";
import enigma from "enigma.js";
import WebSocket from "ws";
import schema from "enigma.js/schemas/12.612.0.json";

import { docMixin } from "../src";

const expect = chai.expect;

describe("Root", function () {
  this.timeout(30000);

  // Test if all mixin are present in "Doc" instance
  it("All mixin present on Doc", async function () {
    const session = enigma.create({
      schema,
      mixins: docMixin,
      url: `ws://localhost:4848/app/engineData`,
      createSocket: (url) => new WebSocket(url),
    });

    const global: EngineAPI.IGlobal = await session.open();

    const doc: EngineAPI.IApp = await global.openDoc(
      "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Temp.qvf"
    );

    const mixinFunctions = [
      "mSelectInField",
      "mSelectionsAll",
      "mSelectionsFields",
      "mSelectionsSimple",
      "mSelectionsSimpleGrouped",
      "mVariableCreate",
      "mVariableGetAll",
      "mVariableUpdateById",
      "mVariableUpdateByName",
      "mCreateSessionListbox",
      "mGetFields",
      "mGetTables",
      "mGetTablesAndFields",
      "mExtensionObjectsAll",
      "mBuild",
      "mUnbuild",
      "mCloneBookmark",
      "mCreateBookmarkFromMeta",
      "mGetBookmarkMeta",
      "mGetBookmarkValues",
      "mGetBookmarksMeta",
    ];

    const types: string[] = mixinFunctions.map((m) => {
      return typeof doc[m];
    });

    const unique = new Set(types);

    await session.close();

    expect(Array.from(unique).length).to.be.equal(1) &&
      expect(Array.from(unique)[0]).to.be.equal("function");
  });
});
