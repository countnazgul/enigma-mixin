export async function mEmptyApp(keepOneSelected?: boolean): Promise<void> {
  const _this: EngineAPI.IApp = this;

  const currentScript = await _this.getScript();

  if (keepOneSelected == undefined || keepOneSelected == false) {
    const replaceAndReload = await _this
      .setScript("exit script;")
      .then(() => _this.doReload())
      .then(() => _this.setScript(currentScript))
      .then(() => _this.doSave());

    return replaceAndReload;
  }

  let newScriptElements: string[] = ["Load"];

  const alwaysOneSelectedFields = await _this.mGetAlwaysOneSelectedFields();

  if (alwaysOneSelectedFields.length > 0) {
    alwaysOneSelectedFields.map((field, i) => {
      let suffix = i == alwaysOneSelectedFields.length - 1 ? "" : ",";
      newScriptElements.push(`'${new Date()}' as [${field}]${suffix}`);
    });

    newScriptElements.push("Autogenerate(1);");
    newScriptElements.push("exit script;");
  } else {
    newScriptElements = ["exit script;"];
  }

  const newScript = newScriptElements.join("\n");

  const replaceAndReload = await _this
    .setScript(newScript)
    .then(() => _this.doReload())
    .then(() => _this.setScript(currentScript))
    .then(() => _this.doSave());

  return replaceAndReload;
}
