import path from "path";
const dotEnvPath = path.resolve(".env");
import dotenv from "dotenv";
dotenv.config({ path: dotEnvPath });

import chai from "chai";
import enigma from "enigma.js";
import WebSocket from "ws";
import schema from "enigma.js/schemas/12.612.0.json" assert { type: "json" };

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
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);

    try {
      const tablesAndFields = await doc.mGetTablesAndFields();

      await session.close();

      expect(tablesAndFields.length).to.be.greaterThan(0);
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });

  it("Get tables", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);

    try {
      const tables = await doc.mGetTables();

      await session.close();

      expect(tables.length).to.be.greaterThan(0);
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });

  it("Get fields", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);

    try {
      const fields = await doc.mGetFields();

      await session.close();

      expect(fields.length).to.be.greaterThan(0);
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });

  it("Create field listbox", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);

    try {
      const { obj, props, layout } = await doc.mCreateSessionListbox(
        `${process.env.FIELD_TO_SELECT}`
      );

      await doc.destroySessionObject(obj.id);

      const objExists = await doc
        .getObject(obj.id)
        .then((r) => true)
        .catch((e) => false);

      await session.close();

      expect(obj.genericType).to.be.equal("session-listbox") &&
        expect(props.qListObjectDef.qDef.qFieldDefs[0]).to.be.equal(
          `${process.env.FIELD_TO_SELECT}`
        ) &&
        expect(layout.qListObject.qDataPages.length).to.be.greaterThan(0) &&
        expect(
          layout.qListObject.qDataPages[0].qMatrix.length
        ).to.be.greaterThan(0) &&
        expect(objExists).to.be.false;

      expect(true).to.be.true;
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });
});
