export async function mVariableGetAll(
  showConfig?: boolean,
  showReserved?: boolean
): Promise<EngineAPI.INxVariableListItem[]> {
  const _this: EngineAPI.IApp = this;
  const objProp: EngineAPI.IGenericVariableListProperties = {
    qInfo: {
      qType: "VariableList",
    },
    qVariableListDef: {
      qData: {},
      qShowConfig: false,
      qShowReserved: false,
      qType: "variable",
    },
  };

  if (showConfig) objProp.qShowConfig = showConfig;
  if (showReserved) objProp.qShowReserved = showReserved;

  const sessionObj = await _this.createSessionObject(objProp);

  const layout =
    (await sessionObj.getLayout()) as EngineAPI.IGenericVariableListLayout;

  await _this.destroySessionObject(sessionObj.id);

  return (layout as any).qVariableList
    .qItems as EngineAPI.INxVariableListItem[];
}

export async function mVariableUpdateById(
  id: string,
  name?: string,
  definition?: string,
  comment?: string
): Promise<EngineAPI.IGenericVariableProperties> {
  const _this: EngineAPI.IApp = this;

  if (!id) throw new Error(`mVariableUpdateById: "id" parameter is required`);

  const variable = await _this.getVariableById(id);

  const variableProps = await variable.getProperties();

  if (name) variableProps.qName = name;
  if (definition) variableProps.qDefinition = definition;
  if (comment) variableProps.qComment = comment;

  const setProps = await variable.setProperties(variableProps);

  const newProps = await variable.getProperties();

  return newProps;
}

export async function mVariableUpdateByName(
  name: string,
  newName?: string,
  definition?: string,
  comment?: string
): Promise<EngineAPI.IGenericVariableProperties> {
  const _this: EngineAPI.IApp = this;

  if (!name)
    throw new Error(`mVariableUpdateByName: "name" parameter is required`);

  const variable = await _this.getVariableByName(name);

  const variableProps = await variable.getProperties();

  if (newName) variableProps.qName = newName;
  if (definition) variableProps.qDefinition = definition;
  if (comment) variableProps.qComment = comment;

  const setProps = await variable.setProperties(variableProps);

  const newProps = await variable.getProperties();

  return newProps;
}

export async function mVariableCreate(
  name: string,
  definition?: string,
  comment?: string
): Promise<EngineAPI.IGenericVariableProperties> {
  const _this: EngineAPI.IApp = this;

  if (!name) throw new Error(`mVariableCreate: "name" parameter is required`);

  const varProps = {
    qInfo: {
      qType: "variable",
    },
    qName: name,
    qDefinition: definition ? definition : "",
    qComment: comment ? comment : "",
    qIncludeInBookmark: false,
  };

  const created = await _this.createVariableEx(varProps);

  const variableInst = await _this.getVariableById((created as any).id);

  const props = await variableInst.getProperties();

  return props;
}
