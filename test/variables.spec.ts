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

describe("Variables", function () {
  this.timeout(30000);

  it("Get all", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);

    try {
      const allVariables = await doc.mVariableGetAll();

      const types = allVariables.map((v) => v.qInfo.qType);
      const unique = Array.from(new Set(types));

      await session.close();

      if (allVariables.length == 0)
        throw new Error("Variables -> Get all -> No variables in the app ");

      expect(allVariables.length).to.be.greaterThan(0) &&
        expect(unique[0]).to.be.equal("variable");
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });

  it("Create, update by Id and Name", async function () {
    const { session, global } = await connect();
    const doc: EngineAPI.IApp = await global.openDoc(`${process.env.QLIK_APP}`);
    try {
      const newVariable = await doc.mVariableCreate(
        "New Variable",
        "sum(100)",
        "my new test variable"
      );

      const updateByName = await doc.mVariableUpdateByName(
        "New Variable",
        "New Variable (updated by name)",
        "sum(101)",
        "my new test variable (updated by name)"
      );

      const updateById = await doc.mVariableUpdateById(
        newVariable.qInfo.qId as string,
        "New Variable (updated by id)",
        "sum(102)",
        "my new test variable (updated by id)"
      );

      const removeTempVariable = await doc.destroyVariableById(
        newVariable.qInfo.qId as string
      );

      const tempVariableExists = await doc
        .getVariableById(newVariable.qInfo.qId as string)
        .then((a) => true)
        .catch((e) => false);

      await session.close();

      expect(newVariable.qName).to.be.equal("New Variable") &&
        expect(newVariable.qDefinition).to.be.equal("sum(100)") &&
        expect(updateByName.qName).to.be.equal(
          "New Variable (updated by name)"
        ) &&
        expect(updateByName.qDefinition).to.be.equal("sum(101)") &&
        expect(updateById.qName).to.be.equal("New Variable (updated by id)") &&
        expect(updateById.qDefinition).to.be.equal("sum(102)") &&
        expect(tempVariableExists).to.be.equal(false) &&
        expect(removeTempVariable).to.be.equal(true);
    } catch (e) {
      await session.close();
      throw new Error(e);
    }
  });
});
