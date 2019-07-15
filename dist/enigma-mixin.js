/**
 * enigma-mixin v0.0.6
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
    const listBox = {
      "qInfo": {
        "qId": "",
        "qType": "Combo"
      },
      "field": {
        "qListObjectDef": {
          "qStateName": "$",
          "qDef": {
            "qFieldDefs": [],
            "qSortCriterias": [{
              "qSortByState": 1,
              "qExpression": {}
            }]
          },
          "qInitialDataFetch": [{
            "qTop": 0,
            "qLeft": 0,
            "qHeight": 100,
            "qWidth": 1
          }]
        }
      }
    };
    var objectDefinitions = {
      sessionList,
      variableList,
      listBox
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

    async function mGetListbox(fieldName) {
      try {
        let lbDef = objectDefinitions.listBox;
        lbDef.field.qListObjectDef.qDef.qFieldDefs.push(fieldName);
        let sessionObj = await this.createSessionObject(lbDef);
        let fieldValues = await sessionObj.getLayout();
        return fieldValues.field.qListObject;
      } catch (e) {
        return {
          error: e.message
        };
      }
    }

    var qTablesAndFields = {
      mGetTablesAndFields,
      mGetTables,
      mGetFields,
      mGetListbox
    };

    async function mGetAllExtensionObjects() {
      let allInfos = await this.getAllInfos();
      let extensionObjects = await filterOnlyExtensionObjects(this, allInfos);
      return extensionObjects;
    }

    const nonExtensionObjects = ["barchart", "bookmark", "combochart", "dimension", "embeddedsnapshot", "filterpane", "gauge", "kpi", "linechart", "listbox", "LoadModel", "map", "masterobject", "measure", "piechart", "pivot-table", "scatterplot", "sheet", "slide", "slideitem", "snapshot", "story", "StringExpression", "table", "treemap"];

    async function filterOnlyExtensionObjects(qDoc, allObjects) {
      let possibleExtensionObjects = allObjects.filter(function (o) {
        return nonExtensionObjects.indexOf(o.qType) == -1;
      });
      let realExtensionObjects = [];

      if (possibleExtensionObjects.length > 0) {
        for (let extObj of possibleExtensionObjects) {
          let isReallyExtension = await realExtensionCheck(qDoc, extObj.qId);

          if (isReallyExtension.isExtension) {
            realExtensionObjects.push({
              appName: qDoc.id,
              extName: isReallyExtension.qObjProps.extensionMeta.name,
              extVersion: isReallyExtension.qObjProps.version,
              extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
              extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
              extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
              qProps: isReallyExtension.qObjProps
            });
          }
        }

        return realExtensionObjects;
      } else {
        return [];
      }
    }

    const realExtensionCheck = async function (qDoc, objId) {
      let isExtension = false;
      let qObjProps = {};

      try {
        let qObj = await qDoc.getObject(objId);
        qObjProps = await qObj.getProperties();

        if (qObjProps.extensionMeta) {
          isExtension = true;
        }
      } catch (e) {
        console.log(`${e.message}`);
      }

      return {
        qObjProps,
        isExtension
      };
    };

    var extensionObjects = {
      mGetAllExtensionObjects
    };

    const docMixin = {
      types: ['Doc'],

      init(args) {},

      extend: { ...qSelections,
        ...qTablesAndFields,
        ...qVariables,
        ...extensionObjects
      }
    };
    var main = docMixin;

    return main;

}));
//# sourceMappingURL=enigma-mixin.js.map
