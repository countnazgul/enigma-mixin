/**
 * enigma-mixin v0.0.4
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

    async function mGetVariablesAll({
      showSession = false,
      showConfig = false,
      showReserved = false
    } = {}) {
      let objProp = objectDefinitions.variableList;
      objProp.qShowSession = showSession;
      objProp.qShowConfig = showConfig;
      objProp.qShowReserved = showReserved;

      try {
        let sessionObj = await this.createSessionObject(objProp);
        let sessionObjLayout = await sessionObj.getLayout();
        return sessionObjLayout.qVariableList.qItems;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    async function mUpdateVariable(variable) {
      try {
        let variableContent = await this.getVariableById(variable.qInfo.qId);
        let newContent = await variableContent.setProperties(variable);
        return newContent;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    async function mCreateVariable({
      name,
      comment = '',
      definition
    }) {
      let varProps = {
        "qInfo": {
          "qType": "variable"
        },
        "qName": name,
        "qComment": comment,
        "qDefinition": definition
      };

      try {
        let result = await this.createVariableEx(varProps);
        return result;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    var qVariables = {
      mGetVariablesAll,
      mUpdateVariable,
      mCreateVariable
    };

    async function iGetSelectionsNative(qDoc) {
      try {
        let sessionObj = await qDoc.createSessionObject(objectDefinitions.sessionList);
        let selections = await sessionObj.getLayout();
        return selections;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    async function mGetSelectionsCurrNative() {
      try {
        let selections = await iGetSelectionsNative(this);
        return selections;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }
    /**
     * Get current selections
     */


    async function mGetSelectionsCurr() {
      try {
        let selections = await iGetSelectionsNative(this);
        let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
          return s.qField;
        });
        return {
          selections: selections.qSelectionObject.qSelections,
          fields: fieldsSelected
        };
      } catch (e) {
        return {
          error: e.message
        };
      }
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
      try {
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
          return {
            error: e.message
          };
        }
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    var qSelections = {
      mGetSelectionsCurr,
      mGetSelectionsCurrNative,
      mSelectInField
    };

    async function mGetTablesAndFields() {
      try {
        let tables = await this.getTablesAndKeys({}, {}, 0, true, false);
        let f = [];

        if (tables.qtr.length == 0) {
          return f;
        } else {
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
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    async function mGetTables() {
      try {
        let qTables = await this.getTablesAndKeys({}, {}, 0, true, false);
        let tables = [];

        if (qTables.length == 0) {
          return tables;
        } else {
          for (let table of qTables.qtr) {
            tables.push(table.qName);
          }

          return tables;
        }
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    async function mGetFields() {
      try {
        let qTables = await this.getTablesAndKeys({}, {}, 0, true, false);
        let fields = [];

        for (let table of qTables.qtr) {
          for (let field of table.qFields) {
            fields.push(field.qName);
          }
        }

        return fields;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    var qTablesAndFields = {
      mGetTablesAndFields,
      mGetTables,
      mGetFields
    };

    const docMixin = {
      types: ['Doc'],

      init(args) {},

      extend: { ...qSelections,
        ...qTablesAndFields,
        ...qVariables
      }
    };
    var main = docMixin;

    return main;

}));
//# sourceMappingURL=enigma-mixin.js.map
