import { IGenericBaseLayout } from "../../index.doc";

export interface IGenericBaseLayoutExt extends IGenericBaseLayout {
  field: {
    qListObject: {
      qDataPages: EngineAPI.INxDataPage[];
      qSize: EngineAPI.ISize;
      qStateName: string;
      qDimensionInfo: {
        qError?: EngineAPI.INxValidationError;
      };
    };
  };
}

async function iGetSelectionsNative(
  qDoc: EngineAPI.IApp
): Promise<EngineAPI.IGenericSelectionListLayout> {
  const lbDef: EngineAPI.IGenericSelectionListProperties = {
    qInfo: {
      qId: "",
      qType: "CurrentSelection",
    },
    qSelectionObjectDef: {},
  };

  const sessionObj = await qDoc.createSessionObject(lbDef);

  const selections = await sessionObj.getLayout();

  await qDoc.destroySessionObject(sessionObj.id);

  return selections;
}

export async function mSelectionsAll(): Promise<EngineAPI.ISelectionListObject> {
  const _this: EngineAPI.IApp = this;
  const selections = await iGetSelectionsNative(_this);

  return selections.qSelectionObject;
}

export async function mSelectionsFields(): Promise<string[]> {
  const _this: EngineAPI.IApp = this;

  const selections = await iGetSelectionsNative(_this);

  const fieldsSelected = selections.qSelectionObject.qSelections.map(function (
    s
  ) {
    return s.qField;
  });

  return fieldsSelected;
}

export async function mSelectionsSimple(): Promise<
  { field: string; values: string[] }[]
> {
  const _this: EngineAPI.IApp = this;
  const selections = await iGetSelectionsNative(_this);

  return selections.qSelectionObject.qSelections.map(function (s) {
    const values = s.qSelectedFieldSelectionInfo.map(function (f) {
      return f.qName;
    });

    return { field: s.qField, values };
  });
}

export async function mSelectionsSimpleGrouped(): Promise<
  { field: string; value: string }[]
> {
  const _this: EngineAPI.IApp = this;
  const selections = await iGetSelectionsNative(_this);

  return selections.qSelectionObject.qSelections
    .map(function (s) {
      return s.qSelectedFieldSelectionInfo.map(function (f) {
        return { field: s.qField, value: f.qName };
      });
    })
    .flat();
}

export async function mSelectInField(
  fieldName: string,
  values: any[],
  toggle?: boolean,
  state?: string
): Promise<boolean> {
  const _this: EngineAPI.IApp = this;

  if (!fieldName)
    throw new Error(`mSelectInField: "fieldName" parameter is required`);
  if (!values)
    throw new Error(`mSelectInField: "values" parameter is required`);

  const lbDef = {
    qInfo: {
      qId: "",
      qType: "session-listbox",
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

  const sessionObj = await _this.createSessionObject(lbDef);

  const layout = (await sessionObj.getLayout()) as IGenericBaseLayoutExt;

  if (layout.field?.qListObject.qDimensionInfo.qError?.qErrorCode)
    throw new Error(
      `Field "${fieldName}" do not exists. Error code: ${layout.field.qListObject.qDimensionInfo.qError.qErrorCode}`
    );

  const index: number[] = layout.field.qListObject.qDataPages[0].qMatrix
    .filter((m) => values.indexOf(m[0].qText) > -1)
    .map((e) => e[0].qElemNumber as number);

  const selection = await sessionObj.selectListObjectValues(
    "/field/qListObjectDef",
    index,
    toggle ? toggle : false
  );

  await _this.destroySessionObject(sessionObj.id);

  return selection;
}