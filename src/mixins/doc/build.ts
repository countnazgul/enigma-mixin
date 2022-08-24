// TODO: ...
//  * appProperties - where the icon?
//  * appProperties - theme is different from the source app?
//  * connections   - created, but why not visible?
//  * purge         - option to remove everything from the app before
//                    build is started

export async function mBuild(arg: {
  variables?: EngineAPI.IGenericVariableProperties[];
  script?: string;
  appProperties?: EngineAPI.INxAppProperties;
  connections?: EngineAPI.IConnection[];
  measures?: EngineAPI.IGenericMeasureProperties[];
  dimensions?: EngineAPI.IGenericDimensionProperties[];
  objects?: (
    | EngineAPI.IGenericObjectEntry
    | EngineAPI.IGenericObjectProperties
  )[];
  bookmarks?: {
    properties: EngineAPI.IGenericBookmarkProperties;
    layout: EngineAPI.IGenericBookmarkLayout;
    setAnalysisRaw: string;
    setAnalysisDestructed: {
      field: string;
      values: string | EngineAPI.IFieldValue;
      type: string;
    }[];
  }[];
}) {
  return Promise.all([
    await processMeasures(arg.measures, this),
    await processDimensions(arg.dimensions, this),
    await processScript(arg.script, this),
    await processAppProperties(arg.appProperties, this),
    await processConnections(arg.connections, this),
    await processVariables(arg.variables, this),
    await processObjects(arg.objects, this),
  ])
    .then(function (d) {
      return {
        measures: d[0],
        dimensions: d[1],
        script: d[2],
        appProperties: d[3],
        connections: d[4],
        variables: d[5],
        objects: d[6],
      };
    })
    .then((data) => {
      const notNullKeys = Object.keys(data).filter((k) => {
        return data[k] != undefined;
      });

      return Object.fromEntries(
        Object.entries(data).filter(([key]) =>
          Array.from(notNullKeys).includes(key as any)
        )
      );
    });
}

async function processMeasures(
  measures: EngineAPI.IGenericMeasureProperties[],
  app: EngineAPI.IApp
) {
  if (measures) {
    return Promise.all(
      measures.map(async function (measure) {
        let obj = {} as EngineAPI.IGenericMeasure;

        // the measure do not exists and need to be created
        try {
          obj = await app.getMeasure(measure.qInfo.qId);
        } catch (e) {}

        if (!obj.id) {
          const created = await app.createMeasure(measure);

          return { qId: measure.qInfo.qId, status: "Created" };
        }

        // the measure exists and need to be updated
        const updated = await obj.setProperties(measure);

        return { qId: measure.qInfo.qId, status: "Updated" };
      })
    );
  }
}

async function processDimensions(
  dimensions: EngineAPI.IGenericDimensionProperties[],
  app: EngineAPI.IApp
) {
  if (dimensions) {
    return Promise.all(
      dimensions.map(async function (dimension) {
        let obj = {} as EngineAPI.IGenericDimension;

        try {
          obj = await app.getDimension(dimension.qInfo.qId);
        } catch (e) {}

        // the dimension do not exists and need to be created
        if (!(obj as any).id) {
          const created = await app.createDimension(dimension);

          return { qId: dimension.qInfo.qId, status: "Created" };
        }

        // the dimension exists and need to be updated
        const updated = await (obj as any).setProperties(dimension);

        return { qId: dimension.qInfo.qId, status: "Updated" };
      })
    );
  }
}

async function processScript(script: string, app: EngineAPI.IApp) {
  if (script) {
    const s = await app.setScript(script);

    return { status: "Set" };
  }
}

async function processAppProperties(
  appProperties: EngineAPI.INxAppProperties,
  app: EngineAPI.IApp
) {
  if (appProperties) {
    const update = await app.setAppProperties(appProperties);

    return { status: "Set" };
  }
}

async function processConnections(
  connections: EngineAPI.IConnection[],
  app: EngineAPI.IApp
) {
  if (connections) {
    const appConnections = await app.getConnections();

    return Promise.all(
      connections.map(async function (connection) {
        const conn = appConnections.find((o) => o.qName === connection.qName);

        if (!conn) {
          const create = await app.createConnection(connection);

          return { qId: connection.qName, status: "Created" };
        }

        const modify = await app.modifyConnection(conn.qId, connection, true);

        return { qId: connection.qName, status: "Updated" };
      })
    );
  }
}

async function processVariables(
  variables: EngineAPI.IGenericVariableProperties[],
  app: EngineAPI.IApp
) {
  if (variables) {
    return Promise.all(
      variables.map(async function (variable) {
        let qVar: EngineAPI.IGenericVariable;
        try {
          qVar = await app.getVariableByName(variable.qName);
        } catch (e) {}

        if (!qVar || !qVar.id) {
          const created = await app.createVariableEx(variable);

          return { qId: variable.qName, status: "Created" };
        }

        const updated = await qVar.setProperties(variable);

        return { qId: variable.qName, status: "Updated" };
      })
    );
  }
}

async function processObjects(
  objects: (
    | EngineAPI.IGenericObjectEntry
    | EngineAPI.IGenericObjectProperties
  )[],
  app: EngineAPI.IApp
) {
  if (objects) {
    return Promise.all(
      objects.map(async function (object) {
        let objId: string, objType: string;
        let isGenericObject = false;

        //if the object is GenericObject - the id and the type are in a slightly different path
        if (!(object as EngineAPI.IGenericObjectProperties).qInfo) {
          isGenericObject = true;
          objId = object.qProperty.qInfo.qId;
          objType = object.qProperty.qInfo.qType;
        } else {
          objId = (object as EngineAPI.IGenericObjectProperties).qInfo.qId;
          objType = (object as EngineAPI.IGenericObjectProperties).qInfo.qType;
        }

        let obj: EngineAPI.IGenericObject;

        try {
          obj = await app.getObject(objId);
        } catch (e) {}

        if (obj && obj.id) {
          // if its GenericObject we have to set the the props using setFullPropertyTree
          if (isGenericObject) {
            const updated = obj.setFullPropertyTree(
              object as EngineAPI.IGenericObjectEntry
            );

            return { qId: objId, status: "Updated" };
          }

          // if not GenericObject then use the "usual" setProperties
          if (!isGenericObject) {
            const updated = await obj.setProperties(
              object as EngineAPI.IGenericObjectProperties
            );

            return { qId: objId, status: "Updated" };
          }
        }

        // same rules are applied when we have to create the object
        if (!obj || !obj.id) {
          if (isGenericObject) {
            const o = await app.createObject({
              qInfo: {
                qId: `${objId}`,
                qType: objType,
              },
            });

            const updated = await o.setFullPropertyTree(
              object as EngineAPI.IGenericObjectEntry
            );

            return { qId: objId, status: "Created" };
          }

          if (!isGenericObject) {
            const created = await app.createObject(
              object as EngineAPI.IGenericObjectProperties
            );

            return { qId: objId, status: "Created" };
          }
        }
      })
    );
  }
}
