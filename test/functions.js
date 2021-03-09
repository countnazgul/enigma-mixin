const enigma = require("enigma.js");
const WebSocket = require("ws");
const schema = require("enigma.js/schemas/12.612.0.json");
const docMixin = require("../src/main.js");

const connectToQlik = async function () {
  let session = enigma.create({
    schema,
    mixins: docMixin,
    url: "ws://localhost:4848/app/engineData",
    createSocket: (url) => new WebSocket(url),
  });

  let global = await session.open();
  let app = await global.openDoc(
    "C:\\Users\\countnazgul\\Documents\\Qlik\\Sense\\Apps\\Consumer_Sales(2).qvf"
  );

  return { session, global, app };
};

module.exports = {
  connectToQlik,
};
