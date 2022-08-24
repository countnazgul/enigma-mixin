export async function mExtensionObjectsAll() {
  const _this: EngineAPI.IApp = this;

  const allInfos = await _this.getAllInfos();

  const props = await _this.getAppProperties();

  return await filterOnlyExtensionObjects(this, props, allInfos);
}

async function filterOnlyExtensionObjects(
  qDoc: EngineAPI.IApp,
  props: EngineAPI.INxAppProperties,
  allObjects: EngineAPI.INxInfo[]
) {
  return await Promise.all(
    allObjects.map(async function (extObj) {
      const isReallyExtension = await realExtensionCheck(qDoc, extObj.qId);

      if (isReallyExtension.isExtension) {
        return {
          appId: qDoc.id,
          appName: props.qTitle,
          objId: isReallyExtension.qObjProps.qInfo.qId,
          objType: isReallyExtension.qObjProps.qInfo.qType,
          extName: isReallyExtension.qObjProps.extensionMeta.name,
          extVersion: isReallyExtension.qObjProps.version,
          extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
          extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
          extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
          qProps: isReallyExtension.qObjProps,
        };
      }
    })
  ).then(function (o) {
    // make sure we filter out all object which are not
    // native object but are not extensions as well
    return o.filter(function (a) {
      return a != undefined;
    });
  });
}

const realExtensionCheck = async function (
  qDoc: EngineAPI.IApp,
  objId: string
) {
  const nativeObjectTypes = [
    "barchart",
    "boxplot",
    "combochart",
    "distributionplot",
    "gauge",
    "histogram",
    "kpi",
    "linechart",
    "piechart",
    "pivot-table",
    "scatterplot",
    "table",
    "treemap",
    "extension",
    "map",
    "listbox",
    "filterpane",
    "title",
    "paragraph",
  ];

  const qObj = await qDoc.getObject(objId);

  const qObjProps = await qObj.getProperties();

  if (!qObjProps.visualization) return { isExtension: false };

  const isNative = nativeObjectTypes.indexOf(qObjProps.visualization);
  return {
    qObjProps,
    isExtension: isNative == -1 && qObjProps.extensionMeta ? true : false,
  };
};
