import chai from "chai";
import enigma from "enigma.js";
import WebSocket from "ws";
import schema from "enigma.js/schemas/12.612.0.json";
import * as fs from "fs";

import { docMixin } from "../src";
// import { mBuild } from "../src/mixins/doc/build";

const expect = chai.expect;

async function connect() {
  const session = enigma.create({
    schema,
    mixins: docMixin,
    url: `ws://localhost:4848/app/engineData`,
    createSocket: (url) => new WebSocket(url),
  });

  const global: EngineAPI.IGlobal = await session.open();

  // let a = await global.mGetAllExtensionObjects()

  return { session, global };
}

describe("Playground", function () {
  this.timeout(30000);

  it("____", async function () {
    const { session, global } = await connect();
    // await unbuild(session);
    await build(session, global);

    expect(true).to.be.true;
  });
});

async function build(session: enigmaJS.ISession, global: EngineAPI.IGlobal) {
  const doc: EngineAPI.IApp = await global.openDoc(
    "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Temp.qvf"
  );

  const a123 = await doc.mVariableGetAll(undefined, undefined);

  const measures = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/measures.json`
  );
  const dimensions = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/dimensions.json`
  );
  const script = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/script.qvs`
  );
  const appProperties = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/appProperties.json`
  );
  const connections = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/connections.json`
  );
  const variables = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/variables.json`
  );
  const objects = fs.readFileSync(
    `D:/DEV/enigma-mixin/temp/unbuild/temp/objects.json`
  );

  let a = await doc.mBuild({
    // measures: JSON.parse(measures.toString()),
    // dimensions: JSON.parse(dimensions.toString()),
    // script: script.toString(),
    // appProperties: JSON.parse(appProperties.toString()),
    // connections: JSON.parse(connections.toString()),
    // variables: JSON.parse(variables.toString()),
    objects: JSON.parse(objects.toString()),
  });

  await doc.doSave();

  await session.close();
}

async function unbuild(session: enigmaJS.ISession, global: EngineAPI.IGlobal) {
  const doc: EngineAPI.IApp = await global.openDoc(
    "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\CarsOriginal.qvf"
  );

  let a1 = await doc.mUnbuild();
  Object.keys(a1).map((key) => {
    if (key == "script") {
      fs.writeFileSync(
        `D:/DEV/enigma-mixin/temp/unbuild/temp/${key}.qvs`,
        a1[key]
      );
      return;
    }
    fs.writeFileSync(
      `D:/DEV/enigma-mixin/temp/unbuild/temp/${key}.json`,
      JSON.stringify(a1[key], null, 2)
    );
  });

  await session.close();
}
