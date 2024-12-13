# Enigma.js Mixins

> **Note**
>
> **NOT AFFILIATED WITH QLIK**

`enigma.js` functionality can be extended via [mixin](https://github.com/qlik-oss/enigma.js/blob/41c33604f7e384d0a34a502bd29e9f3db94dd9d2/docs/api.md#mixins). This repository contains set of mixins that can be added to any `enigma.js` instance. Some of the mixins are quite trivial but I've been lazy enough to remember the objects/params and decided to create these "shortcuts" :)

btw who ever made the `mixin` option available in `enigma.js` ... Thank you!

## Installation

This project don't include `enigma.js` itself. Make sure that `enigma.js` is installed first:

`npm install enigma.js`

Then install the mixins:

`npm install enigma-mixins`

> **Note**
> For Node.js `ws` package should be installed as well. And import it:
> `import WebSocket from 'ws'`

## Init

```javascript
import enigma from "enigma.js";
import schema from "enigma.js/schemas/12.20.0.json";
import { docMixin, globalMixin } from "enigma-mixins";

// Create enigma session as usual
// but include the mixin property
const session = enigma.create({
  schema,
  // load the required mixins here
  mixins: [...docMixin, ...globalMixin],
  url: "ws://localhost:4848/app/engineData",
  createSocket: (url) => new WebSocket(url),
});
```

## Available mixins

### Global

At the moment only one `global` mixin is available:

- `mGetReloadProgress` - get the reload progress log while reloading an app

  When used this mixin can produce the same result as Qlik's native reload progress messages:

  ![qlik script and mixin result](.\src\images\mGetReloadProgress.png)

  ```js
  // establish connection and open an app ... as usual
  const global = await session.open();
  const doc = await global.openDoc("some-app-id");

  // init the mixin
  const reloadProgress = global.mGetReloadProgress();

  // prepare the emitter
  reloadProgress.emitter.on("progress", (msg) => {
    // here we will receive the reload messages
    // do whatever you have to do with them :)
    console.log(msg);
  });

  // prepare the on error emitter
  // errors will be emitted by Qlik if configureReload is set correctly (see below)
  reloadProgress.emitter.on("error", (errorMessage) => {
    // any script errors can be handled here
    // FYI on progress will also receive the errors messages
    // just so we can have the complete reload log in one place
    console.log(errorMessage);
  });

  // optional
  // if qUseErrorData is true then onError event will be triggered if the reload is failing
  // https://help.qlik.com/en-US/sense-developer/November2023/Subsystems/EngineJSONAPI/Content/service-global-configurereload.htm
  await global.configureReload(true, true, false);

  const reloadApp = await new Promise(function (resolve, reject) {
    // or doc.doReloadEx
    // DO NOT "await" doReload or doReloadEx
    // if await them then pooling for reload progress messaged
    // will be started after the app finished reloading
    doc.doReload().then((r) => {
      // give it another few ms to make sure we have all the messages
      setTimeout(function () {
        // stop the mixin from pooling for new messages.
        // The app reload is already complete at this point
        reloadProgress.stop();
        // resolve the main promise
        resolve(r);
      }, 300);
    });

    // see below for available (optional) options that can be passed
    reloadProgress.start();
  });
  ```

  - `mGetReloadProgress(qRequestId)` - `number` - **optional** parameter to provide `qRequestId`. Default is `-1`
  - `start({...})` - **optional** object with few **optional** properties:
    - `poolInterval` - `number` - how often to pool for new reload messages. Default is `200` (ms),
    - `skipTransientMessages` - `boolean` - Qlik returns two type of messages - persistent and transient. Persistent messages are the ones that stating which table is started loading, when table is loaded then how many rows are loaded etc. Transient messages are the ones that display how many rows were loaded so far. For example if we are loading table with 1M rows then transient messages will be like: `5025`, `120124`, `500003` ... `1000000`. To ignore these messages set this option to `true`. Default is `false`
    - `includeTimeStamp` - `boolean` - include the current timestamp for each message. This is the timestamp when the message "arrives" and not when the message was send. Default is `false`
    - `trimLeadingMessage` - some of the default messages have a leading space. Setting this option to `true` will remove the leading space. Default is `false`

### Doc

The available doc `mixin` are "grouped" in the following categories:

- Selections
- TableAndFields
- Variables
- Extensions **EXPERIMENTAL!!!**
- Build/Unbuild **EXPERIMENTAL!!!**
- Bookmarks **EXPERIMENTAL!!!**

### Selections

- `mSelectionsAll` - returns the current selections (if any). This method will return all selected values (even if more than 6 values are selected)
  - no parameters
- `mSelectionsFields` - return just an array of the fields, having selections in them
  - no parameters
- `mSelectionsSimple` - returns array of `field <-> selected value`

  - `groupByField` (`optional`; default `false`) If this argument is provided the array will be grouped by field name:

    ```javascript
    [
      {field: "Field 1": values: [...]},
      {field: "Field 2": values: [...]},
      ...
    ]
    ```

- `mSelectInField` - select a value(s) in the specified field
  - field - field name
  - values - array of string values to be selected
  - toggle (`optional`; default `false`)

### TableAndFields

- `mGetTablesAndFields` - returns an object array with the field <-> table relation
  - no parameters
- `mGetTables` - returns an array with all table names
  - no parameters
- `mGetFields` - returns an array with all field names
  - no parameters
- `mGetAlwaysOneSelectedFields` - returns an string array with all fields for which `qOneAndOnlyOne` is `true`
- `mCreateSessionListbox` - creates a **session** listbox object for the specified field

  - fieldName
  - options (`optional`)

    - type - (`optional`; default `session-listbox`) - type of the listbox
    - state - (`optional`; default `$`) - in which state to create the listbox
    - destroyOnComplete - (`optional`) - if set to `true` once all the operations are complete the session object will "self-destruct". All the info will be returned as normal
    - getAllData - (`optional`) - if set to `true` all values will be extracted. Qlik can extract max 10 000 cells of data on a single call. If the data is more than 10 000 data cells paging have to be implemented to get all the data. This method by default will make the initial request with 10 000 cells as initial data fetch and if this argument is passed the method will determine if there is a need of paging and will request all the data from Qlik

  > **Note**
  > Additionally to the `obj`, `prop` and `layout` this method will expose an extra function (`flattenData`) that can be used to flatten all the existing data. By default all data will be inside the returned `layout` property in its original format. Once `flattenData` function is called it will return all the data in array of `qMatrix` objects (easier to read/use in this format). To avoid duplication and increased resource usage (esp with fields with high number of distinct values) its up to the developer to decide when/if to call this function.

- `mGetSyntheticTables` - returns a subset of all data tables. The subset will contains data only for tables which are flagged with `qIsSynthetic = true`

### Variables

- `mVariableGetAll` - return a list with all variables in the document

  - showSession (`optional`; default `false`)
  - showConfig (`optional`; default `false`)
  - showReserved (`optional`; default `false`)

- `mVariableUpdateById` - update existing variable by id

  - id - id of the variable, to be updated
  - definition - the expression/definition of the variable
  - comment - (`optional`)

- `mVariableUpdateByName` - update existing variable by name

  - name - name of the variable, to be updated
  - definition - the expression/definition of the variable
  - comment - (`optional`)

- `mVariableCreate` - create new variable
  - name - (`optional`; default is empty string)
  - comment (`optional`; default is empty string)
  - definition (`optional`;default is empty string)

### Extensions

- `mExtensionObjectsAll` - return a list with all extensions objects in the document
  - no parameters

### Bookmarks

- `mGetBookmarksMeta` - returns full info about all bookmarks (to which the user have access)
  - `state` (`optional`; default is `$`)
    Each row will return:
    - `layout` - layout of the Qlik object (`getLayout()`)
    - `properties` - properties of the Qlik object (`getProperties()`)
    - `setAnalysis` - raw set analysis returned from Qlik. For example: `"<state_name={'California','Minnesota','Ohio','Texas'}>"`
    - `setAnalysisDestructed` - set analysis but in more readable format. Using the example above:
      - field: `state_name`
      - type: `field` or `expression`
      - values: array of values in the bookmark.
- `mGetBookmarkMeta` - similar to `mGetBookmarksMeta` but returns the meta for only one bookmark
  - `bookmarkId`
  - `state` (`optional`; default is `$`)
- `mCreateBookmarkFromMeta` - create new bookmark using data from existing bookmark
  - `bookmarkMeta` -
  - `title` -
  - `description` (`optional`; default is empty string)
- `mGetBookmarkValues` - return the values for specific bookmark
  - `bookmarkId`
  - `state` (`optional`; default is `$`)
- `mCloneBookmark` - create new bookmark using data from existing bookmark (kinda similar to `mCreateBookmarkFromMeta`. In the near future only one of these methods will stay)
  - `sourceBookmarkId` -
  - `state` -
  - `title`
  - `description` (`optional`; default is empty string)

## Build/Unbuild

If you haven't used [corectl](https://github.com/qlik-oss/corectl) now its a good time to start :) But I've wanted to have the same/similar functionality (for building/unbuilding app) in [enigma.js](https://github.com/qlik-oss/enigma.js/blob/master/schemas/12.67.2.json) as well

### Unbuild

- `mUnbuild` - Extracts all parts of a Qlik Sense app (apart from the data itself) into JSON object. The resulted JSON object have the following format:

  - appProperties (`object`)
  - connections (`array`)
  - dimensions (`array`)
  - measures (`array`)
  - objects (`array`) - all other objects. Including sheets, charts, filters etc.
  - script (`string`)
  - variables (`array`)

The result JSON can be stored in file (or multiple files) and put under version control

### Build

- `mBuild` - Opposite to `unbuild`. Provide a JSON object with Qlik objects and this mixin will update the existing objects or, if they do not exists, it will create them. The structure of the input JSON object must be in specific format (see `unbuild`).

### **To preserve the changes the app have to be saved. The build command do not save the app automatically!**

Both `mBuild` and `mUnbuild` are throwing errors (if there are any errors of course). Because of this they need to be followed by `catch` ... just in case. For example:

```javascript
let build = await qDoc.mBuild(data).catch(function (e) {
  // do something with the error here
});
```

### Empty app

- `mEmptyApp` - purge the data from the app
  - `keepOneSelected` - `optional` `boolean` - if present and set to `true` this mixin will preserve the fields for which `qOneAndOnlyOne` is set to `true`. The mixin will do that by:
    - first get a list of all the fields that are matching that criteria
    - gets the current script and keeps it in a temporary variable
    - then it will replace the script by a custom script that just creates the required fields with just 1 record into them. Having the field and (at least) one record into it will preserve the `qOneAndOnlyOne` checkbox
    - then it will reload the app
    - replace the custom script with the original one
    - saves the app

## Methods

Full list of available methods can be found [here](https://countnazgul.github.io/enigma-mixin/)
