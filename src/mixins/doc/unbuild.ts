import { INxAppProperties } from "../../index.doc";
import { getBookmarkMeta } from "./bookmarks";

type TSections =
  | "variables"
  | "script"
  | "appProperties"
  | "connections"
  | "bookmarks"
  | "measures"
  | "dimensions"
  | "objects";

export async function mUnbuild(sections?: TSections[]) {
  const _this: EngineAPI.IApp = this;
  sections ? sections : [];

  return await Promise.all([
    await unbuildVariables(
      _this,
      sections ? sections.includes("variables") : true
    ),
    await unbuildScript(_this, sections ? sections.includes("script") : true),
    await unbuildAppProperties(
      _this,
      sections ? sections.includes("appProperties") : true
    ),
    await unbuildConnections(
      _this,
      sections ? sections.includes("connections") : true
    ),
    await unbuildEntities(
      _this,
      sections
        ? sections.includes("dimensions") ||
            sections.includes("objects") ||
            sections.includes("measures")
        : true,
      sections
    ),
    await unbuildBookmarks(
      _this,
      sections ? sections.includes("bookmarks") : true
    ),
  ])
    .then((data) => ({
      variables: data[0],
      script: data[1],
      appProperties: data[2],
      connections: data[3],
      dimensions: data[4].dimensions ? data[4].dimensions : [],
      measures: data[4].measures ? data[4].measures : [],
      objects: data[4].objects ? data[4].objects : [],
      bookmarks: data[5],
    }))
    .then((data) => {
      if (!sections) return data;

      const sectionsDistinct = new Set(sections);

      return Object.fromEntries(
        Object.entries(data).filter(([key]) =>
          Array.from(sectionsDistinct).includes(key as any)
        )
      );
    });
}

async function unbuildVariables(
  app: EngineAPI.IApp,
  unBuild: boolean
): Promise<EngineAPI.IGenericVariableProperties[]> {
  if (unBuild) {
    const objProp: EngineAPI.IGenericVariableListProperties = {
      qInfo: {
        qType: "VariableList",
      },
      qVariableListDef: {
        qData: {},
        qType: "variable",
        qShowReserved: false,
        qShowConfig: false,
      },
    };

    const sessionObj = await app.createSessionObject(objProp);

    const sessionObjLayout = await sessionObj.getLayout();

    await app.destroySessionObject(sessionObj.id);

    return await Promise.all(
      (sessionObjLayout as any).qVariableList.qItems.map(
        async (variable: EngineAPI.IGenericVariableListProperties) => {
          const qVariable = await app.getVariableById(variable.qInfo.qId);
          return await qVariable.getProperties();
        }
      )
    );
  }
}

async function unbuildScript(app: EngineAPI.IApp, unBuild: boolean) {
  if (unBuild) {
    const script = await app.getScript();

    // return script.replace(/\r\n/g, "");
    return script;
  }

  return "";
}

async function unbuildAppProperties(app: EngineAPI.IApp, unBuild: boolean) {
  let appProperties = {} as INxAppProperties;

  if (unBuild) {
    appProperties = await app.getAppProperties();
  }
  return appProperties;
}

async function unbuildConnections(app: EngineAPI.IApp, unBuild: boolean) {
  if (unBuild) {
    const appConnections = await app.getConnections();

    return appConnections;
  }
}

async function unbuildEntities(
  app: EngineAPI.IApp,
  unBuild: boolean,
  sections: TSections[]
) {
  const data: {
    dimensions: EngineAPI.IGenericDimensionProperties[];
    measures: EngineAPI.IGenericMeasureProperties[];
    objects: (
      | EngineAPI.IGenericObjectEntry
      | EngineAPI.IGenericObjectProperties
    )[];
  } = {
    dimensions: [],
    measures: [],
    objects: [],
  };

  if (unBuild) {
    // get list of all objects
    const appAllInfos = await app.getAllInfos();

    return Promise.all(
      appAllInfos.map(async function (item) {
        // try {
        if (item.qType == "dimension") {
          if (!sections || sections.includes("dimensions")) {
            const dim = await app.getDimension(item.qId);
            const dimProp = await dim.getProperties();
            data.dimensions.push(dimProp);
          }
        }

        if (item.qType == "measure") {
          if (!sections || sections.includes("measures")) {
            const measure = await app.getMeasure(item.qId);
            const measureProp = await measure.getProperties();
            data.measures.push(measureProp);
          }
        }

        if (
          item.qType != "dimension" &&
          item.qType != "measure" &&
          item.qType.indexOf("snapshot") == -1 &&
          item.qType != "bookmark" &&
          item.qType != "appprops"
        ) {
          if (!sections || sections.includes("objects")) {
            const o = await processObject(item, app);

            data.objects.push(o);
          }
        }
      })
    ).then(() => data);
  }

  return data;
}

async function unbuildBookmarks(app: EngineAPI.IApp, unBuild: boolean) {
  if (unBuild) {
    const listObj: EngineAPI.IGenericBookmarkListProperties = {
      qInfo: {
        qId: "BookmarkList",
        qType: "BookmarkList",
      },
      qBookmarkListDef: {
        qType: "bookmark",
        qData: {
          // dynamic data stored by the Qlik Sense client
          title: "/qMetaDef/title",
          description: "/qMetaDef/description",
          sheetId: "/sheetId",
          selectionFields: "/selectionFields",
          creationDate: "/creationDate",
        },
      },
    };

    const sessionObject = await app.createSessionObject(listObj);
    const sessionObjectLayout = await sessionObject.getLayout();
    const bookmarks = sessionObjectLayout.qBookmarkList.qItems;

    await app.destroySessionObject(sessionObject.id);

    return await Promise.all(
      bookmarks.map(async (bookmark) => {
        return await getBookmarkMeta(bookmark.qInfo.qId, "$", app);
      })
    );
  }
}

async function processObject(item, app: EngineAPI.IApp) {
  const obj = await app.getObject(item.qId);

  // embeddedsnapshot, snapshot, hiddenbookmark, story --> need to be handled differently
  const parent = await (obj as any)
    .getParent()
    .then(() => true)
    .catch(() => false);
  const children = await obj.getChildInfos();

  // parent-less objects - masterobject, sheet, appprops, LoadModel
  if (!parent && children.length > 0) return await obj.getFullPropertyTree();

  const prop = await obj.getProperties();

  return prop;
}
