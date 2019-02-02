/**
 * enigma-mixin v0.0.1
 * Copyright (c) 2019 Stefan Stoichev
 * This library is licensed under MIT - See the LICENSE file for full details
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global['enigma-mixin'] = factory());
}(this, function () { 'use strict';

    const sessionList = {
      "qInfo": {
        "qId": "",
        "qType": "SessionLists"
      },
      "qSelectionObjectDef": {}
    };
    const variableList = {
      "qInfo": {
        "qType": "VariableList"
      },
      "qVariableListDef": {
        "qType": "variable"
      }
    };
    var objectDefinitions = {
      sessionList,
      variableList
    };

    async function getAllVariables({
      qDoc,
      showSession = false,
      showConfig = false,
      showReserved = false
    }) {
      let objProp = objectDefinitions.variableList;
      objProp.qShowSession = showSession, objProp.qShowConfig = showConfig, objProp.qShowReserved = showReserved;
      let sessionObj = await qDoc.createSessionObject(objProp);
      let sessionObjLayout = await sessionObj.getLayout();
      return sessionObjLayout;
    }

    async function updateVariable({
      qDoc,
      variable
    }) {
      let variableContent = await qDoc.getVariableById(variable.qInfo.qId);
      let newContent = await variableContent.setProperties(variable);
      return newContent;
    }

    async function createVariable({
      qDoc,
      variableName,
      variableComment = '',
      variableDefinition
    }) {
      let varProps = {
        "qInfo": {
          "qType": "variable"
        },
        "qName": variableName,
        "qComment": variableComment,
        "qDefinition": variableDefinition
      };
      let result = await doc.createVariableEx(varProps);
      return result;
    }

    var variables = {
      getAllVariables,
      updateVariable,
      createVariable
    };

    async function getCurrSelectionFields() {
      let sessionObj = await _this.api.createSessionObject(objectDefinitions.sessionList);
      let selections = await sessionObj.getLayout();
      return selections;
    }

    async function getCurrentSelections() {
      let selections = await getCurrSelectionFields();
      let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
        return s.qField;
      }); // let fields = await getSelectionFields(doc, fieldsSelected)

      return {
        selections: selections.qSelectionObject.qSelections,
        fields: fieldsSelected
      };
    }

    async function selectInField({
      fieldName,
      values,
      toggle = false
    }) {
      let field = await _this.api.getField(fieldName);
      let valuesToSelect = values.map(function (v) {
        return {
          qText: v
        };
      });

      try {
        let selection = await field.selectValues({
          qFieldValues: valuesToSelect,
          qToggleMode: toggle
        });
        return selection;
      } catch (e) {
        console.log(e.message);
        return false;
      }
    }

    var selections = {
      getCurrSelectionFields,
      selectInField,
      getCurrentSelections
    };

    async function getTablesAndKeys(qDoc) {
      let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false);
      let f = [];

      for (let table of tables.qtr) {
        for (let field of table.qFields) {
          f.push({
            table: table.qName,
            field: field.qName
          });
        }
      }

      return {
        tables: tables,
        fields: f
      };
    }

    async function getTablesAndFields(qDoc) {
      let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false);
      let f = [];

      for (let table of tables.qtr) {
        for (let field of table.qFields) {
          f.push({
            table: table.qName,
            field: field.qName
          });
        }
      }

      return f;
    }

    async function getTables(qDoc) {
      let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false);
      let t = [];

      for (let table of tables.qtr) {
        t.push(table.qName);
      }

      return t;
    }

    async function getFields(qDoc) {
      let tables = await qDoc.getTablesAndKeys({}, {}, 0, true, false);
      let f = [];

      for (let table of tables.qtr) {
        for (let field of table.qFields) {
          f.push(field.qName);
        }
      }

      return f;
    }

    var tables = {
      getTablesAndKeys,
      getTablesAndFields,
      getTables,
      getFields
    };

    const docMixin = {
      types: ['Doc'],

      init(args) {
        _this = args;
        ConfiguredPromise = args.config.Promise;
      },

      extend: {
        mixin: {
          qVariables: variables,
          qSelections: selections,
          qTablesAndFields: tables
        }
      }
    };
    var main = docMixin;

    return main;

}));
//# sourceMappingURL=enigma-mixin.js.map
