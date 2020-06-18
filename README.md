[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/T6T0148ZP)

## **Under development!**

`enigma.js` functionality can be extended via [mixin](https://github.com/qlik-oss/enigma.js/blob/41c33604f7e384d0a34a502bd29e9f3db94dd9d2/docs/api.md#mixins). This repository contains set of mixins that can be added to any `enigma.js` instance. Some of the mixins are quite trivial but I've been lazy enough to remember the objects/params and decided to create these "shortcuts" :)

btw who ever made the `mixin` option available in `enigma.js` ... Thank you!

## Requirements

TBA

## Installation

This project don't include `enigma.js` itself. Make sure that `enigma.js` is installed:

> `npm install enigma.js`

Once `enigma.js` is installed, install the mixins:

> `npm install enigma-mixins`

## Init

**Browser usage**

```javascript
import enigma from "enigma.js";
import schema from "enigma.js/schemas/12.20.0.json";
import enigmaMixins from "enigma-mixins";

// Create enigma session as usual
// but include the mixin property
const session = enigma.create({
  schema,
  mixins: [enigmaMixins],
  url: "ws://localhost:4848/app/engineData",
  createSocket: (url) => new WebSocket(url),
});
```

**Node JS usage**

```javascript
const enigma = require("enigma.js");
const WebSocket = require("ws");
const schema = require("enigma.js/schemas/12.20.0.json");
const enigmaMixins = require("enigma-mixins");

const session = enigma.create({
  schema,
  mixins: [enigmaMixins],
  url: "ws://localhost:4848/app/engineData",
  createSocket: (url) => new WebSocket(url),
});
```

## Usage

At the moment this project includes only mixins that are extending the `enigma.js` `Doc` object. After the mixin is imported a new set of functions will be available in the `Doc` instance.

```javascript
let global = await session.open();
let qDoc = await global.openDoc(
  "C:\\Users\\User1\\Documents\\Qlik\\Sense\\Apps\\Helpdesk Management.qvf"
);
```

After this `qDoc` will have all the mixins available under `qDoc.mixin`

![mixin](https://raw.githubusercontent.com/countnazgul/enigma-mixin/master/src/images/mixin.png)

## Mixins

The available `mixin` are separated in categories:

- Selections
- TableAndFields
- Variables
- Extensions
- Unbuild
- Build

### Selections

- `mGetSelectionsCurr` - returns the current selections (if any)
  - no parameters
- `mGetSelectionsCurrNative` - similar as `getCurrSelectionFields` but simplifies the output - value <-> field format
  - no parameters
- `mSelectInField` - select a value(s) in a specified field
  - fieldName
  - values - string array of values to be selected
  - toggle (optional. default `false`)

### TableAndFields

- `mGetTablesAndFields` - returns an object array with the field <-> table relation
  - no parameters
- `mGetTables` - returns an array with all table names
  - no parameters
- `mGetFields` - returns an array with all field names
  - no parameters
- `mGetListbox` - creates a **session** listbox object for specified field
  - fieldName

### Variables

- `mGetVariablesAll` - return a list with all variables in a document
  - showSession (optional. default `false`)
  - showConfig (optional. default `false`)
  - showReserved (optional. default `false`)
- `mUpdateVariable` - update existing variable

  - TBA

- `mCreateVariable` - create new variable
  - name -
  - comment (optional. default is empty string) -
  - definition -

### Extensions

- `mGetAllExtensionObjects` - return a list with all extensions objects in the document
  - no parameters

### Unbuild

* `mUnbuild` - (same as `corectl`) Extracts all parts of a Qlik Sense app (apart from the data itself) into JSON object. The resulted JSON object hav the followig format:

    - appProperties (`object`)
    - connections (`array`)
    - dimensions (`array`)
    - measures (`array`)
    - objects (`array`) - all other objects. Including sheets, charts, filters etc.
    - script (`string`)
    - variables (`array`)

The result JSON can be stored in file (or multiple files) and put inder version control

### Build

* `mBuild` - (same as `corectl`) Opposite to `unbuild`. Provide a JSON object with Qlik objects and this mixin will update the existing objects or, if they do not exists, it will create them. The structure of the input JSON object must in specific format (see `unbuild`). 

The result of the `build` command will be an object with two properties - `status` and `errors`

* `status` - will contain the result of all objects with a state if the object was updated or created
* `errors` - by default this object will have one propety - `status: false`. In case of **ANY** errors during the build process the `status` will be changed to `true` and additional properties will be added based on which object(s) raised the error

**To preserve the changes the app have to be saved. The build command do not save the app automatically!**
