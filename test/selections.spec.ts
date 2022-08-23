import path from "path";
const dotEnvPath = path.resolve("./.env");
require("dotenv").config({ path: dotEnvPath });

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

describe("Selections", function () {
  this.timeout(30000);

  it("Get all", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);
    const fieldName = `${process.env.FIELD_TO_SELECT}`;
    const selectValue = `${process.env.SELECT_VALUE}`;

    try {
      const select = await doc.mSelectInField(fieldName, [selectValue]);

      const selections = await doc.mSelectionsSimple();
      const selectionsFields = await doc.mSelectionsFields();
      const selectionsGrouped = await doc.mSelectionsSimpleGrouped();
      const selectionsAll = await doc.mSelectionsAll();

      await session.close();

      expect(select).to.be.equal(true) &&
        expect(selections.length).to.be.equal(1) &&
        expect(selections[0].field).to.be.equal(fieldName) &&
        expect(selections[0].values.length).to.be.equal(1) &&
        expect(selections[0].values[0]).to.be.equal(selectValue) &&
        expect(selectionsFields.length).to.be.equal(1) &&
        expect(selectionsFields[0]).to.be.equal(fieldName) &&
        expect(selectionsGrouped.length).to.be.equal(1) &&
        expect(selectionsGrouped[0].field).to.be.equal(fieldName) &&
        expect(selectionsGrouped[0].value).to.be.equal(selectValue) &&
        expect(selectionsAll.qSelections.length).to.be.equal(1) &&
        expect(selectionsAll.qSelections[0].qField).to.be.equal(fieldName) &&
        expect(selectionsAll.qSelections[0].qSelected).to.be.equal(selectValue);

      expect(true).to.be.true;
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });
});
