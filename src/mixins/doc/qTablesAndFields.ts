export async function mGetTablesAndFields(): Promise<
  { table: string; field: string }[]
> {
  const _this: EngineAPI.IApp = this;

  const tables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return tables.qtr
    .map(function (t) {
      return t.qFields.map(function (f) {
        return { table: t.qName, field: f.qName };
      });
    })
    .flat();
}

export async function mGetTables(): Promise<string[]> {
  const _this: EngineAPI.IApp = this;

  const qTables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return qTables.qtr.map((t) => t.qName);
}

export async function mGetFields(): Promise<string[]> {
  const _this: EngineAPI.IApp = this;

  const qTables = await _this.getTablesAndKeys(
    {} as EngineAPI.ISize,
    {} as EngineAPI.ISize,
    0,
    true,
    false
  );

  return qTables.qtr
    .map(function (t) {
      return t.qFields.map(function (f) {
        return f.qName;
      });
    })
    .flat();
}

// TODO: option to specify if full data to be extracted (loop though all data pages)
export async function mCreateSessionListbox(
  fieldName: string,
  state?: string,
  type?: string
): Promise<{
  obj: EngineAPI.IGenericObject;
  layout: EngineAPI.IGenericBaseLayout;
  props: EngineAPI.IGenericObjectProperties;
}> {
  const _this: EngineAPI.IApp = this;

  const lbDef = {
    qInfo: {
      qId: "",
      qType: type ? type : "session-listbox",
    },
    field: {
      qListObjectDef: {
        qStateName: state ? state : "$",
        qDef: {
          qFieldDefs: [fieldName],
          qSortCriterias: [
            {
              qSortByState: 1,
              qExpression: {},
            },
          ],
        },
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qHeight: 10000,
            qWidth: 1,
          },
        ],
      },
    },
  };

  const obj = await _this.createSessionObject(lbDef);
  const [props, layout] = await Promise.all([
    await obj.getProperties(),
    await obj.getLayout(),
  ]);

  return {
    obj,
    layout,
    props,
  };
}
