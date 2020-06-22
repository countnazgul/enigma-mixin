/**
 * enigma-mixin v0.0.11
 * Copyright (c) 2020 Stefan Stoichev
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
        throw new Error(e.message);
      }
    }

    async function mUpdateVariable(variable) {
      try {
        let variableContent = await this.getVariableById(variable.qInfo.qId);
        let newContent = await variableContent.setProperties(variable);
        return newContent;
      } catch (e) {
        throw new Error(e.message);
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
        throw new Error(e.message);
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
        throw new Error(e.message);
      }
    }

    async function mGetSelectionsCurrNative() {
      try {
        let selections = await iGetSelectionsNative(this);
        return selections;
      } catch (e) {
        throw new Error(e.message);
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
        throw new Error(e.message);
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
          throw new Error(e.message);
        }
      } catch (e) {
        throw new Error(e.message);
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
        throw new Error(e.message);
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
        throw new Error(e.message);
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
        throw new Error(e.message);
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
        throw new Error(e.message);
      }
    }

    var qTablesAndFields = {
      mGetTablesAndFields,
      mGetTables,
      mGetFields,
      mGetListbox
    };

    const nonExtensionObjects = ["barchart", "bookmark", "combochart", "dimension", "embeddedsnapshot", "filterpane", "gauge", "kpi", "linechart", "listbox", "LoadModel", "map", "masterobject", "measure", "piechart", "pivot-table", "scatterplot", "sheet", "slide", "slideitem", "snapshot", "story", "StringExpression", "table", "treemap"];

    async function mGetAllExtensionObjects() {
      let allInfos = await this.getAllInfos();
      let extensionObjects = await filterOnlyExtensionObjects(this, allInfos);
      return extensionObjects;
    }

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
              objId: isReallyExtension.qObjProps.qInfo.qId,
              objType: isReallyExtension.qObjProps.qInfo.qType,
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
        throw new Error(e.message);
      }

      return {
        qObjProps,
        isExtension
      };
    };

    var extensionObjects = {
      mGetAllExtensionObjects
    };

    const handlePromise = promise => {
      return promise.then(data => [data, undefined]).catch(error => Promise.resolve([undefined, error]));
    };

    var helpers = {
      handlePromise
    };

    const {
      handlePromise: handlePromise$1
    } = helpers;

    async function mUnbuild() {
      return await Promise.all([await unbuildVariables(this), await unbuildScript(this), await unbuildAppProperties(this), await unbuildConnections(this), await unbuildEntities(this)]).then(data => ({
        variables: data[0],
        script: data[1],
        appProperties: data[2],
        connections: data[3],
        dimensions: data[4].dimensions,
        measures: data[4].measures,
        objects: data[4].objects
      }));
    }

    async function unbuildVariables(app) {
      let objProp = objectDefinitions.variableList;
      objProp.qShowSession = false;
      objProp.qShowConfig = false;
      objProp.qShowReserved = false;
      let [sessionObj, sessionObjErr] = await handlePromise$1(app.createSessionObject(objProp));
      if (sessionObjErr) throw new Error('unbuild variables: cannot create session object');
      let [sessionObjLayout, sessionObjLayoutErr] = await handlePromise$1(sessionObj.getLayout());
      if (sessionObjLayoutErr) throw new Error('unbuild variables: cannot get session object layout');
      let [delSessionObj, delSessionObjErr] = await handlePromise$1(app.destroySessionObject(sessionObj.id));
      if (delSessionObjErr) throw new Error('unbuild variables: cannot delete session object');
      return sessionObjLayout.qVariableList.qItems;
    }

    async function unbuildScript(app) {
      let [script, scriptErr] = await handlePromise$1(app.getScript());
      if (scriptErr) throw new Error('unbuild script: cannot fetch script');
      return script;
    }

    async function unbuildAppProperties(app) {
      let [appProperties, appPropertiesError] = await handlePromise$1(app.getAppProperties());
      if (appPropertiesError) throw new Error('unbuild app properties: cannot fetch app properties');
      return appProperties;
    }

    async function unbuildConnections(app) {
      let [appConnections, appConnectionsErr] = await handlePromise$1(app.getConnections());
      if (appConnectionsErr) throw new Error('unbuild connections: cannot fetch app connections');
      return appConnections;
    }

    async function unbuildEntities(app) {
      let data = {
        dimensions: [],
        measures: [],
        objects: []
      };

      let [appAllInfos, appAllInfosErr] = await handlePromise$1(app.getAllInfos());
      if (appAllInfosErr) throw new Error('unbuild app infos: cannot fetch all app infos');
      return Promise.all(appAllInfos.map(async function (item) {
        if (item.qType == 'dimension') {
          let [dim, dimErr] = await handlePromise$1(app.getDimension(item.qId));
          if (dimErr) throw new Error('unbuild dimension: cannot fetch dimension');
          let [dimProp, dimPropErr] = await handlePromise$1(dim.getProperties());
          if (dimPropErr) throw new Error('unbuild dimension: cannot fetch dimension properties');
          data.dimensions.push(dimProp);
        }

        if (item.qType == 'measure') {
          let [measure, measureErr] = await handlePromise$1(app.getMeasure(item.qId));
          if (measureErr) throw new Error('unbuild dimension: cannot fetch measure');
          let [measureProp, measurePropErr] = await handlePromise$1(measure.getProperties());
          if (measurePropErr) throw new Error('unbuild dimension: cannot fetch measure properties');
          data.measures.push(measureProp);
        }

        if (item.qType != 'dimension' && item.qType != 'measure') {
          let o = await processObject(item, app);
          if (!o.error) data.objects.push(o);
          if (o.error) ;
        }
      })).then(() => data);
    }

    async function processObject(item, app) {
      let [obj, objErr] = await handlePromise$1(app.getObject(item.qId)); // embeddedsnapshot, snapshot, hiddenbookmark, story --> need to be handled differently

      if (objErr) return { ...item,
        error: true
      };
      let [parent, parentErr] = await handlePromise$1(obj.getParent());
      let [children, childrenErr] = await obj.getChildInfos();
      if (childrenErr) throw new Error('unbuild entity: cannot fetch entity children'); // parent-less objects - masterobject, sheet, appprops, LoadModel

      if (parentErr && children.length > 0) {
        let [propTree, propTreeErr] = await handlePromise$1(obj.getFullPropertyTree());
        if (propTreeErr) throw new Error('unbuild entity: cannot fetch entity full property tree');
        return propTree;
      }

      let [prop, propErr] = await handlePromise$1(obj.getProperties());
      if (propErr) throw new Error('unbuild entity: cannot fetch entity properties');
      return prop;
    }

    var unbuild = {
      mUnbuild
    };

    const {
      handlePromise: handlePromise$2
    } = helpers;

    async function mBuild({
      variables = [],
      script = false,
      appProperties = {},
      connections = [],
      measures = [],
      dimensions = [],
      objects = []
    }) {
      let [appConnections, error] = await handlePromise$2(this.getConnections());
      if (error) throw new Error('build: cannot get app connections');
      return Promise.all([await processMeasures(measures, this), await processDimensions(dimensions, this), await processVariables(variables, this), await processScript(script, this), await processAppProperties(appProperties, this), await processConnections(appConnections, connections, this), await processObjects(objects, this)]).then(function (d) {
        return {
          measures: d[0],
          dimensions: d[1],
          variables: d[2],
          script: d[3],
          appProperties: d[4],
          connections: d[5],
          objects: d[6]
        };
      });
    }

    async function processMeasures(measures, app) {
      return Promise.all(measures.map(async function (measure) {
        let [obj, objErr] = await handlePromise$2(app.getMeasure(measure.qInfo.qId)); // the measure do not exists and need to be created

        if (objErr) {
          let [created, error] = await handlePromise$2(app.createMeasure(measure));
          if (error) throw new Error(`build measure: cannot create measure "${measure.qInfo.qId}": ${error.message}`);
          return {
            qId: measure.qInfo.qId,
            status: 'Created'
          };
        } // the measure exists and need to be updated


        let [updated, error] = await handlePromise$2(obj.setProperties(measure));
        if (error) throw new Error(`build measure: cannot update measure "${measure.qInfo.qId}": ${error.message}`);
        return {
          qId: measure.qInfo.qId,
          status: 'Updated'
        };
      }));
    }

    async function processDimensions(dimensions, app) {
      return Promise.all(dimensions.map(async function (dimension) {
        let [obj, objErr] = await handlePromise$2(app.getDimension(dimension.qInfo.qId)); // the dimension do not exists and need to be created

        if (objErr) {
          let [created, error] = await handlePromise$2(app.createDimension(dimension));
          if (error) throw new Error(`build dimension: cannot create dimension "${dimension.qInfo.qId}": ${error.message}`);
          return {
            qId: dimension.qInfo.qId,
            status: 'Created'
          };
        } // the dimension exists and need to be updated


        let [updated, error] = await handlePromise$2(obj.setProperties(measure));
        if (error) throw new Error(`build dimension: cannot update dimension "${dimension.qInfo.qId}": ${error.message}`);
        return {
          qId: dimension.qInfo.qId,
          status: 'Updated'
        };
      }));
    }

    async function processScript(script, app) {
      let [s, error] = await handlePromise$2(app.setScript(script));
      if (error) throw new Error(`build script: cannot set script: ${error.message}`);
      return {
        status: 'Set'
      };
    }

    async function processAppProperties(appProperties, app) {
      let [update, error] = await handlePromise$2(app.setAppProperties(appProperties));
      if (error) throw new Error(`build app properties: cannot set app properties: ${error.message}`);
      return {
        status: 'Set'
      };
    }

    async function processVariables(variables, app) {
      return Promise.all(variables.map(async function (variable) {
        let [qVar, qVarError] = await handlePromise$2(app.getVariableByName(variable.qName));

        if (qVarError) {
          let [created, error] = await handlePromise$2(app.createVariableEx(variable));
          if (error) throw new Error(`build variable: cannot create variable "${variable.qName}": ${error.message}`);
          return {
            qId: variable.qName,
            status: 'Created'
          };
        }

        let [updated, error] = await handlePromise$2(qVar.setProperties(variable));
        if (error) throw new Error(`build variable: cannot update variable "${variable.qName}": ${error.message}`);
        return {
          qId: variable.qName,
          status: 'Updated'
        };
      }));
    }

    async function processConnections(appConnections, connections, app) {
      return Promise.all(connections.map(async function (connection) {
        let conn = appConnections.find(o => o.qName === connection.qName);

        if (!conn) {
          let [create, error] = await handlePromise$2(app.createConnection(connection));
          if (error) throw new Error(`build connection: cannot create connection "${connection.qName}": ${error.message}`);
          return {
            qId: connection.qName,
            status: 'Created'
          };
        }

        let [modify, error] = await handlePromise$2(app.modifyConnection(conn.qId, connection, true));
        if (error) throw new Error(`build connection: cannot modify connection "${connection.qName}": ${error.message}`);
        return {
          qId: connection.qName,
          status: 'Updated'
        };
      }));
    }

    async function processObjects(objects, app) {
      return Promise.all(objects.map(async function (object) {
        let objId, objType;
        let isGenericObject = false; //if the object is GenericObject - the id and the type are in a slightly different path

        if (!object.qInfo) {
          isGenericObject = true;
          objId = object.qProperty.qInfo.qId;
          objType = object.qProperty.qInfo.qType;
        } else {
          objId = object.qInfo.qId;
          objType = object.qInfo.qType;
        }

        let [obj, objError] = await handlePromise$2(app.getObject(objId));

        if (!objError) {
          // if its GenericObject we have to set the the props using setFullPropertyTree
          if (isGenericObject) {
            let [updated, error] = await handlePromise$2(obj.setFullPropertyTree(object));
            if (error) throw new Error(`build object: cannot update object "${objId}": ${error.message}`);
            return {
              qId: objId,
              status: 'Updated'
            };
          } // if not GenericObject then use the "usual" setProperties


          if (!isGenericObject) {
            let [updated, error] = await handlePromise$2(obj.setProperties(object));
            if (error) throw new Error(`build object: cannot update object "${objId}": ${error.message}`);
            return {
              qId: objId,
              status: 'Updated'
            };
          }
        } // same rules are applied when we have to create the object


        if (objError) {
          if (isGenericObject) {
            let [o, oError] = await handlePromise$2(app.createObject({
              qInfo: {
                qId: `${objId}`,
                qType: objType
              }
            }));
            if (oError) throw new Error(`build object: cannot create object "${objId}": ${oError.message}`);
            let [updated, updatedError] = await handlePromise$2(o.setFullPropertyTree(object));
            if (updatedError) throw new Error(`build object: cannot update object "${objId}": ${updatedError.message}`);
            return {
              qId: objId,
              status: 'Created'
            };
          }

          if (!isGenericObject) {
            let [created, createdError] = await handlePromise$2(app.createObject(object));
            if (createdError) throw new Error(`build object: cannot create object: "${objId}": ${createdError.message}`);
            return {
              qId: objId,
              status: 'Created'
            };
          }
        }
      }));
    }

    var build = {
      mBuild
    };

    // const unbuildScript = require('./mixins/doc/unbuild/script.js')
    // const unbuildAppProperties = require('./mixins/doc/unbuild/appProperties.js')
    // const unbuildConnections = require('./mixins/doc/unbuild/connections.js')
    // const unbuildEntities = require('./mixins/doc/unbuild/entities.js')

    const docMixin = [{
      types: ['Doc'],

      init(args) {},

      extend: { ...qSelections,
        ...qTablesAndFields,
        ...qVariables,
        ...extensionObjects,
        // ...unbuildVariables,
        // ...unbuildScript,
        // ...unbuildAppProperties,
        // ...unbuildConnections,
        // ...unbuildEntities,
        ...unbuild,
        ...build
      }
    }];
    var main = docMixin;

    return main;

}));
//# sourceMappingURL=enigma-mixin.js.map
