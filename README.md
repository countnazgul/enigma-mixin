## **Under development!**

# enigma.js mixins

enigma.js functionality can be extended via [mixin](https://github.com/qlik-oss/enigma.js/blob/41c33604f7e384d0a34a502bd29e9f3db94dd9d2/docs/api.md#mixins). This repository contains set of mixins that can be added to any `enigma.js` instance. Some of the mixins are quite trivial but i've been lazy enough to remember all the objects/params and decided to create these "shortcuts" :)

btw who ever made the `mixin` option available in `enigma.js` ... Thank you!

## Installation

This project don't include `enigma.js` itself. Make sure that `enigma.js` is installed:

>`npm install enigma.js`

After this install this project:

>`npm install enigma-mixins`

## Init

```javascript
import enigma from 'enigma.js'
import enigmaMixins from 'enigma-mixins'

// Create enigma session as usual
// but include the mixin property
let session = enigma.create({
    schema,
    mixins: [enigmaMixins],
    url: 'ws://localhost:4848/app/engineData',
    createSocket: url => new WebSocket(url),
});
```

## Usage

At the moment this project includes only mixins that are extending the `enigma.js` `Doc` object. After the mixin is imported a new set of functions will be available in the `Doc` instance.

```javascript
let global = await session.open()
let qDoc = await global.openDoc('C:\\Users\\User1\\Documents\\Qlik\\Sense\\Apps\\Helpdesk Management.qvf')
```

After this `qDoc` will have all the mixins available under `qDoc.mixin` 

## Mixins

The available `mixin` are separated in 3 categories:

* qSelections 
* qTableAndFields 
* qVariables

### qSelections

* getCurrSelectionFields - returns the current selections (if any)
* getCurrentSelections - similar as `getCurrSelectionFields` but simplifies the output - value <-> field format 
* selectInField - select a value(s) in a specified field

### qTableAndFields

* getTablesAndKeys - ??? 
* getTablesAndFields - returns an object array with the field <-> table relation
* getTables - returns an array with all table names
* getFields - returns an array with all field names

### qVariables

* getAllVariables - return a list with all variables in a document
* updateVariable - update existing variable
* createVariable - create new variable
