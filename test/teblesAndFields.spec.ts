import chai from "chai";
import enigma from "enigma.js";
import WebSocket from "ws";
import schema from "enigma.js/schemas/12.612.0.json";

import { docMixin } from "../src";

const expect = chai.expect;

async function connect() {
  const session = enigma.create({
    schema,
    mixins: docMixin,
    url: `ws://localhost:4848/app/engineData`,
    createSocket: (url) => new WebSocket(url),
  });

  const global: EngineAPI.IGlobal = await session.open();

  return { session, global };
}

describe("Tables and fields", function () {
  this.timeout(30000);

  it("Get tables and fields", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(
      "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Temp.qvf"
    );

    try {
      const tablesAndFields = await doc.mGetTablesAndFields();

      await session.close();

      expect(tablesAndFields.length).to.be.greaterThan(0);
    } catch (e) {
      await session.close();
    }
  });

  it("Get tables", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(
      "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Temp.qvf"
    );

    try {
      const tables = await doc.mGetTables();

      await session.close();

      expect(tables.length).to.be.greaterThan(0) &&
        expect(tables[0]).to.be.equal("INLFED");
    } catch (e) {
      await session.close();
    }
  });

  it("Get fields", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(
      "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Temp.qvf"
    );

    try {
      const fields = await doc.mGetFields();

      await session.close();

      expect(fields.length).to.be.greaterThan(0) &&
        expect(fields[0]).to.be.equal("r");
    } catch (e) {
      await session.close();
    }
  });

  it("Create field listbox", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(
      "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Temp.qvf"
    );

    try {
      const { obj, props, layout } = await doc.mCreateSessionListbox("r");

      await doc.destroySessionObject(obj.id);

      const objExists = await doc
        .getObject(obj.id)
        .then((r) => true)
        .catch((e) => false);

      await session.close();

      expect(obj.genericType).to.be.equal("session-listbox") &&
        expect(
          (props as any).field.qListObjectDef.qDef.qFieldDefs[0]
        ).to.be.equal("r") &&
        expect(
          (layout as any).field.qListObject.qDataPages.length
        ).to.be.greaterThan(0) &&
        expect(
          (layout as any).field.qListObject.qDataPages[0].qMatrix[0][0].qText
        ).to.be.equal("1") &&
        expect(objExists).to.be.false;

      expect(true).to.be.true;
    } catch (e) {
      await session.close();
    }
  });
});
