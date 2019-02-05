/**
 * enigma-mixin v0.0.3
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

    async function mGetAllVariables({
      showSession = false,
      showConfig = false,
      showReserved = false
    } = {}) {
      let objProp = objectDefinitions.variableList;
      objProp.qShowSession = showSession;
      objProp.qShowConfig = showConfig;
      objProp.qShowReserved = showReserved;
      let sessionObj = await this.createSessionObject(objProp);
      let sessionObjLayout = await sessionObj.getLayout();
      return sessionObjLayout.qVariableList.qItems;
    }

    async function mUpdateVariable(variable) {
      let variableContent = await this.getVariableById(variable.qInfo.qId);
      let newContent = await variableContent.setProperties(variable);
      return newContent;
    }

    async function mCreateVariable({
      variableName,
      variableComment = '',
      variableDefinition
    }) {
      let _this = this;

      let varProps = {
        "qInfo": {
          "qType": "variable"
        },
        "qName": variableName,
        "qComment": variableComment,
        "qDefinition": variableDefinition
      };
      let result = await _this.createVariableEx(varProps);
      return result;
    }

    var variables = {
      mGetAllVariables,
      mUpdateVariable,
      mCreateVariable
    };

    async function mGetCurrSelectionFields() {
      let sessionObj = await this.createSessionObject(objectDefinitions.sessionList);
      let selections = await sessionObj.getLayout();
      return selections;
    }
    /**
     * Get current selections
     */


    async function mGetCurrentSelections() {
      let selections = await getCurrSelectionFields();
      let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
        return s.qField;
      });
      return {
        selections: selections.qSelectionObject.qSelections,
        fields: fieldsSelected
      };
    }
    /**
     * Select value(s) in a field
     * @param {string} fieldName - Name of the field
     * @param {array} values - String array with the values to be selected
     * @param {boolean} [toggle=false] toggle - How to apply the selection
     */


    async function mSelectInField({
      fieldName,
      values,
      toggle = false
    }) {
      let field = await this.getField(fieldName);
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
      mGetCurrSelectionFields,
      mSelectInField,
      mGetCurrentSelections
    };

    // async function getTablesAndKeys() {
    //     let tables = await _this.api.getTablesAndKeys({}, {}, 0, true, false)
    //     let f = [];
    //     for (let table of tables.qtr) {
    //         for (let field of table.qFields) {
    //             f.push({ table: table.qName, field: field.qName })
    //         }
    //     }
    //     return { tables: tables, fields: f }
    // }
    async function mGetTablesAndFields() {
      let tables = await this.getTablesAndKeys({}, {}, 0, true, false);
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

    async function mGetTables() {
      let tables = await this.getTablesAndKeys({}, {}, 0, true, false);
      let t = [];

      for (let table of tables.qtr) {
        t.push(table.qName);
      }

      return t;
    }

    async function mGetFields() {
      let tables = await this.getTablesAndKeys({}, {}, 0, true, false);
      let f = [];

      for (let table of tables.qtr) {
        for (let field of table.qFields) {
          f.push(field.qName);
        }
      }

      return f;
    }

    var tables = {
      // getTablesAndKeys,
      mGetTablesAndFields,
      mGetTables,
      mGetFields
    };

    const docMixin = {
      types: ['Doc'],

      init(args) {
      },

      extend: { ...selections,
        ...tables,
        ...variables
      }
    };
    var main = docMixin;

    return main;

}));
//# sourceMappingURL=enigma-mixin.js.map
