/**
 * enigma-mixin v0.0.16
 * Copyright (c) 2020 Stefan Stoichev
 * This library is licensed under MIT - See the LICENSE file for full details
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global['enigma-mixin'] = factory());
}(this, (function () { 'use strict';

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
        "qType": ""
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
            "qHeight": 10000,
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

    const handlePromise = promise => {
      return promise.then(data => [data, undefined]).catch(error => Promise.resolve([undefined, error]));
    };

    var helpers = {
      handlePromise
    };

    const {
      handlePromise: handlePromise$1
    } = helpers;

    async function mVariableGetAll(showSession = false, showConfig = false, showReserved = false) {
      let objProp = objectDefinitions.variableList;
      objProp.qShowSession = showSession;
      objProp.qShowConfig = showConfig;
      objProp.qShowReserved = showReserved;
      let [sessionObj, sessionObjError] = await handlePromise$1(this.createSessionObject(objProp));
      if (sessionObjError) throw new Error(sessionObjError.message);
      let [layout, layoutError] = await handlePromise$1(sessionObj.getLayout());
      if (layoutError) throw new Error(layoutError.message);
      return layout.qVariableList.qItems;
    }

    async function mVariableUpdateById(id, definition, comment = undefined) {
      let [variable, variableError] = await handlePromise$1(this.getVariableById(id));
      if (variableError) throw new Error(variableError.message);
      let [variableProps, variablePropsError] = await handlePromise$1(variable.getProperties());
      if (variablePropsError) throw new Error(variablePropsError.message);
      variableProps.qDefinition = definition;
      if (comment) variableProps.qComment = comment;
      let [setProps, setPropsError] = await handlePromise$1(variable.setProperties(variableProps));
      if (setPropsError) throw new Error(setPropsError.message);
      let [newProps, newPropsError] = await handlePromise$1(variable.getProperties());
      if (newPropsError) throw new Error(newPropsError.message);
      return newProps;
    }

    async function mVariableUpdateByName(name, definition, comment = undefined) {
      let [variable, variableError] = await handlePromise$1(this.getVariableByName(name));
      if (variableError) throw new Error(variableError.message);
      let [variableProps, variablePropsError] = await handlePromise$1(variable.getProperties());
      if (variablePropsError) throw new Error(variablePropsError.message);
      variableProps.qDefinition = definition;
      if (comment) variableProps.qComment = comment;
      let [setProps, setPropsError] = await handlePromise$1(variable.setProperties(variableProps));
      if (setPropsError) throw new Error(setPropsError.message);
      let [newProps, newPropsError] = await handlePromise$1(variable.getProperties());
      if (newPropsError) throw new Error(newPropsError.message);
      return newProps;
    }

    async function mVariableCreate(name = '', definition = '', comment = '') {
      let varProps = {
        "qInfo": {
          "qType": "variable"
        },
        "qName": name,
        "qDefinition": definition,
        "qComment": comment
      };
      let [created, createdError] = await handlePromise$1(this.createVariableEx(varProps));
      if (createdError) throw new Error(createdError.message);
      let [props, propsError] = await handlePromise$1(created.getProperties());
      if (propsError) throw new Error(propsError.message);
      return props;
    }

    var qVariables = {
      mVariableGetAll,
      mVariableUpdateById,
      mVariableUpdateByName,
      mVariableCreate
    };

    const {
      handlePromise: handlePromise$2
    } = helpers;

    async function iGetSelectionsNative(qDoc) {
      let [sessionObj, sessionObjError] = await handlePromise$2(qDoc.createSessionObject(objectDefinitions.sessionList));
      if (sessionObjError) throw new Error(sessionObjError.message);
      let [selections, selectionsError] = await handlePromise$2(sessionObj.getLayout());
      if (selectionsError) throw new Error(selectionsError.message);
      let [destroy, destroyError] = await handlePromise$2(qDoc.destroySessionObject(sessionObj.id));
      if (destroyError) throw new Error(destroyError.message);
      return selections;
    }

    async function mSelectionsAll() {
      let [selections, error] = await handlePromise$2(iGetSelectionsNative(this));
      if (error) throw new Error(error.message);
      return selections.qSelectionObject;
    }

    async function mSelectionsFields() {
      let [selections, error] = await handlePromise$2(iGetSelectionsNative(this));
      if (error) throw new Error(error.message);
      let fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
        return s.qField;
      });
      return fieldsSelected;
    }

    async function mSelectionsSimple(groupByField = false) {
      let [selections, error] = await handlePromise$2(iGetSelectionsNative(this));
      if (error) throw new Error(error.message);
      if (!groupByField) return selections.qSelectionObject.qSelections.map(function (s) {
        return s.qSelectedFieldSelectionInfo.map(function (f) {
          return {
            field: s.qField,
            value: f.qName
          };
        });
      }).flat();
      return selections.qSelectionObject.qSelections.map(function (s) {
        let values = s.qSelectedFieldSelectionInfo.map(function (f) {
          return f.qName;
        });
        return {
          field: s.qField,
          values
        };
      });
    }

    async function mSelectInField(fieldName, values, toggle = false) {
      let lbDef = objectDefinitions.listBox;
      lbDef.field.qListObjectDef.qDef.qFieldDefs = [fieldName];
      lbDef.qInfo.qType = "session-listbox";
      let [sessionObj, sessionObjErr] = await handlePromise$2(this.createSessionObject(lbDef));
      if (sessionObjErr) throw new Error(sessionObjErr.message);
      let [layout, layoutError] = await handlePromise$2(sessionObj.getLayout());
      if (layoutError) throw new Error(layoutError.message);
      let index = layout.field.qListObject.qDataPages[0].qMatrix.filter(function (m) {
        return values.indexOf(m[0].qText) > -1;
      }).map(function (e) {
        return e[0].qElemNumber;
      });
      let [selection, selectionError] = await handlePromise$2(sessionObj.selectListObjectValues('/field/qListObjectDef', index, toggle));
      if (selectionError) throw new Error(selectionError.message);
      let [destroy, destroyError] = await handlePromise$2(this.destroySessionObject(sessionObj.id));
      if (destroyError) throw new Error(destroyError.message);
      return selection;
    }

    var qSelections = {
      mSelectionsAll,
      mSelectionsFields,
      mSelectionsSimple,
      mSelectInField
    };

    const {
      handlePromise: handlePromise$3
    } = helpers;

    async function mGetTablesAndFields() {
      let [tables, error] = await handlePromise$3(this.getTablesAndKeys({}, {}, 0, true, false));
      if (error) throw new Error(error.message);
      return tables.qtr.map(function (t) {
        return t.qFields.map(function (f) {
          return {
            table: t.qName,
            field: f.qName
          };
        });
      }).flat();
    }

    async function mGetTables() {
      let [qTables, qTablesError] = await handlePromise$3(this.getTablesAndKeys({}, {}, 0, true, false));
      if (qTablesError) throw new Error(qTablesError.message);
      return qTables.qtr.map(t => t.qName);
    }

    async function mGetFields() {
      let [qTables, qTablesError] = await handlePromise$3(this.getTablesAndKeys({}, {}, 0, true, false));
      if (qTablesError) throw new Error(qTablesError.message);
      return qTables.qtr.map(function (t) {
        return t.qFields.map(function (f) {
          return f.qName;
        });
      }).flat();
    }

    async function mCreateSessionListbox(fieldName, type = "session-listbox") {
      let lbDef = objectDefinitions.listBox;
      lbDef.field.qListObjectDef.qDef.qFieldDefs = [fieldName];
      lbDef.qInfo.qType = type;
      let [sessionObj, sessionObjErr] = await handlePromise$3(this.createSessionObject(lbDef));
      if (sessionObjErr) throw new Error(sessionObjErr.message);
      let [layout, layoutError] = await handlePromise$3(sessionObj.getLayout());
      if (layoutError) throw new Error(layoutError.message);
      return {
        sessionObj,
        layout
      };
    }

    var qTablesAndFields = {
      mGetTablesAndFields,
      mGetTables,
      mGetFields,
      mCreateSessionListbox
    };

    const {
      handlePromise: handlePromise$4
    } = helpers;

    async function mExtensionObjectsAll() {
      let [allInfos, error] = await handlePromise$4(this.getAllInfos());
      if (error) throw new Error(error.message);
      return await filterOnlyExtensionObjects(this, allInfos);
    }

    async function filterOnlyExtensionObjects(qDoc, allObjects) {
      return await Promise.all(allObjects.map(async function (extObj) {
        let isReallyExtension = await realExtensionCheck(qDoc, extObj.qId);

        if (isReallyExtension.isExtension) {
          return {
            appName: qDoc.id,
            objId: isReallyExtension.qObjProps.qInfo.qId,
            objType: isReallyExtension.qObjProps.qInfo.qType,
            extName: isReallyExtension.qObjProps.extensionMeta.name,
            extVersion: isReallyExtension.qObjProps.version,
            extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
            extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
            extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
            qProps: isReallyExtension.qObjProps
          };
        }
      })).then(function (o) {
        // make sure we filter out all object which are not 
        // native object but are not extensions as well 
        return o.filter(function (a) {
          return a != undefined;
        });
      });
    }

    const realExtensionCheck = async function (qDoc, objId) {
      let nativeObjectTypes = ["barchart", "boxplot", "combochart", "distributionplot", "gauge", "histogram", "kpi", "linechart", "piechart", "pivot-table", "scatterplot", "table", "treemap", "extension", "map", "listbox", "filterpane", "title", "paragraph"];
      let [qObj, qObjError] = await handlePromise$4(qDoc.getObject(objId));
      if (qObjError) return {
        isExtension: false
      };
      let [qObjProps, qObjPropsError] = await handlePromise$4(qObj.getProperties());
      if (qObjPropsError) throw new Error(qObjPropsError.message);
      if (!qObjProps.visualization) return {
        isExtension: false
      };
      let isNative = nativeObjectTypes.indexOf(qObjProps.visualization);
      return {
        qObjProps,
        isExtension: isNative == -1 && qObjProps.extensionMeta ? true : false
      };
    };

    var extensionObjects = {
      mExtensionObjectsAll
    };

    const {
      handlePromise: handlePromise$5
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
      let [sessionObj, sessionObjErr] = await handlePromise$5(app.createSessionObject(objProp));
      if (sessionObjErr) throw new Error('unbuild variables: cannot create session object');
      let [sessionObjLayout, sessionObjLayoutErr] = await handlePromise$5(sessionObj.getLayout());
      if (sessionObjLayoutErr) throw new Error('unbuild variables: cannot get session object layout');
      let [delSessionObj, delSessionObjErr] = await handlePromise$5(app.destroySessionObject(sessionObj.id));
      if (delSessionObjErr) throw new Error('unbuild variables: cannot delete session object');
      return sessionObjLayout.qVariableList.qItems;
    }

    async function unbuildScript(app) {
      let [script, scriptErr] = await handlePromise$5(app.getScript());
      if (scriptErr) throw new Error('unbuild script: cannot fetch script');
      return script;
    }

    async function unbuildAppProperties(app) {
      let [appProperties, appPropertiesError] = await handlePromise$5(app.getAppProperties());
      if (appPropertiesError) throw new Error('unbuild app properties: cannot fetch app properties');
      return appProperties;
    }

    async function unbuildConnections(app) {
      let [appConnections, appConnectionsErr] = await handlePromise$5(app.getConnections());
      if (appConnectionsErr) throw new Error('unbuild connections: cannot fetch app connections');
      return appConnections;
    }

    async function unbuildEntities(app) {
      let data = {
        dimensions: [],
        measures: [],
        objects: []
      };

      let [appAllInfos, appAllInfosErr] = await handlePromise$5(app.getAllInfos());
      if (appAllInfosErr) throw new Error('unbuild app infos: cannot fetch all app infos');
      return Promise.all(appAllInfos.map(async function (item) {
        if (item.qType == 'dimension') {
          let [dim, dimErr] = await handlePromise$5(app.getDimension(item.qId));
          if (dimErr) throw new Error('unbuild dimension: cannot fetch dimension');
          let [dimProp, dimPropErr] = await handlePromise$5(dim.getProperties());
          if (dimPropErr) throw new Error('unbuild dimension: cannot fetch dimension properties');
          data.dimensions.push(dimProp);
        }

        if (item.qType == 'measure') {
          let [measure, measureErr] = await handlePromise$5(app.getMeasure(item.qId));
          if (measureErr) throw new Error('unbuild dimension: cannot fetch measure');
          let [measureProp, measurePropErr] = await handlePromise$5(measure.getProperties());
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
      let [obj, objErr] = await handlePromise$5(app.getObject(item.qId)); // embeddedsnapshot, snapshot, hiddenbookmark, story --> need to be handled differently

      if (objErr) return { ...item,
        error: true
      };
      let [parent, parentErr] = await handlePromise$5(obj.getParent());
      let [children, childrenErr] = await handlePromise$5(obj.getChildInfos());
      if (childrenErr) throw new Error(`unbuild entity: cannot fetch entity children`); // parent-less objects - masterobject, sheet, appprops, LoadModel

      if (parentErr && children.length > 0) {
        let [propTree, propTreeErr] = await handlePromise$5(obj.getFullPropertyTree());
        if (propTreeErr) throw new Error('unbuild entity: cannot fetch entity full property tree');
        return propTree;
      }

      let [prop, propErr] = await handlePromise$5(obj.getProperties());
      if (propErr) throw new Error('unbuild entity: cannot fetch entity properties');
      return prop;
    }

    var unbuild = {
      mUnbuild
    };

    const {
      handlePromise: handlePromise$6
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
      let [appConnections, error] = await handlePromise$6(this.getConnections());
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
        let [obj, objErr] = await handlePromise$6(app.getMeasure(measure.qInfo.qId)); // the measure do not exists and need to be created

        if (objErr) {
          let [created, error] = await handlePromise$6(app.createMeasure(measure));
          if (error) throw new Error(`build measure: cannot create measure "${measure.qInfo.qId}": ${error.message}`);
          return {
            qId: measure.qInfo.qId,
            status: 'Created'
          };
        } // the measure exists and need to be updated


        let [updated, error] = await handlePromise$6(obj.setProperties(measure));
        if (error) throw new Error(`build measure: cannot update measure "${measure.qInfo.qId}": ${error.message}`);
        return {
          qId: measure.qInfo.qId,
          status: 'Updated'
        };
      }));
    }

    async function processDimensions(dimensions, app) {
      return Promise.all(dimensions.map(async function (dimension) {
        let [obj, objErr] = await handlePromise$6(app.getDimension(dimension.qInfo.qId)); // the dimension do not exists and need to be created

        if (objErr) {
          let [created, error] = await handlePromise$6(app.createDimension(dimension));
          if (error) throw new Error(`build dimension: cannot create dimension "${dimension.qInfo.qId}": ${error.message}`);
          return {
            qId: dimension.qInfo.qId,
            status: 'Created'
          };
        } // the dimension exists and need to be updated


        let [updated, error] = await handlePromise$6(obj.setProperties(measure));
        if (error) throw new Error(`build dimension: cannot update dimension "${dimension.qInfo.qId}": ${error.message}`);
        return {
          qId: dimension.qInfo.qId,
          status: 'Updated'
        };
      }));
    }

    async function processScript(script, app) {
      let [s, error] = await handlePromise$6(app.setScript(script));
      if (error) throw new Error(`build script: cannot set script: ${error.message}`);
      return {
        status: 'Set'
      };
    }

    async function processAppProperties(appProperties, app) {
      let [update, error] = await handlePromise$6(app.setAppProperties(appProperties));
      if (error) throw new Error(`build app properties: cannot set app properties: ${error.message}`);
      return {
        status: 'Set'
      };
    }

    async function processVariables(variables, app) {
      return Promise.all(variables.map(async function (variable) {
        let [qVar, qVarError] = await handlePromise$6(app.getVariableByName(variable.qName));

        if (qVarError) {
          let [created, error] = await handlePromise$6(app.createVariableEx(variable));
          if (error) throw new Error(`build variable: cannot create variable "${variable.qName}": ${error.message}`);
          return {
            qId: variable.qName,
            status: 'Created'
          };
        }

        let [updated, error] = await handlePromise$6(qVar.setProperties(variable));
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
          let [create, error] = await handlePromise$6(app.createConnection(connection));
          if (error) throw new Error(`build connection: cannot create connection "${connection.qName}": ${error.message}`);
          return {
            qId: connection.qName,
            status: 'Created'
          };
        }

        let [modify, error] = await handlePromise$6(app.modifyConnection(conn.qId, connection, true));
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

        let [obj, objError] = await handlePromise$6(app.getObject(objId));

        if (!objError) {
          // if its GenericObject we have to set the the props using setFullPropertyTree
          if (isGenericObject) {
            let [updated, error] = await handlePromise$6(obj.setFullPropertyTree(object));
            if (error) throw new Error(`build object: cannot update object "${objId}": ${error.message}`);
            return {
              qId: objId,
              status: 'Updated'
            };
          } // if not GenericObject then use the "usual" setProperties


          if (!isGenericObject) {
            let [updated, error] = await handlePromise$6(obj.setProperties(object));
            if (error) throw new Error(`build object: cannot update object "${objId}": ${error.message}`);
            return {
              qId: objId,
              status: 'Updated'
            };
          }
        } // same rules are applied when we have to create the object


        if (objError) {
          if (isGenericObject) {
            let [o, oError] = await handlePromise$6(app.createObject({
              qInfo: {
                qId: `${objId}`,
                qType: objType
              }
            }));
            if (oError) throw new Error(`build object: cannot create object "${objId}": ${oError.message}`);
            let [updated, updatedError] = await handlePromise$6(o.setFullPropertyTree(object));
            if (updatedError) throw new Error(`build object: cannot update object "${objId}": ${updatedError.message}`);
            return {
              qId: objId,
              status: 'Created'
            };
          }

          if (!isGenericObject) {
            let [created, createdError] = await handlePromise$6(app.createObject(object));
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

})));
//# sourceMappingURL=enigma-mixin.js.map
